const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: {
    type: String, required: true, unique: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  phone: { type: String, trim: true, sparse: true },
  password: { type: String, minlength: 8, select: false },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['customer', 'business', 'admin', 'superadmin'], default: 'customer' },
  authProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  googleId: { type: String, sparse: true },
  facebookId: { type: String, sparse: true },

  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  phoneOtpHash: { type: String, select: false },
  phoneOtpExpires: { type: Date, select: false },
  phoneOtpSentAt: { type: Date, select: false },

  // Address
  city: { type: String, default: 'Tiranë' },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [19.8189, 41.3275] }, // Tirana default
  },

  // Wallet & Points
  walletBalance: { type: Number, default: 0, min: 0 },
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  loyaltyLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze',
  },
  totalSaved: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },

  // Gamification
  badges: [{ type: String }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String,
  }],

  // Referral
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },

  // Preferences
  preferences: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    cities: [{ type: String }],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      deals: { type: Boolean, default: true },
      vouchers: { type: Boolean, default: true },
    },
    language: { type: String, enum: ['sq', 'en'], default: 'sq' },
    currency: { type: String, default: 'ALL' },
  },

  // Account status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String },
  deletedAt: { type: Date, default: null },

  // Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  lastLoginIP: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },

  // Push notifications
  pushTokens: [{ type: String }],
  deviceTokens: [{
    token: String,
    platform: { type: String, enum: ['ios', 'android', 'web'] },
    createdAt: { type: Date, default: Date.now },
  }],

  // Business reference
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  businessName: { type: String, trim: true },

  // Stats
  vouchersPurchased: { type: Number, default: 0 },
  reviewsWritten: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ loyaltyPoints: -1 });

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: account locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// Update loyalty level
userSchema.pre('save', function (next) {
  const points = this.loyaltyPoints;
  if (points >= 10000) this.loyaltyLevel = 'diamond';
  else if (points >= 5000) this.loyaltyLevel = 'platinum';
  else if (points >= 2000) this.loyaltyLevel = 'gold';
  else if (points >= 500) this.loyaltyLevel = 'silver';
  else this.loyaltyLevel = 'bronze';
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  return token;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2h lock
  }
  return this.updateOne(updates);
};

module.exports = mongoose.model('User', userSchema);
