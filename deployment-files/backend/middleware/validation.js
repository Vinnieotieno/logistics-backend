const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different rate limits for different routes
const rateLimits = {
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later.'),
  contact: createRateLimit(60 * 60 * 1000, 3, 'Too many contact submissions, please try again later.'),
  api: createRateLimit(15 * 60 * 1000, 100, 'Too many API requests, please try again later.')
};

module.exports = {
  handleValidationErrors,
  rateLimits
};