/**
 * User preferences persistence layer.
 *
 * Stores the user's chosen region, notification preferences, and
 * display settings so they survive app restarts. On first launch,
 * returns sensible defaults (auto-detect location, notifications on).
 *
 * Stored via the cache layer so it works on both web (localStorage)
 * and native (AsyncStorage).
 */

import { readCache, writeCache } from "./cache";

// Cache key for the preferences object
const PREFS_KEY = "preferences";

// Default preferences applied on first launch or when a key is missing
const DEFAULTS = {
  // Region: null means "auto-detect from device location"
  savedRegion: null,           // { name, latitude, longitude } or null
  // Notifications: whether to schedule season alerts for favorites
  notificationsEnabled: true,
  // Display: preferred distance unit for market finder
  distanceUnit: "mi",          // "mi" or "km"
  // Onboarding: whether the user has seen the welcome flow
  hasSeenOnboarding: false,
};

/**
 * Load all preferences, merged with defaults so new keys are always present.
 *
 * @returns {Promise<Object>} — full preferences object
 */
export async function getPreferences() {
  const stored = await readCache(PREFS_KEY);
  // Merge stored values over defaults so new keys added in updates
  // get their default value without wiping existing prefs
  return { ...DEFAULTS, ...(stored || {}) };
}

/**
 * Update one or more preference keys. Merges with existing prefs
 * so you can update a single field without losing the rest.
 *
 * @param {Object} updates — key/value pairs to update (e.g. { distanceUnit: "km" })
 * @returns {Promise<Object>} — the full updated preferences object
 */
export async function updatePreferences(updates) {
  const current = await getPreferences();
  const updated = { ...current, ...updates };
  await writeCache(PREFS_KEY, updated);
  return updated;
}

/**
 * Save the user's chosen region so it's restored on next app launch.
 * Pass null to revert to auto-detect mode.
 *
 * @param {{ name: string, latitude: number, longitude: number } | null} region
 */
export async function saveRegion(region) {
  return updatePreferences({ savedRegion: region });
}

/**
 * Get the saved region, or null if the user prefers auto-detect.
 *
 * @returns {Promise<{ name: string, latitude: number, longitude: number } | null>}
 */
export async function getSavedRegion() {
  const prefs = await getPreferences();
  return prefs.savedRegion;
}

/**
 * Toggle notification preference on/off.
 *
 * @param {boolean} enabled
 */
export async function setNotificationsEnabled(enabled) {
  return updatePreferences({ notificationsEnabled: enabled });
}
