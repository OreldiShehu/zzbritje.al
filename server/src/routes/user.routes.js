const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');

router.use(protect);

router.get('/profile', userController.getProfile);
router.patch('/profile', uploadAvatar, userController.updateProfile);
router.patch('/email', userController.updateEmail);
router.delete('/account', userController.deleteAccount);
router.get('/stats', userController.getUserStats);
router.get('/wishlist', userController.getWishlist);
router.get('/referrals', userController.getReferrals);
router.get('/notifications', userController.getNotifications);
router.patch('/notifications/read', userController.markNotificationsRead);
router.delete('/notifications/:id', userController.deleteNotification);
router.patch('/notification-preferences', userController.updateNotificationPreferences);

module.exports = router;
