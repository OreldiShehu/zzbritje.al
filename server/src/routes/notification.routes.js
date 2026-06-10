const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markNotificationsRead,
  deleteNotification,
  updateNotificationPreferences,
} = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', async (req, res) => {
  const Notification = require('../models/Notification');
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});
router.patch('/:id/read', markNotificationsRead);
router.delete('/:id', deleteNotification);
router.patch('/preferences', updateNotificationPreferences);

module.exports = router;
