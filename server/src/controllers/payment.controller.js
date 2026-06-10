const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const Deal = require('../models/Deal');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse } = require('../utils/helpers');

exports.createStripePaymentIntent = catchAsync(async (req, res, next) => {
  const { dealId, quantity = 1, useWallet } = req.body;

  const deal = await Deal.findById(dealId);
  if (!deal) return next(new AppError('Deal not found.', 404));
  if (deal.status !== 'active') return next(new AppError('Deal not available.', 400));

  const user = await User.findById(req.user.id);
  let amount = deal.discountedPrice * quantity;
  let walletUsed = 0;

  if (useWallet && user.walletBalance > 0) {
    walletUsed = Math.min(user.walletBalance, amount);
    amount -= walletUsed;
  }

  if (amount <= 0) {
    return res.status(200).json({ success: true, useWalletOnly: true, walletUsed });
  }

  // Stripe uses smallest currency unit; ALL to cents approximation
  const amountInCents = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'all',
    automatic_payment_methods: { enabled: true },
    metadata: {
      dealId: deal._id.toString(),
      userId: user._id.toString(),
      quantity: quantity.toString(),
      walletUsed: walletUsed.toString(),
    },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount,
    walletUsed,
  });
});

exports.stripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      await Transaction.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { paymentStatus: 'completed', completedAt: new Date() }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Transaction.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { paymentStatus: 'failed', failureReason: pi.last_payment_error?.message }
      );
      break;
    }
    case 'charge.dispute.created': {
      const dispute = event.data.object;
      await Transaction.findOneAndUpdate(
        { paymentIntentId: dispute.payment_intent },
        { paymentStatus: 'disputed' }
      );
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
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

  if (transaction.paymentIntentId && transaction.paymentProvider === 'stripe') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: transaction.paymentIntentId,
        amount: Math.round(refundAmount * 100),
      });
      transaction.refundId = refund.id;
    } catch (err) {
      return next(new AppError(`Stripe refund failed: ${err.message}`, 500));
    }
  } else {
    await User.findByIdAndUpdate(transaction.user, { $inc: { walletBalance: refundAmount } });
  }

  transaction.refundStatus = 'completed';
  transaction.refundAmount = refundAmount;
  transaction.refundCompletedAt = new Date();
  transaction.paymentStatus = 'refunded';
  await transaction.save();

  // Cancel associated vouchers
  await require('../models/Voucher').updateMany(
    { transaction: transaction._id, status: 'active' },
    { status: 'refunded' }
  );

  res.status(200).json({ success: true, message: `Refund of ${refundAmount} ALL processed.` });
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
