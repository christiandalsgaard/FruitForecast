/**
 * Weather and geocoding utilities.
 *
 * Weather: Open-Meteo (free, no key, CORS-friendly)
 * Geocoding: Mapbox (if key provided) → Nominatim (free fallback)
 *
 * All results are cached via the caching layer so the app works
 * offline after the first successful fetch.
 */

import { getLocationName } from "./season";
import { getCached, TTL } from "./cache";
import { MAPBOX_TOKEN, hasKey } from "../config/api";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

// ── Weather ─────────────────────────────────────────────────────

/**
 * Fetch current weather conditions for a given latitude/longitude.
 * Returns temperature in °F and relative humidity %.
 * Results are cached for 30 minutes.
 */
export async function fetchWeather(latitude, longitude) {
  // Round coords to 2 decimal places for cache key stability —
  // tiny GPS jitter shouldn't produce separate cache entries.
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);
  const cacheKey = `weather:${lat},${lon}`;

  return getCached(
    cacheKey,
    async () => {
      const url =
        `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m` +
        `&temperature_unit=fahrenheit`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);

      const data = await response.json();
      return {
        temp: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
      };
    },
    TTL.WEATHER,
  );
}

// ── Geocoding ───────────────────────────────────────────────────

/**
 * Convert latitude/longitude into a human-readable place name.
 *
 * Strategy:
 *   1. If MAPBOX_TOKEN is set → use Mapbox (higher rate limits, more reliable)
 *   2. Otherwise → use Nominatim (free, 1 req/sec limit)
 *   3. Both fail → use the coarse region name from season.js
 *
 * Results are cached for 7 days since cities don't move.
 */
export async function reverseGeocode(latitude, longitude) {
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);
  const cacheKey = `geocode:${lat},${lon}`;

  return getCached(
    cacheKey,
    async () => {
      // Try Mapbox first if a token is available — it has much higher
      // rate limits (100k/month free) and better international coverage.
      if (hasKey(MAPBOX_TOKEN)) {
        try {
          return await geocodeMapbox(latitude, longitude);
        } catch (error) {
          console.warn("Mapbox geocode failed, trying Nominatim:", error.message);
        }
      }

      // Fall back to Nominatim (OpenStreetMap, free, 1 req/sec limit)
      try {
        return await geocodeNominatim(latitude, longitude);
      } catch (error) {
        console.warn("Nominatim geocode failed, using fallback:", error.message);
      }

      // Last resort — coarse region name based on lat/lon ranges
      return getLocationName(latitude, longitude);
    },
    TTL.GEOCODE,
  );
}

// ── Mapbox geocoding (requires MAPBOX_TOKEN) ────────────────────

async function geocodeMapbox(latitude, longitude) {
  // Mapbox reverse geocoding: pass {lng},{lat} (note the order!)
  const url =
    `${MAPBOX_GEOCODE_URL}/${longitude},${latitude}.json` +
    `?types=place,locality&limit=1&access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mapbox ${response.status}`);

  const data = await response.json();
  const feature = data.features?.[0];
  if (!feature) throw new Error("No Mapbox results");

  // Mapbox returns "place_name" like "Brooklyn, New York, United States"
  // We want just the first two parts (city, state/country).
  const parts = feature.place_name.split(", ");
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0] || getLocationName(latitude, longitude);
}

// ── Nominatim geocoding (free, no key) ──────────────────────────

async function geocodeNominatim(latitude, longitude) {
  const url =
    `${NOMINATIM_URL}?lat=${latitude}&lon=${longitude}` +
    `&format=json&zoom=10`;

  // Nominatim requires a User-Agent header per their usage policy
  const response = await fetch(url, {
    headers: { "User-Agent": "FruitForecast/1.0" },
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);

  const data = await response.json();
  const addr = data.address || {};

  // Try progressively broader place names until we find one
  const city =
    addr.city || addr.town || addr.village || addr.hamlet || addr.county;
  const state = addr.state;
  const country = addr.country_code?.toUpperCase();

  if (city && state) return `${city}, ${state}`;
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (state) return state;

  throw new Error("No useful address fields in Nominatim response");
}
