/**
 * Central API key configuration.
 *
 * The app works WITHOUT any keys — free services (Open-Meteo, Nominatim,
 * USDA) are used as defaults. Adding keys here unlocks enhanced features:
 *
 *   MAPBOX_TOKEN     → more reliable geocoding (higher rate limits)
 *   SPOONACULAR_KEY  → recipe suggestions for in-season produce
 *   POSTHOG_KEY      → analytics dashboard (which produce people tap, etc.)
 *
 * To add keys, replace the empty strings below. Never commit real keys to
 * a public repo — use environment variables or expo-constants in production.
 */

// Mapbox: free tier gives 100k geocoding requests/month
// Get a key at https://account.mapbox.com/access-tokens/
export const MAPBOX_TOKEN = "";

// Spoonacular: free tier gives 150 requests/day
// Get a key at https://spoonacular.com/food-api/console
export const SPOONACULAR_KEY = "";

// PostHog: generous free tier (1M events/month)
// Get a key at https://app.posthog.com/signup
export const POSTHOG_KEY = "";

// ── Helper to check if a key is configured ──────────────────────

export function hasKey(key) {
  return typeof key === "string" && key.length > 0;
}
