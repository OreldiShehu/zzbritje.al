const Business = require('../models/Business');
const User = require('../models/User');
const Deal = require('../models/Deal');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse, createAuditLog } = require('../utils/helpers');

exports.createBusiness = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'business') {
    return next(new AppError('Only business accounts can create business profiles.', 403));
  }

  const existing = await Business.findOne({ owner: req.user.id });
  if (existing) return next(new AppError('You already have a business profile.', 409));

  const business = await Business.create({
    ...req.body,
    owner: req.user.id,
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.20,
    verificationStatus: 'verified',
    verifiedAt: new Date(),
  });

  await User.findByIdAndUpdate(req.user.id, { businessId: business._id });
  await createAuditLog({ actor: req.user, action: 'create_business', resource: 'Business', resourceId: business._id, req });

  res.status(201).json({ success: true, data: business, message: 'Business profile created. Pending verification.' });
});

exports.getMyBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id })
    .populate('category', 'name slug icon')
    .populate('subCategories', 'name slug');

  if (!business) return next(new AppError('Business profile not found.', 404));
  res.status(200).json({ success: true, data: business });
});

exports.updateMyBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return next(new AppError('Business not found.', 404));

  const restricted = ['commissionRate', 'verificationStatus', 'plan', 'stripeAccountId'];
  restricted.forEach((f) => delete req.body[f]);

  if (req.files?.logo) {
    req.body.logo = req.files.logo[0].path;
  }
  if (req.files?.coverImage) {
    req.body.coverImage = req.files.coverImage[0].path;
  }

  const updated = await Business.findByIdAndUpdate(business._id, req.body, { new: true, runValidators: true })
    .populate('category', 'name slug');

  res.status(200).json({ success: true, data: updated });
});

exports.getBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug icon')
    .populate('owner', 'firstName lastName avatar');

  if (!business) return next(new AppError('Business not found.', 404));

  await Business.findByIdAndUpdate(business._id, { $inc: { profileViews: 1 } });

  const activeDeals = await Deal.find({
    business: business._id, status: 'active', endDate: { $gt: new Date() },
  }).populate('category', 'name slug icon').limit(12).lean();

  res.status(200).json({ success: true, data: { ...business.toObject(), deals: activeDeals } });
});

exports.getAllBusinesses = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, city, category, verified, search } = req.query;
  const { skip } = paginate(null, page, limit);

  const filter = { isActive: true };
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (category) filter.category = category;
  if (verified === 'true') filter.verificationStatus = 'verified';
  if (search) filter.$text = { $search: search };

  const [businesses, total] = await Promise.all([
    Business.find(filter)
      .sort({ isFeatured: -1, averageRating: -1 })
      .skip(skip).limit(parseInt(limit))
      .populate('category', 'name slug icon')
      .lean(),
    Business.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(businesses, total, page, limit) });
});

exports.uploadBusinessDocuments = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return next(new AppError('Business not found.', 404));

  const docs = req.files?.map((f) => ({
    type: f.fieldname,
    url: f.path,
    uploadedAt: new Date(),
  })) || [];

  business.verificationDocuments.push(...docs);
  await business.save();

  res.status(200).json({ success: true, message: 'Documents uploaded. Admin will review shortly.', data: docs });
});

exports.getBusinessStats = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return next(new AppError('Business not found.', 404));

  const Voucher = require('../models/Voucher');
  const Transaction = require('../models/Transaction');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalVouchers, redeemedVouchers, pendingVouchers, recentTransactions,
    monthlyRevenue, topDeals,
  ] = await Promise.all([
    Voucher.countDocuments({ business: business._id }),
    Voucher.countDocuments({ business: business._id, status: 'redeemed' }),
    Voucher.countDocuments({ business: business._id, status: 'active' }),
    Transaction.aggregate([
      { $match: { business: business._id, createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$businessAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Transaction.aggregate([
      { $match: { business: business._id, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$businessAmount' } } },
    ]),
    Deal.find({ business: business._id }).sort({ soldVouchers: -1 }).limit(5).select('title soldVouchers revenue averageRating').lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      business: { name: business.name, verificationStatus: business.verificationStatus, averageRating: business.averageRating, plan: business.plan },
      vouchers: { total: totalVouchers, redeemed: redeemedVouchers, pending: pendingVouchers },
      revenue: { total: monthlyRevenue[0]?.total || 0, commissionPaid: business.platformCommissionPaid },
      recentTransactions,
      topDeals,
    },
  });
});
