const Voucher = require('../models/Voucher');
const Deal = require('../models/Deal');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Business = require('../models/Business');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateQRCode, generateVoucherQRData } = require('../utils/qrcode');
const { sendEmail, templates } = require('../utils/email');
const { paginate, buildPaginatedResponse, calculateLoyaltyPoints, createAuditLog } = require('../utils/helpers');
const { emitToUser } = require('../config/socket');

exports.purchaseVoucher = catchAsync(async (req, res, next) => {
  const { dealId, quantity = 1, paymentMethod, paymentIntentId, useWallet } = req.body;

  const deal = await Deal.findById(dealId).populate('business');
  if (!deal) return next(new AppError('Deal not found.', 404));
  if (deal.status !== 'active') return next(new AppError('This deal is no longer available.', 400));
  if (new Date() > deal.endDate) return next(new AppError('This deal has expired.', 400));
  if (deal.remainingVouchers < quantity) {
    return next(new AppError(`Only ${deal.remainingVouchers} vouchers remaining.`, 400));
  }

  // Check per-customer limit
  const existingPurchases = await Voucher.countDocuments({ user: req.user.id, deal: dealId });
  if (existingPurchases + quantity > deal.maxPerCustomer) {
    return next(new AppError(`Maximum ${deal.maxPerCustomer} voucher(s) per customer.`, 400));
  }

  const user = await User.findById(req.user.id);
  const subtotal = deal.discountedPrice * quantity;
  let walletUsed = 0;
  if (useWallet && user.walletBalance > 0) {
    walletUsed = Math.min(user.walletBalance, subtotal);
  }
  const total = subtotal - walletUsed;

  const commissionAmount = total * deal.commissionRate;
  const businessAmount = total - commissionAmount;

  // Create transaction
  const transaction = await Transaction.create({
    user: user._id,
    deal: deal._id,
    business: deal.business._id,
    paymentMethod,
    paymentIntentId,
    subtotal,
    walletUsed,
    total,
    currency: deal.currency,
    commissionRate: deal.commissionRate,
    commissionAmount,
    businessAmount,
    quantity,
    pointsEarned: calculateLoyaltyPoints(total),
    paymentStatus: 'completed',
    completedAt: new Date(),
    ipAddress: req.ip,
  });

  // Generate vouchers
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (deal.expirationAfterPurchase || 30));

  const voucherPromises = [];
  for (let i = 0; i < quantity; i++) {
    const code = Voucher.generateCode();
    const voucherData = {
      deal: deal._id,
      user: user._id,
      business: deal.business._id,
      transaction: transaction._id,
      code,
      originalPrice: deal.originalPrice,
      paidPrice: deal.discountedPrice,
      discountAmount: deal.savingsAmount,
      commissionAmount: deal.discountedPrice * deal.commissionRate,
      businessEarning: deal.discountedPrice * (1 - deal.commissionRate),
      expiresAt,
      status: 'active',
    };

    // Generate QR code
    const qrData = generateVoucherQRData({ ...voucherData, code });
    try {
      const qr = await generateQRCode(qrData);
      voucherData.qrCodeData = JSON.stringify(qrData);
      voucherData.qrCodeImage = qr.imageUrl;
    } catch {}

    voucherPromises.push(Voucher.create(voucherData));
  }

  const vouchers = await Promise.all(voucherPromises);
  transaction.vouchers = vouchers.map((v) => v._id);
  await transaction.save();

  // Update deal sold count
  await Deal.findByIdAndUpdate(deal._id, {
    $inc: { soldVouchers: quantity, conversions: quantity, revenue: total },
    ...(deal.remainingVouchers - quantity <= 0 ? { status: 'sold_out' } : {}),
  });

  // Update business stats
  await Business.findByIdAndUpdate(deal.business._id, {
    $inc: { totalVouchersSold: quantity, totalRevenue: businessAmount },
  });

  // Update user stats
  await User.findByIdAndUpdate(user._id, {
    $inc: {
      loyaltyPoints: calculateLoyaltyPoints(total),
      walletBalance: -walletUsed,
      totalSpent: total,
      totalSaved: deal.savingsAmount * quantity,
      vouchersPurchased: quantity,
    },
  });

  // Send confirmation email
  try {
    await sendEmail({ to: user.email, ...templates.voucherPurchased(user, vouchers[0], deal) });
  } catch {}

  // Create notification
  const notification = await Notification.create({
    user: user._id,
    type: 'voucher_purchased',
    title: 'Blerja u krye me sukses!',
    message: `Voucher-i për "${deal.title}" u krijua. Kodi: ${vouchers[0].code}`,
    deal: deal._id,
    voucher: vouchers[0]._id,
    transaction: transaction._id,
  });

  emitToUser(user._id.toString(), 'notification', notification);

  await createAuditLog({
    actor: req.user, action: 'purchase_voucher', resource: 'Voucher',
    resourceId: vouchers[0]._id, req, description: `Purchased ${quantity} voucher(s) for "${deal.title}"`,
  });

  res.status(201).json({
    success: true,
    message: 'Voucher(s) purchased successfully!',
    data: {
      transaction: transaction._id,
      vouchers: vouchers.map((v) => ({
        id: v._id, code: v.code, qrCodeImage: v.qrCodeImage, expiresAt: v.expiresAt,
      })),
      pointsEarned: calculateLoyaltyPoints(total),
    },
  });
});

