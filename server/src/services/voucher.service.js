const Voucher = require('../models/Voucher');
const Deal = require('../models/Deal');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Business = require('../models/Business');
const Notification = require('../models/Notification');
const { generateQRCode, generateVoucherQRData } = require('../utils/qrcode');
const { sendEmail, templates } = require('../utils/email');
const { calculateLoyaltyPoints } = require('../utils/helpers');
const { emitToUser } = require('../config/socket');

const AppError = require('../utils/AppError');

async function createVoucherPurchase({ dealId, userId, quantity, paymentMethod, paymentIntentId, ipAddress }) {
  const deal = await Deal.findById(dealId).populate('business');
  const user = await User.findById(userId);

  // Enforce monthly voucher cap (10 per deal per month)
  const monthlyLimit = deal.maxVouchersPerMonth || 10;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const soldThisMonth = await Voucher.countDocuments({
    deal: dealId,
    createdAt: { $gte: startOfMonth },
  });
  if (soldThisMonth + quantity > monthlyLimit) {
    const remaining = Math.max(0, monthlyLimit - soldThisMonth);
    throw new AppError(
      remaining === 0
        ? 'Ky deal ka arritur limitin mujor të voucher-ave.'
        : `Mund të blini maksimumi ${remaining} voucher të tjerë këtë muaj për këtë deal.`,
      400
    );
  }

  // Revenue split:
  // Customer pays: discountedPrice (businessPrice + 7% markup)
  // Platform keeps: platformMarkup (7% of businessPrice)
  // Business gets: businessPrice in full (0% commission)
  const businessPrice = deal.businessPrice || Math.round(deal.discountedPrice / 1.15);
  const customerPrice = deal.discountedPrice;
  const platformMarkup = deal.platformMarkup || 0;
  const commissionAmount = 0;
  const businessAmount = businessPrice * quantity;
  const subtotal = customerPrice * quantity;
  const total = subtotal;

  const transaction = await Transaction.create({
    user: userId,
    deal: deal._id,
    business: deal.business._id,
    paymentMethod,
    paymentIntentId,
    subtotal,
    total,
    currency: deal.currency,
    commissionRate: 0,
    commissionAmount: 0,
    businessAmount,
    platformMarkup: platformMarkup * quantity,
    quantity,
    pointsEarned: calculateLoyaltyPoints(total),
    paymentStatus: 'completed',
    completedAt: new Date(),
    ipAddress,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (deal.expirationAfterPurchase || 30));

  const voucherPromises = [];
  for (let i = 0; i < quantity; i++) {
    const code = Voucher.generateCode();
    const voucherData = {
      deal: deal._id,
      user: userId,
      business: deal.business._id,
      transaction: transaction._id,
      code,
      originalPrice: deal.originalPrice,
      paidPrice: customerPrice,
      discountAmount: deal.savingsAmount,
      commissionAmount: 0,
      businessEarning: businessPrice,
      expiresAt,
      status: 'active',
    };

    try {
      const qrData = generateVoucherQRData({ ...voucherData, _id: new (require('mongoose').Types.ObjectId)() });
      const qr = await generateQRCode(qrData);
      voucherData.qrCodeData = JSON.stringify(qrData);
      voucherData.qrCodeImage = qr.imageUrl;
    } catch {}

    voucherPromises.push(Voucher.create(voucherData));
  }

  const vouchers = await Promise.all(voucherPromises);
  transaction.vouchers = vouchers.map((v) => v._id);
  await transaction.save();

  await Deal.findByIdAndUpdate(deal._id, {
    $inc: { soldVouchers: quantity, conversions: quantity, revenue: total },
    ...(deal.remainingVouchers - quantity <= 0 ? { status: 'sold_out' } : {}),
  });

  await Business.findByIdAndUpdate(deal.business._id, {
    $inc: { totalVouchersSold: quantity, totalRevenue: businessAmount },
  });

  await User.findByIdAndUpdate(userId, {
    $inc: {
      loyaltyPoints: calculateLoyaltyPoints(total),
      totalSpent: total,
      totalSaved: deal.savingsAmount * quantity,
      vouchersPurchased: quantity,
    },
  });

  try {
    await sendEmail({ to: user.email, ...templates.voucherPurchased(user, vouchers[0], deal) });
  } catch {}

  const notification = await Notification.create({
    user: userId,
    type: 'voucher_purchased',
    title: 'Blerja u krye me sukses!',
    message: `Voucher-i për "${deal.title}" u krijua. Kodi: ${vouchers[0].code}`,
    deal: deal._id,
    voucher: vouchers[0]._id,
    transaction: transaction._id,
  });

  try { emitToUser(userId.toString(), 'notification', notification); } catch {}

  return {
    transaction,
    vouchers: vouchers.map((v) => ({
      id: v._id, code: v.code, qrCodeImage: v.qrCodeImage, expiresAt: v.expiresAt,
    })),
    pointsEarned: calculateLoyaltyPoints(total),
  };
}

module.exports = { createVoucherPurchase };
