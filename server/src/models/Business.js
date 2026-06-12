const mongoose = require('mongoose');
const slugify = require('slugify');

const businessSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, unique: true },
  description: { type: String, maxlength: 2000 },
  shortDescription: { type: String, maxlength: 200 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // Contact
  email: { type: String, lowercase: true },
  phone: { type: String },
  website: { type: String },
  whatsapp: { type: String },

  // Address
  address: { type: String },
  city: { type: String, required: true, default: 'Tiranë' },
  country: { type: String, default: 'Albania' },
  postalCode: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [19.8189, 41.3275] },
  },

  // Media
  logo: { type: String },
  coverImage: { type: String },
  images: [{ url: String, publicId: String, caption: String }],
  videoUrl: { type: String },

  // Business Hours
  businessHours: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    open: String,
    close: String,
    isClosed: { type: Boolean, default: false },
  }],

  // Social Media
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    tiktok: String,
    youtube: String,
  },

  // Verification & Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
    default: 'pending',
  },
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: Date,
  }],
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },

  // Plan & Subscription
  plan: { type: String, enum: ['free', 'starter', 'growth', 'premium', 'enterprise'], default: 'free' },
  planExpiresAt: { type: Date },
  isFeatured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  featuredOrder: { type: Number, default: 0 },

  // Stats
  totalDeals: { type: Number, default: 0 },
  activeDeals: { type: Number, default: 0 },
  totalVouchersSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  platformCommissionPaid: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalFavorites: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },

  // Banking
  bankDetails: {
    accountHolder: { type: String, select: false },
    iban: { type: String, select: false },
    swift: { type: String, select: false },
    bank: { type: String },
  },
  stripeAccountId: { type: String, select: false },
  paypalEmail: { type: String, select: false },

  // Tags & SEO
  tags: [{ type: String, lowercase: true }],
  metaTitle: { type: String },
  metaDescription: { type: String },

  // Status
  isActive: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: true },
  establishedYear: { type: Number },
  employeeCount: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },

  // Commission
  commissionRate: { type: Number, default: 0.10 },
  commissionOverride: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
businessSchema.index({ location: '2dsphere' });
businessSchema.index({ slug: 1 });
businessSchema.index({ category: 1, city: 1 });
businessSchema.index({ verificationStatus: 1, isActive: 1 });
businessSchema.index({ isFeatured: -1, averageRating: -1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ tags: 1 });
businessSchema.index({ name: 'text', description: 'text', tags: 'text' });

businessSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' +
      Math.random().toString(36).substr(2, 5);
  }
  next();
});

businessSchema.virtual('isCurrentlyOpen').get(function () {
  const now = new Date();
  const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const hours = this.businessHours?.find((h) => h.day === day);
  if (!hours || hours.isClosed) return false;
  const [openH, openM] = hours.open?.split(':').map(Number) || [0, 0];
  const [closeH, closeM] = hours.close?.split(':').map(Number) || [23, 59];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM;
});

module.exports = mongoose.model('Business', businessSchema);
