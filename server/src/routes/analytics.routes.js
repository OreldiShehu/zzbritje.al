const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const catchAsync = require('../utils/catchAsync');
const Transaction = require('../models/Transaction');
const Deal = require('../models/Deal');
const Business = require('../models/Business');
const Voucher = require('../models/Voucher');

router.use(protect);

router.get('/business', restrictTo('business'), catchAsync(async (req, res) => {
  const business = await Business.findOne({ owner: req.user.id });
  if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

  const { period = '30' } = req.query;
  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

  const [revenue, vouchersSold, topDeals, customerStats] = await Promise.all([
    Transaction.aggregate([
      { $match: { business: business._id, createdAt: { $gte: daysAgo }, paymentStatus: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$businessAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Voucher.aggregate([
      { $match: { business: business._id, createdAt: { $gte: daysAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Deal.find({ business: business._id }).sort({ soldVouchers: -1 }).limit(5)
      .select('title soldVouchers revenue averageRating discountPercentage'),
    Transaction.aggregate([
      { $match: { business: business._id, paymentStatus: 'completed' } },
      { $group: { _id: '$user', totalSpent: { $sum: '$total' }, visits: { $sum: 1 } } },
      { $group: { _id: null, avgSpend: { $avg: '$totalSpent' }, avgVisits: { $avg: '$visits' }, uniqueCustomers: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({ success: true, data: { revenue, vouchersSold, topDeals, customerStats: customerStats[0] || {} } });
}));

router.get('/platform', restrictTo('admin', 'superadmin'), catchAsync(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

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
