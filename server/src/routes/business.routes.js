const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { uploadBusinessImages } = require('../config/cloudinary');

router.get('/', businessController.getAllBusinesses);
router.get('/my', protect, restrictTo('business'), businessController.getMyBusiness);
router.get('/my/stats', protect, restrictTo('business'), businessController.getBusinessStats);
router.get('/:slug', businessController.getBusiness);
router.post('/', protect, restrictTo('business'), businessController.createBusiness);
router.patch('/my', protect, restrictTo('business'), uploadBusinessImages, businessController.updateMyBusiness);
router.post('/my/documents', protect, restrictTo('business'), uploadBusinessImages, businessController.uploadBusinessDocuments);

module.exports = router;
