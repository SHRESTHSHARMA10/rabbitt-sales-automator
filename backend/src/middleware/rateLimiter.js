const rateLimit = require('express-rate-limit');

// ─── Rate Limiter: 10 requests per 15 minutes per IP address ───
// This prevents abuse — if someone sends too many requests, they get blocked temporarily.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes (in milliseconds)
  max: 10,                    // each IP can make max 10 requests per window
  standardHeaders: true,      // sends rate limit info in `RateLimit-*` headers
  legacyHeaders: false,       // disable the old `X-RateLimit-*` headers

  // Custom message when someone exceeds the limit
  message: {
    success: false,
    error: 'Too many requests. Please try again after 15 minutes.',
  },
});

module.exports = { apiLimiter };
