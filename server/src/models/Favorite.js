const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  notifyOnPriceChange: { type: Boolean, default: false },
  notifyBeforeExpiry: { type: Boolean, default: true },
}, { timestamps: true });

favoriteSchema.index({ user: 1, deal: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });
favoriteSchema.index({ deal: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
