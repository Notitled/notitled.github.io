// ============================================
// CACHE MANAGER
// ============================================

import { CONFIG } from '../core/config.js';

/**
 * Manages caching with localStorage and in-memory Map
 */
export class CacheManager {
    constructor(prefix = 'blog_post_') {
        this.prefix = prefix;
        this.memoryCache = new Map();
    }

    /**
     * Get item from cache (memory first, then localStorage)
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    get(key) {
        // Check memory cache first
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key);
        }

        // Check localStorage
        try {
            const storageKey = this.prefix + key;
            const cached = localStorage.getItem(storageKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < CONFIG.CACHE_DURATION) {
                console.log(`Cache hit for ${key} (age: ${Math.round(age / 1000)}s)`);
                // Store in memory for faster subsequent access
                this.memoryCache.set(key, data);
                return data;
            }

            // Cache expired
            localStorage.removeItem(storageKey);
            return null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }

    /**
     * Save item to cache (both memory and localStorage)
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    set(key, data) {
        // Save to memory cache
        this.memoryCache.set(key, data);

        // Save to localStorage
        try {
            const storageKey = this.prefix + key;
            localStorage.setItem(storageKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.memoryCache.has(key) || this.get(key) !== null;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.memoryCache.clear();

        // Clear localStorage entries with our prefix
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
    }
}
