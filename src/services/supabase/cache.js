// Simple in-memory cache with TTL for client-side caching
const cache = new Map()

/**
 * Get cached data if it exists and hasn't expired
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - Time to live in seconds (default: 1 hour)
 * @returns {any|null} Cached data or null if not found/expired
 */
export function getCached(key, ttlSeconds = 3600) {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > ttlSeconds * 1000) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Store data in cache with current timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Clear all cached data
 */
export function clearCache() {
  cache.clear()
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export function clearCacheKey(key) {
  cache.delete(key)
}

/**
 * Clear all prayer time caches (useful for midnight refresh)
 */
export function clearPrayerTimeCache() {
  const keysToDelete = []
  for (const key of cache.keys()) {
    if (key.startsWith('prayer_') || key === 'masjids_bc') {
      keysToDelete.push(key)
    }
  }
  keysToDelete.forEach(key => cache.delete(key))
}