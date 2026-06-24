const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');

const { globalRateLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const businessRoutes = require('./routes/business.routes');
const dealRoutes = require('./routes/deal.routes');
const voucherRoutes = require('./routes/voucher.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const categoryRoutes = require('./routes/category.routes');
const uploadRoutes = require('./routes/upload.routes');
const cronRoutes = require('./routes/cron.routes');

const app = express();

// Trust proxy (for Render/Heroku)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://*.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers preview + production deploys)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.zbritje.site') || origin === 'https://zbritje.site' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
}));

// Rate limiting
app.use('/api', globalRateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'city'] }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Stripe webhook (must come before JSON parser for raw body)
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Root + health check
app.get('/', (req, res) => res.status(200).json({ status: 'ok', platform: 'Zbritje.al API', version: '1.0.0' }));
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Zbritje.al',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public platform stats
app.get('/api/v1/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Business = require('./models/Business');
    const Voucher = require('./models/Voucher');
    const [users, businesses, vouchers] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments({ verificationStatus: 'verified' }),
      Voucher.countDocuments(),
    ]);
    res.json({ success: true, data: { users, businesses, vouchers } });
  } catch {
    res.json({ success: true, data: { users: 0, businesses: 0, vouchers: 0 } });
  }
});

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/businesses`, businessRoutes);
app.use(`${API}/deals`, dealRoutes);
app.use(`${API}/vouchers`, voucherRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/upload`, uploadRoutes);
app.use(`${API}/cron`, cronRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
