/**
 * Favorites persistence layer.
 *
 * Stores the user's favorite produce IDs in AsyncStorage so they
 * survive app restarts. The notification scheduler reads this list
 * to alert users when their favorites come into season.
 */

import { readCache, writeCache } from "./cache";

const FAVORITES_KEY = "favorites";

/**
 * Get the full set of favorited produce IDs.
 * @returns {Set<string>}
 */
export async function getFavorites() {
  const data = await readCache(FAVORITES_KEY);
  return new Set(data || []);
}

/**
 * Toggle a produce item as favorite/unfavorite.
 * Returns the new favorite state (true = now favorited).
 */
export async function toggleFavorite(produceId) {
  const favorites = await getFavorites();

  if (favorites.has(produceId)) {
    favorites.delete(produceId);
  } else {
    favorites.add(produceId);
  }

  // Persist as an array (Sets aren't JSON-serializable)
  await writeCache(FAVORITES_KEY, [...favorites]);
  return favorites.has(produceId);
}

/**
 * Check if a specific produce item is favorited.
 */
export async function isFavorite(produceId) {
  const favorites = await getFavorites();
  return favorites.has(produceId);
}
