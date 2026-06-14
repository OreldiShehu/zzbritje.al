let commissionMigrationDone = false;

const runCommissionMigration = async () => {
  if (commissionMigrationDone) return;
  try {
    const Business = require('../server/src/models/Business');
    const Deal = require('../server/src/models/Deal');

    const bRes = await Business.updateMany(
      { commissionRate: { $ne: 0 } },
      { $set: { commissionRate: 0 } }
    );

    const dRes = await Deal.updateMany(
      { businessPrice: { $gt: 0 } },
      [{
        $set: {
          commissionRate: 0,
          commissionAmount: 0,
          platformMarkup: { $round: [{ $multiply: ['$businessPrice', 0.09] }, 0] },
          discountedPrice: { $add: ['$businessPrice', { $round: [{ $multiply: ['$businessPrice', 0.09] }, 0] }] },
        },
      }]
    );

    if (bRes.modifiedCount || dRes.modifiedCount) {
      console.log(`[migration] 9% markup / 0% commission: ${bRes.modifiedCount} businesses, ${dRes.modifiedCount} deals updated`);
    }
    commissionMigrationDone = true;
  } catch (err) {
    console.error('[migration] Commission reset failed:', err.message);
  }
};

module.exports = async (req, res) => {
  try {
    require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
    const mongoose = require('mongoose');
    const app = require('../server/src/app');
    const { connectDB } = require('../server/src/config/db');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    await runCommissionMigration();

    return app(req, res);
  } catch (err) {
    console.error('Handler error:', err.message, err.stack);
    return res.status(503).json({
      success: false,
      message: 'Service error',
      error: err.message,
    });
  }
};
