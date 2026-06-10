require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

// Cache DB connection across warm invocations
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
