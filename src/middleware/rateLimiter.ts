import rateLimit from 'express-rate-limit';

// Rate limiter for affirmation generation
export const affirmationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many affirmation generation requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for track assembly
export const trackAssemblyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each user to 5 requests per windowMs
  message: {
    error: 'Too many track assembly requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
