const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'voucher_purchased', 'voucher_redeemed', 'voucher_expiring', 'voucher_expired',
      'deal_approved', 'deal_rejected', 'deal_expired', 'new_deal',
      'review_received', 'review_response', 'review_approved',
      'payment_success', 'payment_failed', 'refund_processed',
      'referral_joined', 'referral_reward', 'points_earned', 'level_up',
      'badge_earned', 'achievement_unlocked',
      'account_verified', 'welcome',
      'admin_message', 'system',
      'business_verified', 'business_rejected', 'new_follower',
      'flash_deal', 'deal_ending_soon', 'wishlist_deal_available',
    ],
  },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  data: { type: mongoose.Schema.Types.Mixed },

  // References
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  // Status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isDeleted: { type: Boolean, default: false },

  // Delivery
  channels: {
    inApp: { sent: { type: Boolean, default: false }, sentAt: Date },
    email: { sent: { type: Boolean, default: false }, sentAt: Date },
    sms: { sent: { type: Boolean, default: false }, sentAt: Date },
    push: { sent: { type: Boolean, default: false }, sentAt: Date },
  },

  // Priority
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

  // Action
  actionUrl: { type: String },
  actionLabel: { type: String },
  imageUrl: { type: String },
  icon: { type: String },
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isDeleted: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
