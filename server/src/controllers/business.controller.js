const Business = require('../models/Business');
const User = require('../models/User');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse, createAuditLog } = require('../utils/helpers');
const { emitToUser, emitToAdmin } = require('../config/socket');

exports.createBusiness = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'business') {
    return next(new AppError('Only business accounts can create business profiles.', 403));
  }

  const existing = await Business.findOne({ owner: req.user.id });
  if (existing) return next(new AppError('You already have a business profile.', 409));

  if (!req.body.contractAgreed || req.body.contractAgreed === 'false') {
    return next(new AppError('Duhet të pranoni kontratën e platformës para se të vazhdoni.', 400));
  }

  const logo = req.files?.logo?.[0]?.path || null;
  if (!logo) return next(new AppError('Foto e biznesit është e detyrueshme.', 400));

  const commissionRate = 0; // Business pays 0% — platform earns from 7% customer markup

  if (req.body.lat && req.body.lng) {
    req.body.location = { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] };
    delete req.body.lat;
    delete req.body.lng;
  }

  const business = await Business.create({
    ...req.body,
    owner: req.user.id,
    logo,
    commissionRate,
    verificationStatus: 'pending',
    contract: {
      signed: true,
      signedAt: new Date(),
      signedByUser: req.user.id,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      version: 'v1.0',
      commissionRate,
      markupRate: 0.09,
    },
  });

  await User.findByIdAndUpdate(req.user.id, { businessId: business._id });
  await createAuditLog({ actor: req.user, action: 'create_business', resource: 'Business', resourceId: business._id, req });

  // Welcome notification with onboarding info
  try {
    const notification = await Notification.create({
      user: req.user.id,
      type: 'system',
      title: `Mirë se vini, ${business.name}! 🎉`,
      message: `Profili juaj u krijua me sukses. Ja çfarë duhet të dini:\n\n` +
        `📌 Si funksionon platforma:\n` +
        `• Ju krijoni deal-e me çmimin tuaj bazë\n` +
        `• Klientët blejnë kuponin online dhe vijnë fizikisht tek ju\n` +
        `• Klienti paguan direkt tek ju kur paraqet kuponin\n\n` +
        `💰 Tarifa e platformës:\n` +
        `• Platforma shton 9% markup mbi çmimin tuaj bazë — paguhet nga klienti\n` +
        `• Ju merrni çmimin tuaj bazë të plotë, pa asnjë komision\n` +
        `• Plani Falas: 2 deals aktive + 10 kupon/deal, pa kosto mujore\n` +
        `• Plani Pro (1,500 ALL/muaj): deals dhe kupon të pakufizuara\n\n` +
        `✅ Hapat e ardhshëm:\n` +
        `1. Plotësoni profilin e biznesit tuaj (logo, adresë, telefon)\n` +
        `2. Krijoni dealin tuaj të parë nga seksioni "Deal-et"\n` +
        `3. Ndani linkun me klientët tuaj\n\n` +
        `Për çdo pyetje, ekipi ynë është gjithmonë në dispozicion. Suksese! 🚀`,
      isRead: false,
    });
    try { emitToUser(req.user.id.toString(), 'notification', notification); } catch {}
  } catch {}

  // Notify all admin users about the new business
  try {
    const adminUsers = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id').lean();
    const adminNotifications = await Promise.all(
      adminUsers.map((admin) =>
        Notification.create({
          user: admin._id,
          type: 'system',
          title: 'Biznes i Ri Regjistrohet',
          message: `"${business.name}" nga ${req.user.firstName} ${req.user.lastName} (${req.user.email}) kërkon verifikim.`,
          business: business._id,
          actionUrl: '/admin/businesses',
          actionLabel: 'Shiko & Verifiko',
          priority: 'high',
        })
      )
    );
    adminNotifications.forEach((n) => {
      try { emitToAdmin('notification', n); } catch {}
    });
  } catch {}

  res.status(201).json({ success: true, data: business, message: 'Business profile created successfully.' });
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

  if (req.files?.logo) req.body.logo = req.files.logo[0].path;
  if (req.files?.coverImage) req.body.coverImage = req.files.coverImage[0].path;

  if (req.body.lat && req.body.lng) {
    req.body.location = { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] };
    delete req.body.lat;
    delete req.body.lng;
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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalVouchers, redeemedVouchers, activeVouchers,
    rawChartData, allTimeAgg, thisMonthAgg, lastMonthAgg, topDeals,
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
      { $group: { _id: null, businessNet: { $sum: '$businessAmount' }, totalCollected: { $sum: '$subtotal' }, commissionPaid: { $sum: '$commissionAmount' }, vouchersSold: { $sum: '$quantity' } } },
    ]),
    Transaction.aggregate([
      { $match: { business: business._id, paymentStatus: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, businessNet: { $sum: '$businessAmount' }, totalCollected: { $sum: '$subtotal' } } },
    ]),
    Transaction.aggregate([
      { $match: { business: business._id, paymentStatus: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, businessNet: { $sum: '$businessAmount' } } },
    ]),
    Deal.find({ business: business._id }).sort({ soldVouchers: -1 }).limit(5).select('title soldVouchers revenue businessPrice discountedPrice averageRating images views').lean(),
  ]);

  const allTime = allTimeAgg[0] || {};
  const thisMonthData = thisMonthAgg[0] || {};
  const lastMonthNet = lastMonthAgg[0]?.businessNet || 0;
  const thisMonthNet = thisMonthData.businessNet || 0;
  const change = lastMonthNet > 0 ? Math.round(((thisMonthNet - lastMonthNet) / lastMonthNet) * 100) : null;

  // Rename _id → date for chart
  const chartData = rawChartData.map(({ _id, revenue, count }) => ({ date: _id, revenue, count }));

  res.status(200).json({
    success: true,
    data: {
      business: { name: business.name, verificationStatus: business.verificationStatus, averageRating: business.averageRating, plan: business.plan },
      vouchers: { total: totalVouchers, redeemed: redeemedVouchers, active: activeVouchers },
      revenue: {
        businessNet: allTime.businessNet || 0,
        totalCollected: allTime.totalCollected || 0,
        commissionPaid: allTime.commissionPaid || 0,
        markupAmount: Math.max(0, (allTime.totalCollected || 0) - (allTime.businessNet || 0)),
        platformFee: (allTime.markupAmount || 0) + (allTime.commissionPaid || 0),
        vouchersSold: allTime.vouchersSold || 0,
        thisMonth: thisMonthNet,
        thisMonthCollected: thisMonthData.totalCollected || 0,
        lastMonth: lastMonthNet,
        change,
        // aliases
        total: allTime.businessNet || 0,
      },
      views: business.profileViews || 0,
      chartData,
      topDeals: topDeals.map((d) => ({
        ...d,
        conversionRate: d.views > 0 ? Math.round((d.soldVouchers / d.views) * 100) : 0,
      })),
      commissionRate: 0,
      markupRate: 0.09,
    },
  });
});
