const Deal = require('../models/Deal');
const Voucher = require('../models/Voucher');
const Notification = require('../models/Notification');
const logger = require('./logger');
const { sendEmail, templates } = require('./email');

async function expireDeals() {
  try {
    const result = await Deal.updateMany(
      {
        status: 'active',
        endDate: { $lte: new Date() },
      },
      { $set: { status: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} deals`);
    }

    // Also mark sold-out deals
    const soldOutDeals = await Deal.find({
      status: 'active',
      $expr: { $gte: ['$vouchersSold', '$totalVouchers'] },
    }).select('_id');

    if (soldOutDeals.length > 0) {
      await Deal.updateMany(
        { _id: { $in: soldOutDeals.map((d) => d._id) } },
        { $set: { status: 'sold_out' } }
      );
      logger.info(`Marked ${soldOutDeals.length} deals as sold out`);
    }
  } catch (err) {
    logger.error('Error in expireDeals cron:', err);
  }
}

async function expireVouchers() {
  try {
    const result = await Voucher.updateMany(
      {
        status: 'active',
        expiresAt: { $lte: new Date() },
      },
      { $set: { status: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} vouchers`);
    }
  } catch (err) {
    logger.error('Error in expireVouchers cron:', err);
  }
}

async function sendExpirationReminders() {
  try {
    const reminderDays = [3, 1]; // days before expiry

    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const expiringVouchers = await Voucher.find({
        status: 'active',
        expiresAt: { $gte: startOfDay, $lte: endOfDay },
        [`reminderSent.${days}day`]: { $ne: true },
      })
        .populate('user', 'email firstName lastName notificationPreferences')
        .populate('deal', 'title');

      for (const voucher of expiringVouchers) {
        try {
          const user = voucher.user;
          if (!user) continue;

          // In-app notification
          await Notification.create({
            user: user._id,
            type: 'voucher_expiring',
            title: `Voucher-i skadon në ${days} ditë!`,
            message: `Voucher-i juaj për "${voucher.deal?.title}" skadon ${days === 1 ? 'nesër' : `në ${days} ditë`}. Mos e humbisni!`,
            data: { voucherId: voucher._id, dealId: voucher.deal?._id },
            channels: { inApp: true, email: !!user.notificationPreferences?.email },
          });

          // Email notification
          if (user.notificationPreferences?.email !== false) {
            await sendEmail({
              to: user.email,
              subject: `⏰ Voucher-i skadon ${days === 1 ? 'nesër' : `në ${days} ditë`}!`,
              html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">⏰ Kujtesë: Voucher-i Po Skadon!</h2>
                <p>Mirëdita ${user.firstName},</p>
                <p>Voucher-i juaj për <strong>"${voucher.deal?.title}"</strong> skadon ${days === 1 ? '<strong>nesër</strong>' : `në <strong>${days} ditë</strong>`}.</p>
                <p>Kodi: <strong style="font-family: monospace; background: #f9fafb; padding: 4px 8px; border-radius: 4px;">${voucher.code}</strong></p>
                <a href="${process.env.CLIENT_URL}/dashboard/vouchers" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 16px;">
                  Shih Voucher-in →
                </a>
              </div>`,
            });
          }

          // Mark reminder as sent
          voucher.reminderSent = voucher.reminderSent || {};
          voucher.reminderSent[`${days}day`] = true;
          await voucher.save();
        } catch (userErr) {
          logger.error(`Failed to send expiry reminder for voucher ${voucher._id}:`, userErr);
        }
      }

      if (expiringVouchers.length > 0) {
        logger.info(`Sent ${days}-day expiry reminders for ${expiringVouchers.length} vouchers`);
      }
    }
  } catch (err) {
    logger.error('Error in sendExpirationReminders cron:', err);
  }
}

async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      isRead: true,
      createdAt: { $lte: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} old read notifications`);
    }
  } catch (err) {
    logger.error('Error in cleanupOldNotifications cron:', err);
  }
}

module.exports = { expireDeals, expireVouchers, sendExpirationReminders, cleanupOldNotifications };
