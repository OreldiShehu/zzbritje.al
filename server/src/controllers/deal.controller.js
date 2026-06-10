const Deal = require('../models/Deal');
const Business = require('../models/Business');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse, buildDealFilters, buildSortObject, createAuditLog } = require('../utils/helpers');
const { sendEmail, templates } = require('../utils/email');
const { emitToAdmin } = require('../config/socket');

exports.getAllDeals = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, sort, ...queryParams } = req.query;
  const filters = buildDealFilters(queryParams);
  const sortObj = buildSortObject(sort);
  const { skip } = paginate(null, page, limit);

  const [deals, total] = await Promise.all([
    Deal.find(filters)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('business', 'name slug logo city averageRating verificationStatus')
      .populate('category', 'name slug icon color')
      .lean(),
    Deal.countDocuments(filters),
  ]);

  // Add wishlist status if user is authenticated
  if (req.user) {
    const dealIds = deals.map((d) => d._id);
    const favorites = await Favorite.find({ user: req.user.id, deal: { $in: dealIds } }).select('deal');
    const favoriteIds = new Set(favorites.map((f) => f.deal.toString()));
    deals.forEach((d) => { d.isWishlisted = favoriteIds.has(d._id.toString()); });
  }

  res.status(200).json({ success: true, ...buildPaginatedResponse(deals, total, page, limit) });
});

exports.getDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findOne({ slug: req.params.slug, status: { $in: ['active', 'sold_out', 'expired'] } })
    .populate('business', 'name slug logo city address phone website socialLinks businessHours averageRating totalReviews verificationStatus isFeatured')
    .populate('category', 'name slug icon')
    .populate('createdBy', 'firstName lastName avatar');

  if (!deal) return next(new AppError('Deal not found.', 404));

  // Track views (async, non-blocking)
  Deal.findByIdAndUpdate(deal._id, { $inc: { views: 1 } }).exec();

  // Check if wishlisted
  let isWishlisted = false;
  if (req.user) {
    const fav = await Favorite.findOne({ user: req.user.id, deal: deal._id });
    isWishlisted = !!fav;
  }

  // Get related deals
  const relatedDeals = await Deal.find({
    category: deal.category._id,
    _id: { $ne: deal._id },
    status: 'active',
    endDate: { $gt: new Date() },
  }).limit(6).populate('business', 'name slug logo').lean();

  res.status(200).json({
    success: true,
    data: { ...deal.toObject(), isWishlisted, relatedDeals },
  });
});

exports.createDeal = catchAsync(async (req, res, next) => {
  let business = await Business.findOne({ owner: req.user.id });
  if (!business) {
    const slugify = require('slugify');
    const name = req.user.firstName + ' ' + req.user.lastName;
    business = await Business.create({
      businessName: name,
      owner: req.user.id,
      slug: slugify(name, { lower: true }) + '-' + Date.now(),
      city: req.body.city || 'Tiranë',
      commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.20,
    });
    await require('../models/User').findByIdAndUpdate(req.user.id, { businessId: business._id });
  }

  const images = req.files?.map((f, i) => ({
    url: f.path,
    publicId: f.filename,
    isMain: i === 0,
  })) || [];

  const deal = await Deal.create({
    ...req.body,
    business: business._id,
    createdBy: req.user.id,
    city: req.body.city || business.city,
    images,
    status: 'pending_review',
    commissionRate: business.commissionRate,
  });

  await Business.findByIdAndUpdate(business._id, { $inc: { totalDeals: 1 } });

  // Notify admins
  emitToAdmin('new_deal_review', { deal: deal._id, business: business.name });

  await createAuditLog({ actor: req.user, action: 'create_deal', resource: 'Deal', resourceId: deal._id, req });

  res.status(201).json({ success: true, data: deal, message: 'Deal submitted for review.' });
});

exports.updateDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));

  const business = await Business.findOne({ owner: req.user.id });
  if (!business || !deal.business.equals(business._id)) {
    return next(new AppError('Not authorized to edit this deal.', 403));
  }

  if (['active', 'expired'].includes(deal.status)) {
    const allowedFields = ['description', 'termsAndConditions', 'redemptionInstructions'];
    const filteredBody = {};
    allowedFields.forEach((f) => { if (req.body[f]) filteredBody[f] = req.body[f]; });
    req.body = filteredBody;
  }

  const updated = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));

  const business = await Business.findOne({ owner: req.user.id });
  if (req.user.role !== 'admin' && (!business || !deal.business.equals(business._id))) {
    return next(new AppError('Not authorized.', 403));
  }

  if (deal.soldVouchers > 0 && req.user.role !== 'admin') {
    return next(new AppError('Cannot delete a deal with sold vouchers. Pause it instead.', 400));
  }

  deal.status = 'expired';
  await deal.save();

  await createAuditLog({ actor: req.user, action: 'delete_deal', resource: 'Deal', resourceId: deal._id, req, severity: 'warning' });
  res.status(200).json({ success: true, message: 'Deal deactivated successfully.' });
});

