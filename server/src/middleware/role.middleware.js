const AppError = require('../utils/AppError');

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

exports.isVerifiedBusiness = (req, res, next) => {
  if (req.user.role !== 'business') {
    return next(new AppError('Only businesses can perform this action.', 403));
  }
  if (!req.user.businessId) {
    return next(new AppError('Please complete your business profile first.', 403));
  }
  next();
};

exports.isSameUserOrAdmin = (req, res, next) => {
  const targetId = req.params.userId || req.params.id;
  if (req.user.role === 'admin' || req.user.role === 'superadmin') return next();
  if (req.user.id !== targetId) {
    return next(new AppError('You can only access your own resources.', 403));
  }
  next();
};

exports.attachBusinessContext = async (req, res, next) => {
  if (req.user.role === 'business' && req.user.businessId) {
    const Business = require('../models/Business');
    req.business = await Business.findById(req.user.businessId);
    if (!req.business) {
      return next(new AppError('Business profile not found.', 404));
    }
  }
  next();
};
