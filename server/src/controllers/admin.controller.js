const User = require('../models/User');
const Business = require('../models/Business');
const Deal = require('../models/Deal');
const Voucher = require('../models/Voucher');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse, createAuditLog } = require('../utils/helpers');
const { emitToUser } = require('../config/socket');

exports.getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsersThisMonth, totalBusinesses, pendingBusinesses,
    totalDeals, activeDeals, totalVouchers, totalRevenue,
    recentTransactions, openTickets, dailyRevenue, userGrowth,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer', isActive: true }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: thirtyDaysAgo } }),
    Business.countDocuments(),
    Business.countDocuments({ verificationStatus: 'pending' }),
    Deal.countDocuments(),
    Deal.countDocuments({ status: 'active' }),
    Voucher.countDocuments(),
    Transaction.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
    Transaction.find({ createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'completed' })
      .populate('user', 'firstName lastName').populate('deal', 'title').sort({ createdAt: -1 }).limit(10),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$commissionAmount' }, transactions: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, role: 'customer' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalUsers, newUsersThisMonth, totalBusinesses, pendingBusinesses,
        totalDeals, activeDeals, totalVouchers,
        platformRevenue: totalRevenue[0]?.total || 0,
        openTickets,
      },
      charts: { dailyRevenue, userGrowth },
      recentTransactions,
    },
  });
});

// USERS
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive, isBlocked } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (search) filter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-password'),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(users, total, page, limit) });
});

