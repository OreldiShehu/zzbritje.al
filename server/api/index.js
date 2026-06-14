let commissionMigrationDone = false;

const runCommissionMigration = async () => {
  if (commissionMigrationDone) return;
  try {
    const Business = require('../src/models/Business');
    const Deal = require('../src/models/Deal');

    // Business commission = 0 (platform earns only from 7% customer markup)
    const bRes = await Business.updateMany(
      { commissionRate: { $ne: 0 } },
      { $set: { commissionRate: 0 } }
    );

    // Recalculate all deals: 7% markup from customer, 0% from business
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
    await Deal.updateMany(
      { businessPrice: { $in: [0, null] }, businessPrice: { $exists: true } },
      { $set: { commissionRate: 0, commissionAmount: 0 } }
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
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
    const mongoose = require('mongoose');
    const app = require('../src/app');
    const { connectDB } = require('../src/config/db');

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
