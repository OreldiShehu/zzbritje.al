const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Referral = require('../models/Referral');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse } = require('../utils/helpers');

exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('preferences.categories', 'name slug icon')
    .populate('referredBy', 'firstName lastName avatar');
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const restricted = ['password', 'role', 'email', 'isBlocked', 'isActive', 'walletBalance', 'loyaltyPoints', 'referralCode', 'loginAttempts'];
  restricted.forEach((f) => delete req.body[f]);

  if (req.file) req.body.avatar = req.file.path;

  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: user });
});

exports.updateEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const isCorrect = await user.comparePassword(req.body.password);
  if (!isCorrect) return next(new AppError('Current password is incorrect.', 401));

  const existing = await User.findOne({ email: req.body.email });
  if (existing) return next(new AppError('Email already in use.', 409));

  user.email = req.body.email;
  user.isEmailVerified = false;
  const token = user.generateEmailVerificationToken();
  await user.save();

  const { sendEmail, templates } = require('../utils/email');
  await sendEmail({ to: user.email, ...templates.verifyEmail(user, token) });

  res.status(200).json({ success: true, message: 'Email updated. Please verify your new email.' });
});

exports.getWishlist = catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const { skip } = paginate(null, page, limit);

  const [favorites, total] = await Promise.all([
    Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate({ path: 'deal', populate: [{ path: 'business', select: 'name slug logo city' }, { path: 'category', select: 'name slug icon' }] }),
    Favorite.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(favorites.map((f) => f.deal), total, page, limit) });
});

exports.getReferrals = catchAsync(async (req, res) => {
  const referrals = await Referral.find({ referrer: req.user.id })
    .populate('referred', 'firstName lastName avatar createdAt')
    .sort({ createdAt: -1 });

  const stats = {
    total: referrals.length,
    qualified: referrals.filter((r) => r.status === 'qualified' || r.status === 'rewarded').length,
    earnings: referrals.reduce((sum, r) => sum + (r.status === 'rewarded' ? r.rewardAmount : 0), 0),
  };

  res.status(200).json({ success: true, data: { referrals, stats, referralCode: req.user.referralCode } });
});

exports.getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = { user: req.user.id, isDeleted: false };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user.id, isRead: false, isDeleted: false }),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(notifications, total, page, limit), unreadCount });
});

exports.markNotificationsRead = catchAsync(async (req, res) => {
  const { notificationIds } = req.body;
  const filter = { user: req.user.id };
  if (notificationIds?.length) filter._id = { $in: notificationIds };

  await Notification.updateMany(filter, { isRead: true, readAt: new Date() });
  res.status(200).json({ success: true, message: 'Notifications marked as read.' });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isDeleted: true }
  );
  if (!notification) return next(new AppError('Notification not found.', 404));
  res.status(200).json({ success: true, message: 'Notification deleted.' });
});

exports.updateNotificationPreferences = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 'preferences.notifications': req.body },
    { new: true }
  );
  res.status(200).json({ success: true, data: user.preferences.notifications });
});

exports.getUserStats = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const Voucher = require('../models/Voucher');

  const [activeVouchers, redeemedVouchers, expiredVouchers, favoriteCount] = await Promise.all([
    Voucher.countDocuments({ user: req.user.id, status: 'active' }),
    Voucher.countDocuments({ user: req.user.id, status: 'redeemed' }),
    Voucher.countDocuments({ user: req.user.id, status: 'expired' }),
    Favorite.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      loyalty: { points: user.loyaltyPoints, level: user.loyaltyLevel, badges: user.badges },
      wallet: { balance: user.walletBalance },
      savings: { total: user.totalSaved, spent: user.totalSpent },
      vouchers: { active: activeVouchers, redeemed: redeemedVouchers, expired: expiredVouchers },
      favorites: favoriteCount,
      referrals: { count: user.referralCount, earnings: user.referralEarnings },
      reviews: user.reviewsWritten,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const isCorrect = await user.comparePassword(req.body.password);
  if (!isCorrect) return next(new AppError('Incorrect password.', 401));

  // Soft delete
  user.isActive = false;
  user.deletedAt = new Date();
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Account deleted successfully.' });
});