exports.getMyBusinessDeals = catchAsync(async (req, res, next) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return next(new AppError('Business profile not found.', 404));

  const { page = 1, limit = 20, status } = req.query;
  const { skip } = paginate(null, page, limit);
  const filter = { business: business._id };
  if (status) filter.status = status;

  const [deals, total] = await Promise.all([
    Deal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('category', 'name'),
    Deal.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(deals, total, page, limit) });
});

exports.getFeaturedDeals = catchAsync(async (req, res) => {
  const deals = await Deal.find({
    status: 'active', isFeatured: true, endDate: { $gt: new Date() },
  }).sort({ featuredOrder: 1, views: -1 }).limit(8)
    .populate('business', 'name slug logo city averageRating')
    .populate('category', 'name slug icon')
    .lean();

  res.status(200).json({ success: true, data: deals });
});

exports.getFlashDeals = catchAsync(async (req, res) => {
  const now = new Date();
  const deals = await Deal.find({
    dealType: 'flash', status: 'active',
    flashStartsAt: { $lte: now }, flashEndsAt: { $gt: now },
  }).sort({ flashEndsAt: 1 }).limit(8)
    .populate('business', 'name slug logo')
    .lean();

  res.status(200).json({ success: true, data: deals });
});

exports.getNearbyDeals = catchAsync(async (req, res, next) => {
  const { lng, lat, radius = 10, limit = 12 } = req.query;
  if (!lng || !lat) return next(new AppError('Please provide longitude and latitude.', 400));

  const deals = await Deal.find({
    status: 'active',
    endDate: { $gt: new Date() },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius) * 1000,
      },
    },
  }).limit(parseInt(limit))
    .populate('business', 'name slug logo city averageRating')
    .populate('category', 'name slug icon')
    .lean();

  res.status(200).json({ success: true, data: deals });
});

exports.toggleWishlist = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));

  const existing = await Favorite.findOne({ user: req.user.id, deal: deal._id });

  if (existing) {
    await existing.deleteOne();
    await Deal.findByIdAndUpdate(deal._id, { $inc: { wishlistCount: -1 } });
    return res.status(200).json({ success: true, isWishlisted: false, message: 'Removed from wishlist.' });
  }

  await Favorite.create({ user: req.user.id, deal: deal._id, business: deal.business });
  await Deal.findByIdAndUpdate(deal._id, { $inc: { wishlistCount: 1 } });
  res.status(200).json({ success: true, isWishlisted: true, message: 'Added to wishlist.' });
});

exports.approveDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id).populate('business');
  if (!deal) return next(new AppError('Deal not found.', 404));

  deal.status = 'active';
  deal.approvedAt = new Date();
  deal.approvedBy = req.user.id;
  deal.adminNotes = req.body.notes;
  await deal.save();

  await Business.findByIdAndUpdate(deal.business._id, { $inc: { activeDeals: 1 } });

  // Notify business owner
  const owner = await require('../models/User').findById(deal.business.owner);
  if (owner) {
    await sendEmail({ to: owner.email, ...templates.dealApproved(deal.business, deal) });
  }

  await createAuditLog({ actor: req.user, action: 'approve_deal', resource: 'Deal', resourceId: deal._id, req });
  res.status(200).json({ success: true, data: deal, message: 'Deal approved and live.' });
});

exports.rejectDeal = catchAsync(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return next(new AppError('Deal not found.', 404));

  deal.status = 'rejected';
  deal.rejectionReason = req.body.reason;
  await deal.save();

  await createAuditLog({ actor: req.user, action: 'reject_deal', resource: 'Deal', resourceId: deal._id, req, severity: 'warning' });
  res.status(200).json({ success: true, message: 'Deal rejected.' });
});

exports.searchDeals = catchAsync(async (req, res) => {
  const { q, city, category, page = 1, limit = 20 } = req.query;
  const { skip } = paginate(null, page, limit);

  const filter = { status: 'active', endDate: { $gt: new Date() } };
  if (q) filter.$text = { $search: q };
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (category) filter.category = category;

  const [deals, total] = await Promise.all([
    Deal.find(filter, q ? { score: { $meta: 'textScore' } } : {})
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip).limit(parseInt(limit))
      .populate('business', 'name slug logo city averageRating')
      .populate('category', 'name slug icon')
      .lean(),
    Deal.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(deals, total, page, limit) });
});
