const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const catchAsync = require('../utils/catchAsync');
const Transaction = require('../models/Transaction');
const Deal = require('../models/Deal');
const Business = require('../models/Business');
const Voucher = require('../models/Voucher');
const Review = require('../models/Review');

router.use(protect);

function parsePeriod(p) {
  if (p === '7d') return 7;
  if (p === '90d') return 90;
  if (p === '1y') return 365;
  return 30;
}

router.get('/business', restrictTo('business'), catchAsync(async (req, res) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

  const days = parsePeriod(req.query.period);
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevPeriodStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);

  const [
    chartRaw, currentRevAgg, prevRevAgg,
    currentVouchersAgg, prevVouchersAgg,
    reviewsData, topDeals, repeatCxAgg,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { business: business._id, createdAt: { $gte: daysAgo }, paymentStatus: 'completed' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$businessAmount' },
        vouchers: { $sum: '$quantity' },
      }},
      { $sort: { _id: 1 } },
    ]),
    Transaction.aggregate([
      { $match: { business: business._id, createdAt: { $gte: daysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$businessAmount' }, count: { $sum: '$quantity' }, avgOrder: { $avg: '$total' } } },
    ]),
    Transaction.aggregate([
      { $match: { business: business._id, createdAt: { $gte: prevPeriodStart, $lt: daysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$businessAmount' }, count: { $sum: '$quantity' } } },
    ]),
    Voucher.countDocuments({ business: business._id, createdAt: { $gte: daysAgo } }),
    Voucher.countDocuments({ business: business._id, createdAt: { $gte: prevPeriodStart, $lt: daysAgo } }),
    Review.aggregate([
      { $match: { business: business._id, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Deal.find({ business: business._id }).sort({ soldVouchers: -1 }).limit(5)
      .select('title soldVouchers revenue averageRating views').lean(),
    Transaction.aggregate([
      { $match: { business: business._id, paymentStatus: 'completed' } },
      { $group: { _id: '$user', visits: { $sum: 1 } } },
      { $group: { _id: null, total: { $sum: 1 }, repeats: { $sum: { $cond: [{ $gt: ['$visits', 1] }, 1, 0] } } } },
    ]),
  ]);

  const curr = currentRevAgg[0] || {};
  const prev = prevRevAgg[0] || {};
  const pct = (curr.total || 0) - (prev.total || 0);
  const revenueChange = prev.total > 0 ? Math.round((pct / prev.total) * 100) : null;
  const vouchersChange = prev.count > 0 ? Math.round(((currentVouchersAgg - prevVouchersAgg) / prevVouchersAgg) * 100) : null;

  // Total views across all deals
  const allDeals = await Deal.find({ business: business._id }).select('views soldVouchers').lean();
  const totalViews = allDeals.reduce((s, d) => s + (d.views || 0), 0);
  const totalSold = allDeals.reduce((s, d) => s + (d.soldVouchers || 0), 0);

  // Conversion rates
  const purchaseRate = totalViews > 0 ? Math.min(100, Math.round((totalSold / totalViews) * 100 * 10) / 10) : 0;
  const clickRate = Math.min(100, purchaseRate * 3.5); // estimated click-to-view ratio
  const repeatAgg = repeatCxAgg[0] || {};
  const returnRate = repeatAgg.total > 0 ? Math.round((repeatAgg.repeats / repeatAgg.total) * 100) : 0;

  const summary = {
    revenue: curr.total || 0,
    revenueChange,
    vouchersSold: currentVouchersAgg,
    vouchersChange,
    views: totalViews,
    viewsChange: null,
    rating: reviewsData[0]?.avg ? Math.round(reviewsData[0].avg * 10) / 10 : 0,
    reviews: reviewsData[0]?.count || 0,
  };

  const chartData = chartRaw.map(({ _id, revenue, vouchers }) => ({ date: _id, revenue, vouchers }));

  const dealBreakdown = topDeals.map((d) => ({
    title: d.title.length > 25 ? d.title.slice(0, 25) + '…' : d.title,
    sold: d.soldVouchers || 0,
    revenue: d.revenue || 0,
    views: d.views || 0,
    conversionRate: (d.views || 0) > 0 ? Math.round(((d.soldVouchers || 0) / d.views) * 100) : 0,
  }));

  const conversion = {
    clickRate: Math.round(clickRate * 10) / 10,
    purchaseRate,
    returnRate,
    avgOrderValue: Math.round(curr.avgOrder || 0),
    repeatCustomers: returnRate,
  };

  res.status(200).json({ success: true, data: { summary, chartData, dealBreakdown, conversion } });
}));

router.get('/platform', restrictTo('admin', 'superadmin'), catchAsync(async (req, res) => {
  const days = parsePeriod(req.query.period);
  const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [revenue, topBusinesses, categoryPerformance, cityDistribution] = await Promise.all([
    Transaction.aggregate([
      { $match: { createdAt: { $gte: daysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, commission: { $sum: '$commissionAmount' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Business.find({ verificationStatus: 'verified' }).sort({ totalRevenue: -1 }).limit(10)
      .select('name totalRevenue totalVouchersSold averageRating city').lean(),
    Deal.aggregate([
      { $match: { status: 'active' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', deals: { $sum: 1 }, vouchers: { $sum: '$soldVouchers' }, revenue: { $sum: '$revenue' } } },
      { $sort: { revenue: -1 } },
    ]),
    Business.aggregate([
      { $group: { _id: '$city', businesses: { $sum: 1 } } },
      { $sort: { businesses: -1 } },
    ]),
  ]);

  res.status(200).json({ success: true, data: { revenue, topBusinesses, categoryPerformance, cityDistribution } });
}));

module.exports = router;
