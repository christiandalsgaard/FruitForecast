/**
 * Farmer's market finder using OpenStreetMap Overpass API.
 *
 * The old USDA Local Food Directory API has been retired. We now use
 * the Overpass API to query OpenStreetMap for nodes/ways tagged as
 * farmer's markets (shop=farm, amenity=marketplace, etc.) within a
 * radius of the user's location. This works globally, not just the US.
 *
 * Overpass is free, requires no API key, and has excellent coverage
 * because it draws from the same data volunteers maintain on OSM.
 */

import { getCached, clearCacheKey, TTL } from "./cache";

// Public Overpass endpoint — rate-limited but generous for light use
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Search radius in meters (15 km ≈ 9.3 miles)
const SEARCH_RADIUS_M = 15000;

/**
 * Find farmer's markets near a given latitude/longitude.
 * Returns up to 8 nearby markets sorted by distance.
 * Results are cached for 24 hours.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Array<{ id, name, address, distance, lat, lon }>}
 */
export async function findNearbyMarkets(latitude, longitude) {
  // Round coords to 2 decimals for cache key stability
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);
  const cacheKey = `markets:${lat},${lon}`;

  // Try cache first — but only return if we have a valid (non-empty) result.
  // Previous errors or empty arrays from failed fetches should not block retries.
  return getCached(
    cacheKey,
    () => fetchMarketsFromOverpass(latitude, longitude),
    TTL.MARKETS,
  );
}

/**
 * Fetch markets from Overpass API. Separated from cache logic so the
 * retry button in MarketFinder can call findNearbyMarkets after clearing
 * the cache key, and this function handles the actual network request.
 */
async function fetchMarketsFromOverpass(latitude, longitude) {
  // Overpass QL query — compact single-line to avoid 406 errors from
  // Apache's mod_negotiation when whitespace inflates the request.
  const query = [
    "[out:json][timeout:15];",
    "(",
    `node["shop"="farm"](around:${SEARCH_RADIUS_M},${latitude},${longitude});`,
    `node["amenity"="marketplace"](around:${SEARCH_RADIUS_M},${latitude},${longitude});`,
    `node["shop"="greengrocer"](around:${SEARCH_RADIUS_M},${latitude},${longitude});`,
    `way["amenity"="marketplace"](around:${SEARCH_RADIUS_M},${latitude},${longitude});`,
    `way["shop"="farm"](around:${SEARCH_RADIUS_M},${latitude},${longitude});`,
    ");",
    "out center body;",
  ].join("");

  // Use URLSearchParams as the POST body — browsers automatically set
  // Content-Type: application/x-www-form-urlencoded (a CORS "simple" type,
  // no preflight needed) and handle encoding correctly.
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    throw new Error(`Overpass returned ${response.status}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  // Parse each element into a clean market object
  const markets = elements
    .map((el) => {
      const tags = el.tags || {};
      // For ways, Overpass returns center coords when using "out center"
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) return null;

      // Build a readable name — fall back to the shop/amenity type
      const name =
        tags.name ||
        tags["name:en"] ||
        formatType(tags.shop || tags.amenity);

      // Build address from addr:* tags
      const address = buildAddress(tags);

      // Compute straight-line distance from user
      const dist = haversineKm(latitude, longitude, elLat, elLon);

      return {
        id: `${el.type}/${el.id}`,
        name,
        address,
        distance: dist,
        schedule: tags.opening_hours || null,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        lat: elLat,
        lon: elLon,
      };
    })
    .filter(Boolean);

  // Sort by distance and return closest 8
  markets.sort((a, b) => a.distance - b.distance);
  return markets.slice(0, 8);
}

/**
 * Haversine formula — returns distance between two points in km.
 * Used to sort markets by proximity to the user.
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Build a human-readable address from OSM addr:* tags.
 * Returns null if no address tags are present.
 */
function buildAddress(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"] || tags["addr:province"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Format a raw OSM tag value into a readable type label.
 * e.g., "greengrocer" → "Greengrocer", "marketplace" → "Marketplace"
 */
function formatType(type) {
  if (!type) return "Market";
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}
