const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { uploadReviewImages } = require('../config/cloudinary');

router.post('/', protect, uploadReviewImages, reviewController.createReview);
router.get('/deal/:dealId', reviewController.getDealReviews);
router.get('/business/:businessId', reviewController.getBusinessReviews);
router.post('/:id/respond', protect, restrictTo('business'), reviewController.respondToReview);
router.post('/:id/vote', protect, reviewController.voteReview);
router.post('/:id/flag', protect, reviewController.flagReview);
router.patch('/:id/moderate', protect, restrictTo('admin'), reviewController.moderateReview);

module.exports = router;
