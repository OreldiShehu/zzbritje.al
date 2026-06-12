const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');
const { paymentRateLimiter } = require('../middleware/rateLimit.middleware');

// PayPal
router.post('/paypal/create-order', protect, paymentRateLimiter, paymentController.createPayPalOrder);
router.post('/paypal/capture-order/:orderId', protect, paymentRateLimiter, paymentController.capturePayPalOrder);

// Transactions
router.get('/transactions', protect, paymentController.getMyTransactions);
router.get('/transactions/:id', protect, paymentController.getTransactionDetails);
router.post('/transactions/:transactionId/refund', protect, paymentController.requestRefund);
router.post('/transactions/:transactionId/process-refund', protect, restrictTo('admin'), paymentController.processRefund);

module.exports = router;
