const mongoose = require('mongoose');
const crypto = require('crypto');

const voucherSchema = new mongoose.Schema({
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  // Voucher identity
  code: { type: String, unique: true, required: true },
  qrCodeData: { type: String },
  qrCodeImage: { type: String },

  // Pricing
  originalPrice: { type: Number, required: true },
  paidPrice: { type: Number, required: true },
  discountAmount: { type: Number },
  commissionAmount: { type: Number },
  businessEarning: { type: Number },

  // Status
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled', 'refunded'],
    default: 'active',
  },

  // Dates
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  redeemedAt: { type: Date },

  // Redemption
  redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redemptionLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  redemptionNote: { type: String },
  redemptionAttempts: [{
    attemptedAt: Date,
    attemptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    success: Boolean,
    ipAddress: String,
    failReason: String,
  }],

  // Gift voucher
  isGift: { type: Boolean, default: false },
  giftRecipientEmail: { type: String },
  giftMessage: { type: String },
  giftSentAt: { type: Date },

  // Customer-side visit confirmation
  customerConfirmed: { type: Boolean, default: false },
  customerConfirmedAt: { type: Date },

  // Review status
  hasReview: { type: Boolean, default: false },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },

  // Notifications sent
  reminderSent: { type: Boolean, default: false },
  expiryReminderSent: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
voucherSchema.index({ code: 1 });
voucherSchema.index({ user: 1, status: 1 });
voucherSchema.index({ business: 1, status: 1 });
voucherSchema.index({ deal: 1 });
voucherSchema.index({ expiresAt: 1, status: 1 });
voucherSchema.index({ transaction: 1 });

// Generate unique voucher code
voucherSchema.statics.generateCode = function () {
  const prefix = 'ALB';
  const randomPart = crypto.randomBytes(5).toString('hex').toUpperCase();
  const checksum = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}-${checksum}`;
};

voucherSchema.virtual('isExpired').get(function () {
  return this.status !== 'redeemed' && new Date() > new Date(this.expiresAt);
});

voucherSchema.virtual('daysUntilExpiry').get(function () {
  const diff = new Date(this.expiresAt) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Voucher', voucherSchema);
