const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { paymentRateLimiter } = require('../middleware/rateLimit.middleware');

router.post('/purchase', protect, paymentRateLimiter, voucherController.purchaseVoucher);
router.get('/my', protect, voucherController.getMyVouchers);
router.get('/info/:code', voucherController.getVoucherPublicInfo);
router.get('/validate/:code', protect, restrictTo('business', 'admin'), voucherController.validateVoucher);
router.get('/business/all', protect, restrictTo('business'), voucherController.getBusinessVouchers);
router.post('/redeem', protect, restrictTo('business', 'admin'), voucherController.redeemVoucher);
router.get('/:code', protect, voucherController.getVoucher);

module.exports = router;
