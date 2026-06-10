const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'qualified', 'rewarded', 'invalid'], default: 'pending' },
  rewardAmount: { type: Number, default: 500 },
  rewardType: { type: String, enum: ['wallet', 'points', 'discount'], default: 'wallet' },
  qualificationCriteria: { type: String },
  qualifiedAt: { type: Date },
  rewardedAt: { type: Date },
  firstPurchaseAmount: { type: Number },
  firstPurchaseDate: { type: Date },
  channel: { type: String, enum: ['link', 'code', 'social', 'email'], default: 'code' },
}, { timestamps: true });

referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);
