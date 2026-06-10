const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

exports.paginate = (query, page = 1, limit = 20) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { skip, limit: parseInt(limit) };
};

exports.buildPaginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    hasNext: parseInt(page) * parseInt(limit) < total,
    hasPrev: parseInt(page) > 1,
  },
});

exports.buildDealFilters = (query) => {
  const filters = { status: 'active', endDate: { $gt: new Date() } };
  if (query.category) filters.category = new mongoose.Types.ObjectId(query.category);
  if (query.city) filters.city = { $regex: query.city, $options: 'i' };
  if (query.minDiscount) filters.discountPercentage = { $gte: parseInt(query.minDiscount) };
  if (query.maxPrice) filters.discountedPrice = { ...(filters.discountedPrice || {}), $lte: parseFloat(query.maxPrice) };
  if (query.minPrice) filters.discountedPrice = { ...(filters.discountedPrice || {}), $gte: parseFloat(query.minPrice) };
  if (query.minRating) filters.averageRating = { $gte: parseFloat(query.minRating) };
  if (query.isFeatured === 'true') filters.isFeatured = true;
  if (query.isFlash === 'true') filters.dealType = 'flash';
  if (query.search) filters.$text = { $search: query.search };
  return filters;
};

exports.buildSortObject = (sortBy) => {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { soldVouchers: -1 },
    highest_discount: { discountPercentage: -1 },
    lowest_price: { discountedPrice: 1 },
    highest_price: { discountedPrice: -1 },
    best_rated: { averageRating: -1 },
    ending_soon: { endDate: 1 },
    most_viewed: { views: -1 },
  };
  return sortOptions[sortBy] || sortOptions.newest;
};

exports.createAuditLog = async ({ actor, action, resource, resourceId, description, req, previousData, newData, severity = 'info' }) => {
  try {
    await AuditLog.create({
      actor: actor?._id || actor,
      actorRole: actor?.role,
      actorEmail: actor?.email,
      action, resource, resourceId, description,
      previousData, newData, severity,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
      method: req?.method,
      endpoint: req?.originalUrl,
    });
  } catch (err) {
    console.error('Audit log creation failed:', err.message);
  }
};

exports.calculateLoyaltyPoints = (amount) => {
  return Math.floor(amount / 100);
};

exports.sanitizeUser = (user) => {
  const { password, passwordResetToken, emailVerificationToken, twoFactorSecret, ...safe } = user.toObject ? user.toObject() : user;
  return safe;
};

exports.generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `ZBR-${year}-${random}`;
};

exports.formatCurrency = (amount, currency = 'ALL') => {
  return new Intl.NumberFormat('sq-AL', { style: 'currency', currency }).format(amount);
};

exports.getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.slugify = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
};
