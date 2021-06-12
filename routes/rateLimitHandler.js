// importing express' rate-limit middleware
const rateLimit = require('express-rate-limit');

// added simple ratelimiter to avoid insane amount of requests
const defaultLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 100, // max amount of requests
  message: 'You have exceeded your hourly maximum amount of requests!',
  headers: true,
});

module.exports = {
  defaultLimiter,
};
