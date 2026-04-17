/**
 * Market Zones — broad geographic regions where users shop.
 *
 * Each zone defines a bounding box for matching user coordinates.
 * The zone determines which sourcing data to use for each produce item,
 * since produce sold in the US Northeast is sourced from different
 * regions than produce sold in Northern Europe or the US West Coast.
 *
 * When the user's coordinates don't fall in any defined zone, we fall
 * back to the nearest zone by centroid distance, so no location is
 * left without sourcing data.
 */

// ── Zone definitions ────────────────────────────────────────────
// Each zone has a human-readable name, a bounding box (lat/lon min/max),
// and a flag emoji for UI display. Zones are checked in order; the first
// match wins. Order matters for overlapping boundaries.

export const MARKET_ZONES = {
  US_NORTHEAST: {
    name: "US Northeast",
    flag: "🇺🇸",
    bounds: { latMin: 38, latMax: 48, lonMin: -80, lonMax: -66 },
  },
  US_SOUTHEAST: {
    name: "US Southeast",
    flag: "🇺🇸",
    bounds: { latMin: 24, latMax: 38, lonMin: -92, lonMax: -75 },
  },
  US_WEST: {
    name: "US West Coast",
    flag: "🇺🇸",
    bounds: { latMin: 32, latMax: 49, lonMin: -125, lonMax: -114 },
  },
  US_CENTRAL: {
    name: "US Central",
    flag: "🇺🇸",
    bounds: { latMin: 29, latMax: 49, lonMin: -114, lonMax: -80 },
  },
  NORTHERN_EUROPE: {
    name: "Northern Europe",
    flag: "🇪🇺",
    bounds: { latMin: 48, latMax: 62, lonMin: -12, lonMax: 30 },
  },
  OCEANIA: {
    name: "Oceania",
    flag: "🇦🇺",
    bounds: { latMin: -48, latMax: -10, lonMin: 110, lonMax: 180 },
  },
  SOUTH_AMERICA: {
    name: "South America",
    flag: "🇧🇷",
    bounds: { latMin: -56, latMax: 13, lonMin: -82, lonMax: -34 },
  },
  EAST_ASIA: {
    name: "East Asia",
    flag: "🇯🇵",
    bounds: { latMin: 22, latMax: 46, lonMin: 100, lonMax: 150 },
  },
  SOUTHERN_AFRICA: {
    name: "Southern Africa",
    flag: "🇿🇦",
    bounds: { latMin: -35, latMax: 0, lonMin: 10, lonMax: 42 },
  },
};

// ── Zone detection ──────────────────────────────────────────────

/**
 * Determine which market zone the user is in based on lat/lon.
 * Returns the zone key (e.g., "US_NORTHEAST") or the nearest zone
 * if no bounding box matches.
 */
export function getMarketZone(latitude, longitude) {
  // First pass: check bounding boxes for a direct match
  for (const [key, zone] of Object.entries(MARKET_ZONES)) {
    const { latMin, latMax, lonMin, lonMax } = zone.bounds;
    if (
      latitude >= latMin &&
      latitude <= latMax &&
      longitude >= lonMin &&
      longitude <= lonMax
    ) {
      return key;
    }
  }

  // No direct match — find the nearest zone by centroid distance.
  // Uses simple Euclidean distance on lat/lon which is fine for
  // "which continent are you closest to" level accuracy.
  let nearestKey = "US_NORTHEAST"; // sensible default
  let minDist = Infinity;

  for (const [key, zone] of Object.entries(MARKET_ZONES)) {
    const { latMin, latMax, lonMin, lonMax } = zone.bounds;
    const centroidLat = (latMin + latMax) / 2;
    const centroidLon = (lonMin + lonMax) / 2;
    const dist =
      (latitude - centroidLat) ** 2 + (longitude - centroidLon) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearestKey = key;
    }
  }

  return nearestKey;
}

/**
 * Get all unique source region coordinates for a given market zone
 * across all produce items. Used to deduplicate weather fetches —
 * many items share the same source regions (e.g., California).
 *
 * @param {Array} produceDB — the full PRODUCE_DB array
 * @param {string} zoneKey — market zone key (e.g., "US_NORTHEAST")
 * @returns {Array<{lat: number, lon: number}>} — deduplicated coordinates
 */
export function getUniqueSourceCoords(produceDB, zoneKey) {
  const seen = new Set();
  const coords = [];

  for (const item of produceDB) {
    const sources = item.sourcing?.[zoneKey];
    if (!sources) continue;

    for (const src of sources) {
      // Round to 1 decimal for deduplication — locations within ~11km
      // are close enough to share weather data
      const key = `${src.lat.toFixed(1)},${src.lon.toFixed(1)}`;
      if (!seen.has(key)) {
        seen.add(key);
        coords.push({ lat: src.lat, lon: src.lon });
      }
    }
  }

  return coords;
}
