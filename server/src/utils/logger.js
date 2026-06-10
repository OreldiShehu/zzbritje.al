const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: process.env.NODE_ENV !== 'production' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

const isVercel = !!process.env.VERCEL;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    ...(!isVercel && process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join('logs', 'combined.log') }),
    ] : []),
  ],
  exceptionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
