/**
 * Offline caching layer — platform-aware storage.
 *
 * On native (iOS/Android): uses AsyncStorage for persistent key-value storage.
 * On web: uses the browser's localStorage API, which has the same sync
 * get/set/remove interface but wrapped in async functions for consistency.
 *
 * Every cached item is stored as { data, expiresAt } so stale entries
 * are automatically skipped. This lets the app work offline after the
 * first successful fetch — weather, geocoding results, and market data
 * are all cached with configurable TTLs.
 *
 * Usage:
 *   const weather = await getCached("weather:40.71,-74.01", () => fetchWeather(40.71, -74.01), TTL.WEATHER);
 */

import { Platform } from "react-native";

// ── Platform-aware storage adapter ──────────────────────────────
// On web we use localStorage directly. On native we lazy-import
// AsyncStorage so the web bundle never pulls in the native module.
let storage;

if (Platform.OS === "web") {
  // localStorage adapter — same interface as AsyncStorage but synchronous
  // under the hood. Wrapped in Promises for API consistency.
  storage = {
    getItem: (key) => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    // getAllKeys isn't on localStorage natively — scan for our prefix
    getAllKeys: () => {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        return Promise.resolve(keys);
      } catch {
        return Promise.resolve([]);
      }
    },
    multiRemove: (keys) => {
      try {
        keys.forEach((k) => localStorage.removeItem(k));
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
  };
} else {
  // Native — use the real AsyncStorage module
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default;
  storage = AsyncStorage;
}

// Cache key prefix to avoid collisions with other storage users
const PREFIX = "@fruitforecast:";

// ── TTL constants (milliseconds) ────────────────────────────────
// Each data type has an appropriate expiry. Weather changes often;
// geocoding results and produce data are stable for much longer.
export const TTL = {
  WEATHER: 30 * 60 * 1000,       // 30 minutes — weather changes
  GEOCODE: 7 * 24 * 60 * 60 * 1000, // 7 days — cities don't move
  MARKETS: 24 * 60 * 60 * 1000,  // 24 hours — market schedules update
  RECIPES: 6 * 60 * 60 * 1000,   // 6 hours — recipe suggestions
  FAVORITES: Infinity,            // Never expires — user data
  SOURCE_WEATHER: 6 * 60 * 60 * 1000, // 6 hours — source region weather anomalies
};

/**
 * Get a value from cache, or fetch it if missing/expired.
 *
 * @param {string} key      — unique cache key (e.g. "weather:40.71,-74.01")
 * @param {Function} fetcher — async function that returns fresh data
 * @param {number} ttl       — time-to-live in ms (use TTL constants above)
 * @returns {any}            — cached or freshly fetched data
 */
export async function getCached(key, fetcher, ttl) {
  const fullKey = PREFIX + key;

  try {
    // Try to read from cache first
    const raw = await storage.getItem(fullKey);
    if (raw) {
      const { data, expiresAt } = JSON.parse(raw);
      // Return cached data if it hasn't expired
      if (expiresAt === null || Date.now() < expiresAt) {
        return data;
      }
    }
  } catch (error) {
    // Cache read failed — proceed to fetch. This can happen if storage
    // is corrupted or if the app was updated and the data format changed.
    console.warn("Cache read failed:", error.message);
  }

  // Cache miss or expired — fetch fresh data
  const data = await fetcher();

  try {
    // Store in cache with expiry timestamp
    const expiresAt = ttl === Infinity ? null : Date.now() + ttl;
    await storage.setItem(fullKey, JSON.stringify({ data, expiresAt }));
  } catch (error) {
    // Cache write failed — not critical, the data was still fetched
    console.warn("Cache write failed:", error.message);
  }

  return data;
}

/**
 * Read a value directly from cache without fetching.
 * Returns null if the key doesn't exist or has expired.
 */
export async function readCache(key) {
  try {
    const raw = await storage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (expiresAt !== null && Date.now() >= expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Write a value directly to cache.
 */
export async function writeCache(key, data, ttl = Infinity) {
  try {
    const expiresAt = ttl === Infinity ? null : Date.now() + ttl;
    await storage.setItem(
      PREFIX + key,
      JSON.stringify({ data, expiresAt }),
    );
  } catch (error) {
    console.warn("Cache write failed:", error.message);
  }
}

/**
 * Remove a specific key from cache.
 */
export async function clearCacheKey(key) {
  try {
    await storage.removeItem(PREFIX + key);
  } catch (error) {
    console.warn("Cache clear failed:", error.message);
  }
}

/**
 * Clear all Fruit Forecast cache entries.
 * Useful for debugging or when the user wants a fresh start.
 */
export async function clearAllCache() {
  try {
    const allKeys = await storage.getAllKeys();
    const ourKeys = allKeys.filter((k) => k.startsWith(PREFIX));
    if (ourKeys.length > 0) {
      await storage.multiRemove(ourKeys);
    }
  } catch (error) {
    console.warn("Cache clear all failed:", error.message);
  }
}
