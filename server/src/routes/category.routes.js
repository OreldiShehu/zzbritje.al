const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');

router.get('/', catchAsync(async (req, res) => {
  const { featured, parent } = req.query;
  const filter = { isActive: true };
  if (featured === 'true') filter.isFeatured = true;
  if (parent === 'null' || parent === undefined) filter.parent = null;
  else if (parent) filter.parent = parent;

  const categories = await Category.find(filter).sort({ order: 1, name: 1 });
  res.status(200).json({ success: true, data: categories });
}));

router.get('/:slug', catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    .populate({ path: 'children', match: { isActive: true }, options: { sort: { order: 1 } } });
  if (!category) return next(require('../utils/AppError')('Category not found.', 404));
  res.status(200).json({ success: true, data: category });
}));

module.exports = router;
