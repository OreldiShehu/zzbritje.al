const axios = require('axios');
const Transaction = require('../models/Transaction');
const Deal = require('../models/Deal');
const User = require('../models/User');
const Voucher = require('../models/Voucher');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse } = require('../utils/helpers');
const { createVoucherPurchase } = require('../services/voucher.service');

// Albanian Lek → EUR conversion rate (update periodically)
const ALL_TO_EUR = 0.0093; // 1 ALL ≈ 0.0093 EUR

function getPayPalBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalToken() {
  const base = getPayPalBase();
  const res = await axios.post(
    `${base}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return { token: res.data.access_token, base };
}

exports.createPayPalOrder = catchAsync(async (req, res, next) => {
  const { dealId, quantity = 1 } = req.body;

  const deal = await Deal.findById(dealId);
  if (!deal) return next(new AppError('Deal not found.', 404));
  if (deal.status !== 'active') return next(new AppError('Deal not available.', 400));

  const totalALL = deal.discountedPrice * quantity;
  const totalEUR = (totalALL * ALL_TO_EUR).toFixed(2);

  const { token, base } = await getPayPalToken();

  const order = await axios.post(
    `${base}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `${dealId}-${quantity}-${req.user.id}`,
        description: deal.title.substring(0, 127),
        amount: {
          currency_code: 'EUR',
          value: totalEUR,
        },
      }],
      application_context: {
        brand_name: 'Zbritje.al',
        locale: 'sq-AL',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  res.status(201).json({ success: true, orderId: order.data.id });
});

exports.capturePayPalOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { dealId, quantity = 1 } = req.body;

  if (!dealId) return next(new AppError('dealId is required.', 400));

  const deal = await Deal.findById(dealId);
  if (!deal) return next(new AppError('Deal not found.', 404));
  if (deal.status !== 'active') return next(new AppError('Deal not available.', 400));
  if (deal.remainingVouchers < quantity) {
    return next(new AppError(`Only ${deal.remainingVouchers} vouchers remaining.`, 400));
  }

  // Verify existing purchase limit
  const existingPurchases = await Voucher.countDocuments({ user: req.user.id, deal: dealId });
  if (existingPurchases + quantity > deal.maxPerCustomer) {
    return next(new AppError(`Maximum ${deal.maxPerCustomer} voucher(s) per customer.`, 400));
  }

  // Capture with PayPal
  const { token, base } = await getPayPalToken();
  let capture;
  try {
    const captureRes = await axios.post(
      `${base}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    capture = captureRes.data;
  } catch (err) {
    const msg = err.response?.data?.message || 'PayPal capture failed.';
    return next(new AppError(msg, 400));
  }

  if (capture.status !== 'COMPLETED') {
    return next(new AppError('Payment was not completed.', 400));
  }

  // Create vouchers
  const result = await createVoucherPurchase({
    dealId,
    userId: req.user.id,
    quantity,
    paymentMethod: 'paypal',
    paymentIntentId: orderId,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: 'Blerja u krye me sukses!',
    data: result,
  });
});

exports.requestRefund = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.transactionId)
    .populate('vouchers');

  if (!transaction) return next(new AppError('Transaction not found.', 404));
  if (!transaction.user.equals(req.user.id)) return next(new AppError('Not authorized.', 403));
  if (transaction.paymentStatus !== 'completed') return next(new AppError('Cannot refund this transaction.', 400));
  if (transaction.refundStatus !== 'none') return next(new AppError('Refund already requested.', 400));

  const daysSincePurchase = (Date.now() - transaction.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSincePurchase > 14) return next(new AppError('Refund window (14 days) has expired.', 400));

  const hasRedeemedVoucher = transaction.vouchers?.some((v) => v.status === 'redeemed');
  if (hasRedeemedVoucher) return next(new AppError('Cannot refund a redeemed voucher.', 400));

  transaction.refundStatus = 'pending';
  transaction.refundReason = req.body.reason;
  transaction.refundAmount = transaction.total;
  transaction.refundRequestedAt = new Date();
  await transaction.save();

  res.status(200).json({ success: true, message: 'Refund request submitted. Will be processed within 3-5 business days.' });
});

exports.processRefund = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.transactionId).populate('vouchers');
  if (!transaction) return next(new AppError('Transaction not found.', 404));
  if (transaction.refundStatus !== 'pending') return next(new AppError('No pending refund for this transaction.', 400));

  const { approve, amount } = req.body;

  if (!approve) {
    transaction.refundStatus = 'rejected';
    await transaction.save();
    return res.status(200).json({ success: true, message: 'Refund rejected.' });
  }

  const refundAmount = amount || transaction.total;

  if (transaction.paymentIntentId && transaction.paymentMethod === 'paypal') {
    try {
      const captureId = transaction.captureId || transaction.paymentIntentId;
      const { token, base } = await getPayPalToken();
      await axios.post(
        `${base}/v2/payments/captures/${captureId}/refund`,
        { amount: { value: (refundAmount * ALL_TO_EUR).toFixed(2), currency_code: 'EUR' } },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return next(new AppError(`PayPal refund failed: ${err.response?.data?.message || err.message}`, 500));
    }
  } else {
    await User.findByIdAndUpdate(transaction.user, { $inc: { walletBalance: refundAmount } });
  }

  transaction.refundStatus = 'completed';
  transaction.refundAmount = refundAmount;
  transaction.refundCompletedAt = new Date();
  transaction.paymentStatus = 'refunded';
  await transaction.save();

  await require('../models/Voucher').updateMany(
    { transaction: transaction._id, status: 'active' },
    { status: 'refunded' }
  );

  res.status(200).json({ success: true, message: `Refund of ${refundAmount} ALL processed.` });
});

exports.getAdminTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 25, status, search } = req.query;
  const { skip } = paginate(null, page, limit);

  const filter = {};
  if (status) filter.paymentStatus = status;
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [transactions, total, summaryAgg] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('user', 'firstName lastName email')
      .populate('deal', 'title')
      .populate('business', 'name')
      .lean(),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          commission: { $sum: { $max: [{ $subtract: [{ $ifNull: ['$total', 0] }, { $ifNull: ['$businessAmount', 0] }] }, 0] } },
          refunds: { $sum: '$refundAmount' },
        },
      },
    ]),
  ]);

  const summary = summaryAgg[0] || { total: 0, commission: 0, refunds: 0 };

  res.status(200).json({
    success: true,
    summary,
    ...buildPaginatedResponse(transactions, total, page, limit),
  });
});

exports.getMyTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip } = paginate(null, page, limit);

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('deal', 'title images discountPercentage')
      .populate('business', 'name logo'),
    Transaction.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(transactions, total, page, limit) });
});

exports.getTransactionDetails = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('deal', 'title images description')
    .populate('business', 'name logo address phone')
    .populate('vouchers', 'code status expiresAt qrCodeImage');

  if (!transaction) return next(new AppError('Transaction not found.', 404));
  if (!transaction.user.equals(req.user.id) && req.user.role !== 'admin') {
    return next(new AppError('Not authorized.', 403));
  }

  res.status(200).json({ success: true, data: transaction });
});
