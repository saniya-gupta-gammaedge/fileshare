import rateLimit from 'express-rate-limit'

/** Limit uploads: 20 per IP per hour */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Too many uploads from this IP, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

/** Limit share reads: 200 per IP per 15 min */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})
