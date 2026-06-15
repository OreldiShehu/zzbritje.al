const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

  // Rating
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  body: { type: String, required: true, minlength: 5, maxlength: 2000 },

  // Detailed ratings
  detailedRatings: {
    quality: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
  },

  // Media
  images: [{ url: String, publicId: String }],

  // Business response
  businessResponse: {
    body: String,
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved',
  },
  moderationReason: { type: String },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },

  // Helpful votes
  helpfulVotes: { type: Number, default: 0 },
  unhelpfulVotes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Flags
  flaggedCount: { type: Number, default: 0 },
  flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flagReasons: [String],

  // Verification
  isVerifiedPurchase: { type: Boolean, default: true },
  visitDate: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
reviewSchema.index({ business: 1, status: 1, createdAt: -1 });
reviewSchema.index({ deal: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ voucher: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });

// Prevent duplicate reviews per voucher
reviewSchema.index({ voucher: 1, user: 1 }, { unique: true });

// Update business rating after review save/update
reviewSchema.post('save', async function () {
  const Business = mongoose.model('Business');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { business: this.business, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Business.findByIdAndUpdate(this.business, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
    const Deal = mongoose.model('Deal');
    if (this.deal) {
      const dealStats = await mongoose.model('Review').aggregate([
        { $match: { deal: this.deal, status: 'approved' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (dealStats.length > 0) {
        await Deal.findByIdAndUpdate(this.deal, {
          averageRating: Math.round(dealStats[0].avgRating * 10) / 10,
          totalReviews: dealStats[0].count,
        });
      }
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
