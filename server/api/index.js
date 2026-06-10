require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let dbConnected = false;

module.exports = async (req, res) => {
  try {
    if (!dbConnected || mongoose.connection.readyState !== 1) {
      await connectDB();
      dbConnected = true;
    }
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  return app(req, res);
};
