const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { searchRateLimiter } = require('../middleware/rateLimit.middleware');
const { uploadDealImages } = require('../config/cloudinary');

router.get('/', optionalAuth, dealController.getAllDeals);
router.get('/featured', dealController.getFeaturedDeals);
router.get('/flash', dealController.getFlashDeals);
router.get('/nearby', optionalAuth, dealController.getNearbyDeals);
router.get('/search', searchRateLimiter, optionalAuth, dealController.searchDeals);
router.get('/:slug', optionalAuth, dealController.getDeal);

router.post('/', protect, restrictTo('business'), uploadDealImages, dealController.createDeal);
router.patch('/:id', protect, restrictTo('business', 'admin'), dealController.updateDeal);
router.delete('/:id', protect, restrictTo('business', 'admin'), dealController.deleteDeal);

router.post('/:id/wishlist', protect, dealController.toggleWishlist);
router.post('/:id/approve', protect, restrictTo('admin', 'superadmin'), dealController.approveDeal);
router.post('/:id/reject', protect, restrictTo('admin', 'superadmin'), dealController.rejectDeal);
router.get('/business/my-deals', protect, restrictTo('business'), dealController.getMyBusinessDeals);

module.exports = router;
