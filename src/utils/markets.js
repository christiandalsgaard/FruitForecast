/**
 * Farmer's market finder using the USDA Local Food Directory.
 *
 * The USDA provides a free API (no key needed) to search for farmer's
 * markets by location. Results include market name, address, schedule,
 * and what products they sell.
 *
 * API docs: https://www.usda.gov/topics/farming/farmers-markets
 */

import { getCached, TTL } from "./cache";

const USDA_MARKETS_URL =
  "https://search.ams.usda.gov/farmersmarkets/v1/data.svc";

/**
 * Find farmer's markets near a given latitude/longitude.
 * Returns up to 5 nearby markets with their details.
 * Results are cached for 24 hours.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Array<{ name, address, schedule, distance, products }>}
 */
export async function findNearbyMarkets(latitude, longitude) {
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);
  const cacheKey = `markets:${lat},${lon}`;

  return getCached(
    cacheKey,
    async () => {
      // Step 1: Search for markets near the coordinates.
      // The USDA API returns a list of market IDs with distances.
      const searchUrl = `${USDA_MARKETS_URL}/locSearch?lat=${lat}&lng=${lon}`;
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`USDA search returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const results = searchData.results || [];

      // Take the 5 closest markets
      const top5 = results.slice(0, 5);
      if (top5.length === 0) return [];

      // Step 2: Fetch details for each market in parallel.
      // The detail endpoint gives us address, schedule, and products.
      const details = await Promise.all(
        top5.map(async (market) => {
          try {
            const detailUrl = `${USDA_MARKETS_URL}/mktDetail?id=${market.id}`;
            const detailResponse = await fetch(detailUrl);
            if (!detailResponse.ok) return null;

            const detailData = await detailResponse.json();
            const info = detailData.marketdetails || {};

            return {
              id: market.id,
              name: cleanMarketName(market.marketname),
              distance: extractDistance(market.marketname),
              address: info.Address || "Address not available",
              schedule: info.Schedule || "Schedule not available",
              // Products is a semicolon-separated string of categories
              products: info.Products
                ? info.Products.split(";").map((p) => p.trim()).filter(Boolean)
                : [],
              // Google Maps link for directions
              mapsUrl: info.GoogleLink || null,
            };
          } catch {
            return null;
          }
        }),
      );

      // Filter out any failed detail fetches
      return details.filter(Boolean);
    },
    TTL.MARKETS,
  );
}

/**
 * USDA market names come as "1.2 miles away: Market Name"
 * — strip the distance prefix to get just the name.
 */
function cleanMarketName(rawName) {
  if (!rawName) return "Unknown Market";
  // The USDA prepends the distance like "1.2 Market Name" or similar
  const match = rawName.match(/^\d+[\d.]*\s+(.*)/);
  return match ? match[1] : rawName;
}

/**
 * Extract the numeric distance (miles) from the USDA market name string.
 */
function extractDistance(rawName) {
  if (!rawName) return null;
  const match = rawName.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}
