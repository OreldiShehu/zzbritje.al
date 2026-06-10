const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

exports.globalRateLimiter = createLimiter(
  15 * 60 * 1000, 200,
  'Too many requests from this IP, please try again in 15 minutes.'
);

exports.authRateLimiter = createLimiter(
  15 * 60 * 1000, 10,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

exports.paymentRateLimiter = createLimiter(
  60 * 60 * 1000, 20,
  'Too many payment attempts. Please try again in an hour.'
);

exports.emailRateLimiter = createLimiter(
  60 * 60 * 1000, 5,
  'Too many email requests. Please try again later.'
);

exports.uploadRateLimiter = createLimiter(
  60 * 60 * 1000, 30,
  'Upload limit reached. Please try again later.'
);

exports.searchRateLimiter = createLimiter(
  1 * 60 * 1000, 30,
  'Too many search requests. Please slow down.'
);
