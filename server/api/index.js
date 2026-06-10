module.exports = async (req, res) => {
  try {
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
    const mongoose = require('mongoose');
    const app = require('../src/app');
    const { connectDB } = require('../src/config/db');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

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
