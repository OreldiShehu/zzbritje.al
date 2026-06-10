const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { paymentRateLimiter } = require('../middleware/rateLimit.middleware');

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);
router.post('/create-intent', protect, paymentRateLimiter, paymentController.createStripePaymentIntent);
router.get('/transactions', protect, paymentController.getMyTransactions);
router.get('/transactions/:id', protect, paymentController.getTransactionDetails);
router.post('/transactions/:transactionId/refund', protect, paymentController.requestRefund);
router.post('/transactions/:transactionId/process-refund', protect, restrictTo('admin'), paymentController.processRefund);

module.exports = router;
