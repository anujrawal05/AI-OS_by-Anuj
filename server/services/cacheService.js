/**
 * Centralized caching service for frequently accessed public data 
 * with TTL support and dynamic invalidation.
 */
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Insert key-value pair with custom TTL.
   * 
   * @param {string} key 
   * @param {*} value 
   * @param {number} [ttlMs] Expiry duration in milliseconds (default: 5 minutes)
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Resolve cached data. Evicts key dynamically if expired.
   * 
   * @param {string} key 
   * @returns {*} Cached value or null
   */
  get(key) {
    const data = this.cache.get(key);
    if (!data) return null;
    
    if (Date.now() > data.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return data.value;
  }

  /**
   * Evict specific entry.
   * 
   * @param {string} key 
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Flush entire cache maps.
   */
  clear() {
    this.cache.clear();
  }
}

module.exports = new CacheService();
