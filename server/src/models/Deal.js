const mongoose = require('mongoose');
const slugify = require('slugify');

const dealSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true },
  description: { type: String, required: true, maxlength: 5000 },
  shortDescription: { type: String, maxlength: 300 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  // Pricing
  dealType: {
    type: String,
    enum: ['fixed_discount', 'percentage_discount', 'bogo', 'package', 'flash', 'bundle'],
    required: true,
  },
  originalPrice: { type: Number, required: true, min: 0 },
  businessPrice: { type: Number, required: true, min: 0 }, // price business sets (before platform markup)
  discountedPrice: { type: Number, min: 0 },               // customer-facing price = businessPrice * 1.07 (auto)
  platformMarkup: { type: Number, default: 0 },            // 7% of businessPrice (auto)
  discountPercentage: { type: Number, min: 0, max: 100 },
  currency: { type: String, default: 'ALL' },
  savingsAmount: { type: Number },

  // Flash deal pricing
  flashPrice: { type: Number },
  flashStartsAt: { type: Date },
  flashEndsAt: { type: Date },

  // Media
  images: [{
    url: { type: String, required: true },
    publicId: String,
    caption: String,
    isMain: { type: Boolean, default: false },
  }],
  videoUrl: { type: String },

  // Availability
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  totalVouchers: { type: Number, required: true, min: 1 },
  soldVouchers: { type: Number, default: 0 },
  remainingVouchers: { type: Number },
  maxPerCustomer: { type: Number, default: 1 },
  minPerOrder: { type: Number, default: 1 },
  maxVouchersPerMonth: { type: Number, default: 10 }, // platform limit per deal per month

  // Location
  city: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number], default: undefined },
  },

  // Terms
  termsAndConditions: { type: String, maxlength: 3000 },
  redemptionInstructions: { type: String, maxlength: 1000 },
  validityPeriod: { type: Number }, // days after purchase
  expirationAfterPurchase: { type: Number, default: 30 }, // days

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'paused', 'expired', 'sold_out', 'rejected'],
    default: 'draft',
  },
  rejectionReason: { type: String },
  adminNotes: { type: String },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Featured
  isFeatured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  featuredOrder: { type: Number, default: 0 },
  isHot: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },

  // Stats
  views: { type: Number, default: 0 },
  uniqueViews: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },

  // SEO
  tags: [{ type: String, lowercase: true }],
  metaTitle: { type: String },
  metaDescription: { type: String },

  // Commission
  commissionRate: { type: Number, default: 0.10 },
  commissionAmount: { type: Number },

  // Highlight / badge
  highlightBadge: { type: String },
  isTopRated: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
dealSchema.index({ location: '2dsphere' }, { sparse: true });
dealSchema.index({ slug: 1 });
dealSchema.index({ business: 1, status: 1 });
dealSchema.index({ category: 1, city: 1, status: 1 });
dealSchema.index({ endDate: 1, status: 1 });
dealSchema.index({ isFeatured: -1, views: -1 });
dealSchema.index({ discountPercentage: -1 });
dealSchema.index({ averageRating: -1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ title: 'text', description: 'text', tags: 'text' });

const PLATFORM_MARKUP_RATE = 0.07; // 7% added on top of businessPrice

dealSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' +
      Date.now().toString(36);
  }

  // Auto-calculate customer-facing price from businessPrice
  if (this.businessPrice) {
    this.platformMarkup = Math.round(this.businessPrice * PLATFORM_MARKUP_RATE);
    this.discountedPrice = this.businessPrice + this.platformMarkup;
  }

  // Calculate savings & commission
  this.discountPercentage = Math.round(
    ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
  );
  this.savingsAmount = this.originalPrice - this.discountedPrice;
  this.remainingVouchers = this.totalVouchers - this.soldVouchers;
  // Commission is 20% of businessPrice (not including platform markup)
  this.commissionAmount = (this.businessPrice || this.discountedPrice) * this.commissionRate;

  // Auto-expire check
  if (this.remainingVouchers <= 0) this.status = 'sold_out';
  if (new Date() > this.endDate && this.status === 'active') this.status = 'expired';

  next();
});

dealSchema.virtual('timeRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  if (diff <= 0) return { expired: true };
  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
});

dealSchema.virtual('conversionRate').get(function () {
  if (!this.views) return 0;
  return ((this.conversions / this.views) * 100).toFixed(2);
});

module.exports = mongoose.model('Deal', dealSchema);
