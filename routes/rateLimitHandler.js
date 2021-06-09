const rateLimit = require('express-rate-limit');

const defaultLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 100, // max amount of requests
  message: 'You have exceeded your hourly maximum amount of requests!',
  headers: true,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes in milliseconds
  max: 3, // max amount of requests
  message: 'You have exceeded your hourly maximum amount of requests!',
  headers: true,
});

module.exports = {
  defaultLimiter,
  authLimiter,
};