exports.blockUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  if (user.role === 'admin' || user.role === 'superadmin') {
    return next(new AppError('Cannot block admin users.', 403));
  }
  user.isBlocked = !user.isBlocked;
  user.blockReason = user.isBlocked ? req.body.reason : undefined;
  await user.save({ validateBeforeSave: false });
  await createAuditLog({ actor: req.user, action: user.isBlocked ? 'block_user' : 'unblock_user', resource: 'User', resourceId: user._id, req, severity: 'warning' });
  res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}.` });
});

// BUSINESSES
exports.getAllBusinesses = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, city, search } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = {};
  if (status) filter.verificationStatus = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (search) filter.$text = { $search: search };

  const [businesses, total] = await Promise.all([
    Business.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('owner', 'firstName lastName email').populate('category', 'name'),
    Business.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(businesses, total, page, limit) });
});

exports.verifyBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id).populate('owner');
  if (!business) return next(new AppError('Business not found.', 404));

  business.verificationStatus = 'verified';
  business.verifiedAt = new Date();
  business.verifiedBy = req.user.id;
  await business.save();

  await User.findByIdAndUpdate(business.owner._id, { 'businessId': business._id });
  await createAuditLog({ actor: req.user, action: 'verify_business', resource: 'Business', resourceId: business._id, req });

  const notification = await Notification.create({
    user: business.owner._id,
    type: 'system',
    title: '✅ Biznesi juaj u verifikua!',
    message: `Biznesi "${business.name}" u verifikua me sukses nga ekipi i Zbritje.al. Tani mund të krijoni deal-e dhe të filloni të shitni voucher-ë!`,
  });
  emitToUser(business.owner._id.toString(), 'notification', notification);

  res.status(200).json({ success: true, message: 'Business verified.' });
});

exports.rejectBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id);
  if (!business) return next(new AppError('Business not found.', 404));
  business.verificationStatus = 'rejected';
  business.rejectionReason = req.body.reason;
  await business.save();
  await createAuditLog({ actor: req.user, action: 'reject_business', resource: 'Business', resourceId: business._id, req, severity: 'warning' });
  res.status(200).json({ success: true, message: 'Business rejected.' });
});

exports.updateBusinessPlan = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id).populate('owner');
  if (!business) return next(new AppError('Business not found.', 404));

  const { plan } = req.body;
  if (!['free', 'pro'].includes(plan)) return next(new AppError('Invalid plan.', 400));

  business.plan = plan;
  business.planExpiresAt = plan === 'pro' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;
  await business.save();

  await createAuditLog({ actor: req.user, action: 'update_business_plan', resource: 'Business', resourceId: business._id, req });

  const notification = await Notification.create({
    user: business.owner._id,
    type: 'system',
    title: plan === 'pro' ? '🎉 Plani Pro u aktivizua!' : 'Plani juaj u ndryshua',
    message: plan === 'pro'
      ? `Biznesi "${business.name}" u ngrit në planin Pro. Tani keni 20+ deals dhe vouchers të pakufizuara!`
      : `Biznesi "${business.name}" u kthye në planin Falas.`,
  });
  emitToUser(business.owner._id.toString(), 'notification', notification);

  res.status(200).json({ success: true, plan: business.plan, message: `Plan updated to ${plan}.` });
});

// CATEGORIES
exports.createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return next(new AppError('Category not found.', 404));
  res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found.', 404));
  const dealsCount = await Deal.countDocuments({ category: category._id });
  if (dealsCount > 0) return next(new AppError(`Cannot delete category with ${dealsCount} deals.`, 400));
  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted.' });
});

// COMMISSION
exports.updateCommissionSettings = catchAsync(async (req, res, next) => {
  const { businessId, commissionRate } = req.body;
  if (commissionRate < 0 || commissionRate > 1) return next(new AppError('Commission rate must be between 0 and 1.', 400));
  const business = await Business.findByIdAndUpdate(businessId,
    { commissionRate, commissionOverride: true }, { new: true });
  if (!business) return next(new AppError('Business not found.', 404));
  res.status(200).json({ success: true, data: business, message: 'Commission updated.' });
});

// DEALS
exports.getAllDealsAdmin = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, business, search } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = {};
  if (status) filter.status = status;
  if (business) filter.business = business;
  if (search) filter.$text = { $search: search };

  const [deals, total] = await Promise.all([
    Deal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('business', 'name slug').populate('category', 'name').populate('createdBy', 'firstName lastName'),
    Deal.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, ...buildPaginatedResponse(deals, total, page, limit) });
});

// SUPPORT TICKETS
exports.getAllTickets = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter).sort({ priority: -1, createdAt: 1 }).skip(skip).limit(parseInt(limit))
      .populate('user', 'firstName lastName email').populate('assignedTo', 'firstName lastName'),
    SupportTicket.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, ...buildPaginatedResponse(tickets, total, page, limit) });
});

exports.assignTicket = catchAsync(async (req, res, next) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { assignedTo: req.body.agentId, status: 'in_progress' },
    { new: true }
  ).populate('assignedTo', 'firstName lastName');
  if (!ticket) return next(new AppError('Ticket not found.', 404));
  res.status(200).json({ success: true, data: ticket });
});

// AUDIT LOGS
exports.getAuditLogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, action, severity } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = {};
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (severity) filter.severity = severity;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('actor', 'firstName lastName email role'),
    AuditLog.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, ...buildPaginatedResponse(logs, total, page, limit) });
});

exports.approveDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { status: 'active', approvedAt: new Date(), approvedBy: req.user.id },
    { new: true }
  ).populate('business', 'owner name');
  if (!deal) return next(new AppError('Deal not found.', 404));
  await Business.findByIdAndUpdate(deal.business._id, { $inc: { activeDeals: 1 } });

  if (deal.business?.owner) {
    const notification = await Notification.create({
      user: deal.business.owner,
      type: 'deal_approved',
      title: '🎉 Deal-i u aprovua!',
      message: `Deal-i juaj "${deal.title}" u aprovua dhe është tani aktiv në platformë. Klientët mund ta blejnë tani!`,
      deal: deal._id,
    });
    emitToUser(deal.business.owner.toString(), 'notification', notification);
  }

  res.status(200).json({ success: true, data: deal });
});

exports.rejectDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: req.body.reason },
    { new: true }
  );
  if (!deal) return next(new AppError('Deal not found.', 404));
  res.status(200).json({ success: true, data: deal });
});

exports.deleteDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));
  await Business.findByIdAndUpdate(deal.business, {
    $inc: { totalDeals: -1, activeDeals: deal.status === 'active' ? -1 : 0 },
  });
  await Deal.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Deal deleted.' });
});

exports.featureDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));
  deal.isFeatured = !deal.isFeatured;
  if (deal.isFeatured) deal.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await deal.save();
  res.status(200).json({ success: true, isFeatured: deal.isFeatured });
});

// FEATURE DEAL/BUSINESS
exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const { type, id } = req.params;
  const Model = type === 'deal' ? Deal : Business;
  const doc = await Model.findById(id);
  if (!doc) return next(new AppError(`${type} not found.`, 404));
  doc.isFeatured = !doc.isFeatured;
  if (doc.isFeatured) doc.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await doc.save();
  res.status(200).json({ success: true, isFeatured: doc.isFeatured });
});

exports.getCommissionTracker = catchAsync(async (req, res) => {
  // Pull commission from Transaction data — total owed = 5% business commission + 5% client markup
  const txStats = await Transaction.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$business',
        commissionFromSales: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$platformMarkup', 0] }] } },
        totalRevenue: { $sum: '$total' },
        vouchersSold: { $sum: '$quantity' },
      },
    },
  ]);

  const txMap = {};
  txStats.forEach((t) => { txMap[t._id.toString()] = t; });

  const businessIds = txStats.map((t) => t._id);
  const businesses = await Business.find({ _id: { $in: businessIds } })
    .select('name slug logo city plan commissionRate platformCommissionPaid totalVouchersRedeemed updatedAt')
    .lean();

  const data = businesses.map((b) => {
    const tx = txMap[b._id.toString()] || {};
    const commissionFromSales = tx.commissionFromSales || 0;
    const collected = b.platformCommissionPaid || 0;
    const commissionPending = Math.max(0, commissionFromSales - collected);
    return {
      _id: b._id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      city: b.city,
      plan: b.plan || 'free',
      commissionRate: b.commissionRate ?? 0,
      vouchersSold: tx.vouchersSold || 0,
      vouchersRedeemed: b.totalVouchersRedeemed || 0,
      totalRevenue: tx.totalRevenue || 0,
      commissionFromSales,
      commissionPaid: collected,
      commissionPending,
    };
  }).sort((a, b) => b.commissionPending - a.commissionPending);

  const totals = data.reduce((acc, b) => ({
    commissionFromSales: acc.commissionFromSales + b.commissionFromSales,
    commissionPaid: acc.commissionPaid + b.commissionPaid,
    commissionPending: acc.commissionPending + b.commissionPending,
  }), { commissionFromSales: 0, commissionPaid: 0, commissionPending: 0 });

  res.status(200).json({ success: true, data, totals });
});

exports.getBusinessFinances = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id)
    .select('name slug city phone email plan commissionRate platformCommissionPaid totalVouchersRedeemed');
  if (!business) return next(new AppError('Business not found.', 404));

  // Commission from Transaction data (all sales, not just redeemed)
  const txAgg = await Transaction.aggregate([
    { $match: { business: business._id, paymentStatus: 'completed' } },
    {
      $group: {
        _id: null,
        commissionFromSales: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$platformMarkup', 0] }] } },
        totalRevenue: { $sum: '$total' },
        vouchersSold: { $sum: '$quantity' },
      },
    },
  ]);
  const txData = txAgg[0] || { commissionFromSales: 0, totalRevenue: 0, vouchersSold: 0 };
  const collected = business.platformCommissionPaid || 0;
  const commissionDue = Math.max(0, txData.commissionFromSales - collected);

  // Per-deal financials from Transaction (includes both commission + markup)
  const txByDeal = await Transaction.aggregate([
    { $match: { business: business._id, paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$deal',
        totalCommission: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$platformMarkup', 0] }] } },
        totalPaidPrice: { $sum: '$total' },
        soldCount: { $sum: '$quantity' },
        commissionRate: { $first: '$commissionRate' },
      },
    },
  ]);

  // Voucher status counts per deal (active vs redeemed)
  const vouchers = await Voucher.find({ business: business._id, status: { $in: ['active', 'redeemed'] } })
    .populate('deal', 'title commissionRate')
    .lean();

  const statusMap = {};
  vouchers.forEach((v) => {
    const dealId = v.deal?._id?.toString() || 'unknown';
    if (!statusMap[dealId]) statusMap[dealId] = { dealTitle: v.deal?.title || 'Deal i fshirë', activeCount: 0, redeemedCount: 0 };
    if (v.status === 'redeemed') statusMap[dealId].redeemedCount++;
    else statusMap[dealId].activeCount++;
  });

  const dealMap = {};
  txByDeal.forEach((t) => {
    const dealId = t._id?.toString() || 'unknown';
    const s = statusMap[dealId] || { dealTitle: 'Deal i fshirë', activeCount: 0, redeemedCount: 0 };
    dealMap[dealId] = {
      dealId,
      dealTitle: s.dealTitle,
      commissionRate: 0.09, // 7% markup from customer (business pays 0%)
      soldCount: t.soldCount,
      activeCount: s.activeCount,
      redeemedCount: s.redeemedCount,
      totalPaidPrice: t.totalPaidPrice,
      totalCommission: t.totalCommission,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      business: {
        _id: business._id,
        name: business.name,
        city: business.city,
        phone: business.phone,
        email: business.email,
        plan: business.plan,
        commissionRate: business.commissionRate ?? 0,
      },
      summary: {
        vouchersSold: txData.vouchersSold,
        vouchersRedeemed: business.totalVouchersRedeemed || 0,
        totalRevenue: txData.totalRevenue,
        commissionFromSales: txData.commissionFromSales,
        commissionCollected: collected,
        commissionDue,
      },
      dealBreakdown: Object.values(dealMap),
    },
  });
});

exports.markCollected = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id);
  if (!business) return next(new AppError('Business not found.', 404));

  // Calculate outstanding from Transaction data — total = 5% commission + 5% markup
  const txAgg = await Transaction.aggregate([
    { $match: { business: business._id, paymentStatus: 'completed' } },
    { $group: { _id: null, commissionFromSales: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$platformMarkup', 0] }] } } } },
  ]);
  const commissionFromSales = txAgg[0]?.commissionFromSales || 0;
  const alreadyCollected = business.platformCommissionPaid || 0;
  const amount = Math.max(0, commissionFromSales - alreadyCollected);

  if (amount <= 0) return next(new AppError('Nuk ka komision për t\'u mbledhur.', 400));

  business.platformCommissionPaid = alreadyCollected + amount;
  business.commissionOwed = 0;
  await business.save();

  await createAuditLog({
    actor: req.user, action: 'collect_commission', resource: 'Business',
    resourceId: business._id, req,
    description: `Collected ${Math.round(amount)} ALL commission from ${business.name}`,
  });

  res.status(200).json({
    success: true,
    message: `Komisioni prej ${Math.round(amount)} ALL u shënua si i mbledhur.`,
    data: { collected: amount, totalCollected: business.platformCommissionPaid },
  });
});

exports.backfillDealPrices = catchAsync(async (req, res) => {
  // Find deals where platformMarkup is 0 or missing (meaning businessPrice was never properly separated)
  const deals = await Deal.find({
    $or: [{ platformMarkup: 0 }, { platformMarkup: { $exists: false } }, { businessPrice: { $exists: false } }],
  }).lean();

  const ops = deals
    .filter((d) => d.discountedPrice > 0)
    .map((d) => {
      const businessPrice = Math.round(d.discountedPrice / 1.05);
      const platformMarkup = d.discountedPrice - businessPrice;
      return {
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { businessPrice, platformMarkup } },
        },
      };
    });

  const result = ops.length > 0 ? await Deal.bulkWrite(ops) : { modifiedCount: 0 };

  await createAuditLog({
    actor: req.user, action: 'backfill_deal_prices', resource: 'Deal', req,
    description: `Backfilled businessPrice and platformMarkup on ${result.modifiedCount} deals`,
  });

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} deal-e u përditësuan me çmimin bazë të saktë.`,
    data: { dealsUpdated: result.modifiedCount },
  });
});

exports.resetCommissionRates = catchAsync(async (req, res) => {
  // Business commission = 0, platform earns 7% markup from customer
  const bizResult = await Business.updateMany(
    { commissionOverride: { $ne: true } },
    { $set: { commissionRate: 0 } }
  );
  const dealResult = await Deal.updateMany(
    { businessPrice: { $gt: 0 } },
    [{ $set: {
      commissionRate: 0,
      commissionAmount: 0,
      platformMarkup: { $round: [{ $multiply: ['$businessPrice', 0.09] }, 0] },
      discountedPrice: { $add: ['$businessPrice', { $round: [{ $multiply: ['$businessPrice', 0.09] }, 0] }] },
    }}]
  );
  await createAuditLog({
    actor: req.user, action: 'reset_commission_rates', resource: 'Business', req,
    description: `Reset ${bizResult.modifiedCount} businesses to 0% commission, ${dealResult.modifiedCount} deals to 7% markup`,
  });
  res.status(200).json({
    success: true,
    message: `${bizResult.modifiedCount} biznese (0% komision) dhe ${dealResult.modifiedCount} deal-e (7% markup) u përditësuan.`,
    data: { businessesUpdated: bizResult.modifiedCount, dealsUpdated: dealResult.modifiedCount },
  });
});
