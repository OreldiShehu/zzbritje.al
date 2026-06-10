const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  nameAl: { type: String, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, maxlength: 500 },
  icon: { type: String },
  image: { type: String },
  color: { type: String, default: '#10b981' },
  gradient: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  totalDeals: { type: Number, default: 0 },
  totalBusinesses: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ order: 1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

module.exports = mongoose.model('Category', categorySchema);
