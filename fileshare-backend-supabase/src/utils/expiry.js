/**
 * Convert an expiry string like "7d", "24h", "1h", "30d", "never"
 * into a future Date (or null for never).
 */
export function parseExpiry(expiry) {
  if (!expiry || expiry === 'never') return null

  const value = parseInt(expiry, 10)
  const unit  = expiry.slice(-1)   // 'h' or 'd'

  const ms = unit === 'h'
    ? value * 60 * 60 * 1000
    : value * 24 * 60 * 60 * 1000

  return new Date(Date.now() + ms)
}
