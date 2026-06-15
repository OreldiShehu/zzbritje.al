const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authRateLimiter, emailRateLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', protect, authController.getMe);

router.post('/forgot-password', emailRateLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authRateLimiter, authController.resetPassword);
router.patch('/change-password', protect, authController.changePassword);
router.patch('/switch-to-customer', protect, authController.switchToCustomer);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', emailRateLimiter, authController.resendVerificationEmail);
router.post('/send-phone-otp', protect, authController.sendPhoneOtp);
router.post('/verify-phone-otp', protect, authController.verifyPhoneOtp);

module.exports = router;
