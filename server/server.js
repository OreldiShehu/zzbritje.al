require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initializeSocket } = require('./src/config/socket');
const logger = require('./src/utils/logger');
const cron = require('node-cron');
const { expireDeals } = require('./src/utils/cronJobs');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initializeSocket(server);

    // Cron jobs
    cron.schedule('0 * * * *', expireDeals); // Every hour
    cron.schedule('0 9 * * *', async () => {
      const { sendExpirationReminders } = require('./src/utils/cronJobs');
      await sendExpirationReminders();
    }); // Daily 9am

    server.listen(PORT, () => {
      logger.info(`🚀 Zbritje.al Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📡 API: http://localhost:${PORT}/api/v1`);
    });

    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
