const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],

  // Payment
  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'wallet', 'card', 'cash'], required: true },
  paymentProvider: { type: String, enum: ['stripe', 'paypal'] },
  paymentIntentId: { type: String, sparse: true },
  paypalOrderId: { type: String, sparse: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed'],
    default: 'pending',
  },

  // Amounts (in ALL - Albanian Lek)
  subtotal: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  walletUsed: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'ALL' },

  // Commission breakdown
  commissionRate: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  businessAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },

  // Coupon
  couponCode: { type: String },
  couponId: { type: mongoose.Schema.Types.ObjectId },

  // Loyalty points
  pointsEarned: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },

  // Quantity
  quantity: { type: Number, required: true, min: 1, default: 1 },

  // Invoice
  invoiceNumber: { type: String, unique: true },
  invoiceUrl: { type: String },

  // Refund
  refundStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'completed'], default: 'none' },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String },
  refundRequestedAt: { type: Date },
  refundCompletedAt: { type: Date },
  refundId: { type: String },

  // Metadata
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceType: { type: String },
  completedAt: { type: Date },
  failureReason: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ business: 1, createdAt: -1 });
transactionSchema.index({ paymentIntentId: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ invoiceNumber: 1 });
transactionSchema.index({ createdAt: -1 });

// Generate invoice number
transactionSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    this.invoiceNumber = `ZBR-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