exports.getMyVouchers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = { user: req.user.id };
  if (status) filter.status = status;

  const [vouchers, total] = await Promise.all([
    Voucher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('deal', 'title slug images originalPrice discountedPrice')
      .populate('business', 'name slug logo city address phone'),
    Voucher.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(vouchers, total, page, limit) });
});

exports.getVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findOne({ code: req.params.code })
    .populate('deal', 'title description termsAndConditions redemptionInstructions images')
    .populate('business', 'name slug logo city address phone')
    .populate('user', 'firstName lastName email');

  if (!voucher) return next(new AppError('Voucher not found.', 404));
  if (!voucher.user._id.equals(req.user.id) && req.user.role !== 'admin' && req.user.role !== 'business') {
    return next(new AppError('Not authorized.', 403));
  }

  res.status(200).json({ success: true, data: voucher });
});

exports.redeemVoucher = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const voucher = await Voucher.findOne({ code })
    .populate('deal', 'title')
    .populate('user', 'firstName lastName email');

  if (!voucher) return next(new AppError('Voucher not found.', 404));

  const business = await Business.findOne({ owner: req.user.id });
  if (!business || !voucher.business.equals(business._id)) {
    return next(new AppError('Not authorized to redeem this voucher.', 403));
  }

  if (voucher.status === 'redeemed') {
    return next(new AppError('This voucher has already been redeemed.', 400));
  }
  if (voucher.status === 'expired' || new Date() > voucher.expiresAt) {
    voucher.status = 'expired';
    await voucher.save();
    return next(new AppError('This voucher has expired.', 400));
  }
  if (voucher.status === 'cancelled' || voucher.status === 'refunded') {
    return next(new AppError('This voucher is no longer valid.', 400));
  }

  voucher.status = 'redeemed';
  voucher.redeemedAt = new Date();
  voucher.redeemedBy = req.user.id;
  if (req.body.location) voucher.redemptionLocation = req.body.location;
  await voucher.save();

  // Notify voucher owner
  const notification = await Notification.create({
    user: voucher.user._id,
    type: 'voucher_redeemed',
    title: 'Voucher-i u përdor!',
    message: `Voucher-i juaj "${voucher.deal.title}" u përdor me sukses.`,
    voucher: voucher._id,
  });
  emitToUser(voucher.user._id.toString(), 'notification', notification);

  await createAuditLog({
    actor: req.user, action: 'redeem_voucher', resource: 'Voucher',
    resourceId: voucher._id, req,
  });

  res.status(200).json({
    success: true,
    message: 'Voucher redeemed successfully!',
    data: {
      voucher: { code: voucher.code, redeemedAt: voucher.redeemedAt },
      customer: { name: voucher.user.fullName, email: voucher.user.email },
      deal: voucher.deal.title,
    },
  });
});

exports.validateVoucher = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const voucher = await Voucher.findOne({ code })
    .populate('deal', 'title originalPrice discountedPrice')
    .populate('user', 'firstName lastName avatar')
    .populate('business', 'name');

  if (!voucher) return next(new AppError('Voucher not found.', 404));

  const business = await Business.findOne({ owner: req.user.id });
  if (!business || !voucher.business._id.equals(business._id)) {
    return next(new AppError('Not authorized.', 403));
  }

  const isValid = voucher.status === 'active' && new Date() <= voucher.expiresAt;

  res.status(200).json({
    success: true,
    data: {
      isValid,
      status: voucher.status,
      voucher: {
        code: voucher.code,
        expiresAt: voucher.expiresAt,
        paidPrice: voucher.paidPrice,
        deal: voucher.deal,
        customer: voucher.user,
      },
    },
  });
});

exports.getBusinessVouchers = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return next(new AppError('Business not found.', 404));

  const { page = 1, limit = 20, status } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = { business: business._id };
  if (status) filter.status = status;

  const [vouchers, total] = await Promise.all([
    Voucher.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('deal', 'title').populate('user', 'firstName lastName email avatar'),
    Voucher.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(vouchers, total, page, limit) });
});
