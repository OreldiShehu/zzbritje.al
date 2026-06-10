const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginatedResponse } = require('../utils/helpers');

exports.createReview = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findById(req.body.voucherId);
  if (!voucher) return next(new AppError('Voucher not found.', 404));
  if (!voucher.user.equals(req.user.id)) return next(new AppError('Not authorized.', 403));
  if (voucher.status !== 'redeemed') return next(new AppError('You can only review redeemed vouchers.', 400));
  if (voucher.hasReview) return next(new AppError('You have already reviewed this voucher.', 400));

  const images = req.files?.map((f) => ({ url: f.path, publicId: f.filename })) || [];

  const review = await Review.create({
    user: req.user.id,
    business: voucher.business,
    deal: voucher.deal,
    voucher: voucher._id,
    transaction: voucher.transaction,
    rating: req.body.rating,
    title: req.body.title,
    body: req.body.body,
    detailedRatings: req.body.detailedRatings,
    visitDate: req.body.visitDate,
    images,
    isVerifiedPurchase: true,
  });

  await Voucher.findByIdAndUpdate(voucher._id, { hasReview: true, review: review._id });
  await require('../models/User').findByIdAndUpdate(req.user.id, { $inc: { reviewsWritten: 1 } });

  res.status(201).json({ success: true, data: review, message: 'Review submitted successfully!' });
});

exports.getDealReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const { skip } = paginate(null, page, limit);
  const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, helpful: { helpfulVotes: -1 }, rating_high: { rating: -1 }, rating_low: { rating: 1 } };

  const [reviews, total] = await Promise.all([
    Review.find({ deal: req.params.dealId, status: 'approved' })
      .sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit))
      .populate('user', 'firstName lastName avatar loyaltyLevel'),
    Review.countDocuments({ deal: req.params.dealId, status: 'approved' }),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { deal: require('mongoose').Types.ObjectId(req.params.dealId), status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(reviews, total, page, limit), distribution });
});

exports.getBusinessReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip } = paginate(null, page, limit);

  const [reviews, total] = await Promise.all([
    Review.find({ business: req.params.businessId, status: 'approved' })
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
      .populate('user', 'firstName lastName avatar')
      .populate('deal', 'title slug'),
    Review.countDocuments({ business: req.params.businessId, status: 'approved' }),
  ]);

  res.status(200).json({ success: true, ...buildPaginatedResponse(reviews, total, page, limit) });
});

exports.respondToReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  const Business = require('../models/Business');
  const business = await Business.findOne({ owner: req.user.id });
  if (!business || !review.business.equals(business._id)) {
    return next(new AppError('Not authorized.', 403));
  }

  review.businessResponse = {
    body: req.body.response,
    respondedAt: new Date(),
    respondedBy: req.user.id,
  };
  await review.save();

  res.status(200).json({ success: true, data: review, message: 'Response added.' });
});

exports.voteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));

  if (review.votedBy.includes(req.user.id)) {
    return next(new AppError('You have already voted on this review.', 400));
  }

  const { type } = req.body;
  const update = type === 'helpful'
    ? { $inc: { helpfulVotes: 1 }, $push: { votedBy: req.user.id } }
    : { $inc: { unhelpfulVotes: 1 }, $push: { votedBy: req.user.id } };

  await Review.findByIdAndUpdate(review._id, update);
  res.status(200).json({ success: true, message: 'Vote recorded.' });
});

exports.flagReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found.', 404));
  if (review.flaggedBy.includes(req.user.id)) return next(new AppError('Already flagged.', 400));

  review.flaggedCount += 1;
  review.flaggedBy.push(req.user.id);
  review.flagReasons.push(req.body.reason);
  if (review.flaggedCount >= 3) review.status = 'flagged';
  await review.save();

  res.status(200).json({ success: true, message: 'Review flagged for moderation.' });
});

exports.moderateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
    moderationReason: req.body.reason,
    moderatedBy: req.user.id,
    moderatedAt: new Date(),
  }, { new: true });
  if (!review) return next(new AppError('Review not found.', 404));
  res.status(200).json({ success: true, data: review });
});
