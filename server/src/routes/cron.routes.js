const express = require('express');
const router = express.Router();
const { expireDeals, expireVouchers, sendExpirationReminders, cleanupOldNotifications } = require('../utils/cronJobs');

const cronAuth = (req, res, next) => {
  const secret = req.headers['authorization']?.replace('Bearer ', '');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

router.get('/expire-deals', cronAuth, async (req, res) => {
  await expireDeals();
  await expireVouchers();
  res.json({ success: true, task: 'expire-deals' });
});

router.get('/send-reminders', cronAuth, async (req, res) => {
  await sendExpirationReminders();
  res.json({ success: true, task: 'send-reminders' });
});

router.get('/cleanup', cronAuth, async (req, res) => {
  await cleanupOldNotifications();
  res.json({ success: true, task: 'cleanup' });
});

module.exports = router;
