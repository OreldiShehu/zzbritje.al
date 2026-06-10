const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { uploadRateLimiter } = require('../middleware/rateLimit.middleware');
const { deleteImage } = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');

router.delete('/image', protect, uploadRateLimiter, catchAsync(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
  await deleteImage(publicId);
  res.status(200).json({ success: true, message: 'Image deleted.' });
}));

module.exports = router;
