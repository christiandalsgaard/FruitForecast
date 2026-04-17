/**
 * Weather adjustment system for source region scoring.
 *
 * Fetches recent weather (past 30 days) and 30-year climate normals
 * from Open-Meteo's free APIs, computes anomalies, and translates
 * them into score adjustments (-20 to +8).
 *
 * The idea: if a source region is experiencing drought, frost, or
 * heat stress, the produce it ships will be lower quality than the
 * base seasonal score suggests. Ideal conditions get a small bonus.
 *
 * All results are cached via the existing cache layer:
 *   - Recent weather: 6 hours (conditions change)
 *   - Climate normals: 30 days (30-year averages don't change)
 */

import { getCached, TTL } from "./cache";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const CLIMATE_URL = "https://climate-api.open-meteo.com/v1/climate";

// ── Date helpers ────────────────────────────────────────────────

// Format a Date as "YYYY-MM-DD" for Open-Meteo API parameters
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Fetch recent weather (past 30 days) ─────────────────────────
// Returns daily max temp and precipitation for the past 30 days
// from the Open-Meteo archive endpoint.
async function fetchRecentWeather(lat, lon) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // yesterday (today may not be available)
  const start = new Date(end);
  start.setDate(start.getDate() - 29); // 30 days total

  const url =
    `${ARCHIVE_URL}?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&start_date=${formatDate(start)}&end_date=${formatDate(end)}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Archive API ${response.status}`);

  const data = await response.json();
  return {
    maxTemps: data.daily.temperature_2m_max || [],
    minTemps: data.daily.temperature_2m_min || [],
    precip: data.daily.precipitation_sum || [],
  };
}

// ── Fetch climate normals (30-year averages) ────────────────────
// Gets the average daily max temp and precipitation for the same
// 30-day window, based on 1991-2020 climate normals.
// We fetch for the current year's dates but use the climate model
// which returns 30-year average values for each day of year.
async function fetchClimateNormals(lat, lon) {
  // Use the same date range as recent weather
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);

  // Build the date range string using a reference year within the 1991-2020 window
  // Climate API needs dates within its model range
  const startNormal = `${2010}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endNormal = `${2010}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  const url =
    `${CLIMATE_URL}?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&start_date=${startNormal}&end_date=${endNormal}` +
    `&daily=temperature_2m_max,precipitation_sum` +
    `&models=EC_Earth3P_HR`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Climate API ${response.status}`);

  const data = await response.json();
  return {
    maxTemps: data.daily.temperature_2m_max || [],
    precip: data.daily.precipitation_sum || [],
  };
}

// ── Compute anomalies ───────────────────────────────────────────
// Compare recent weather to climate normals and return deviations.
function computeAnomaly(recent, normals) {
  // Temperature anomaly: average difference in daily max temps (°C)
  let tempDiffs = [];
  const tempLen = Math.min(recent.maxTemps.length, normals.maxTemps.length);
  for (let i = 0; i < tempLen; i++) {
    if (recent.maxTemps[i] != null && normals.maxTemps[i] != null) {
      tempDiffs.push(recent.maxTemps[i] - normals.maxTemps[i]);
    }
  }
  const tempAnomaly =
    tempDiffs.length > 0
      ? tempDiffs.reduce((a, b) => a + b, 0) / tempDiffs.length
      : 0;

  // Precipitation anomaly: ratio of (actual - normal) / normal
  // Positive = wetter than normal, negative = drier
  const recentPrecipTotal = recent.precip
    .filter((v) => v != null)
    .reduce((a, b) => a + b, 0);
  const normalPrecipTotal = normals.precip
    .filter((v) => v != null)
    .reduce((a, b) => a + b, 0);

  // Avoid division by zero in arid regions where normal precip is near zero
  const precipAnomaly =
    normalPrecipTotal > 1
      ? (recentPrecipTotal - normalPrecipTotal) / normalPrecipTotal
      : 0;

  return { tempAnomaly, precipAnomaly };
}

// ── Score adjustment from anomalies ─────────────────────────────
// Maps weather anomalies to a score adjustment between -20 and +8.
// Multiple stress factors are additive (drought + heat = worse).
function computeAdjustment(tempAnomaly, precipAnomaly) {
  let adjustment = 0;

  // Heat stress — sustained high temperatures reduce crop quality
  if (tempAnomaly > 5) adjustment -= 12;
  else if (tempAnomaly > 3) adjustment -= 6;
  else if (tempAnomaly > 1) adjustment -= 2;

  // Cold stress — frost damage can devastate harvests
  if (tempAnomaly < -5) adjustment -= 15;
  else if (tempAnomaly < -3) adjustment -= 8;
  else if (tempAnomaly < -1) adjustment -= 2;

  // Drought — insufficient water reduces yield and quality
  if (precipAnomaly < -0.5) adjustment -= 10;
  else if (precipAnomaly < -0.3) adjustment -= 5;

  // Excessive rain — flooding, rot, diluted flavor
  if (precipAnomaly > 0.8) adjustment -= 8;
  else if (precipAnomaly > 0.5) adjustment -= 3;

  // Ideal conditions bonus — goldilocks weather gets a boost
  if (Math.abs(tempAnomaly) < 1 && Math.abs(precipAnomaly) < 0.2) {
    adjustment += 5;
  }

  // Clamp to prevent weather from completely overriding seasonality
  return Math.max(-20, Math.min(8, adjustment));
}

// ── Human-readable weather narrative ────────────────────────────
// Short text explaining the weather impact for display in the UI.
function buildNarrative(tempAnomaly, precipAnomaly, regionName) {
  const parts = [];

  if (tempAnomaly > 5) parts.push(`Heat stress in ${regionName}`);
  else if (tempAnomaly > 3) parts.push(`Warmer than usual in ${regionName}`);
  else if (tempAnomaly < -5) parts.push(`Severe cold in ${regionName}`);
  else if (tempAnomaly < -3) parts.push(`Cold snap in ${regionName}`);

  if (precipAnomaly < -0.5) parts.push("drought conditions");
  else if (precipAnomaly < -0.3) parts.push("drier than normal");
  else if (precipAnomaly > 0.8) parts.push("excessive rainfall");
  else if (precipAnomaly > 0.5) parts.push("wetter than normal");

  // Positive note for ideal conditions
  if (
    parts.length === 0 &&
    Math.abs(tempAnomaly) < 1 &&
    Math.abs(precipAnomaly) < 0.2
  ) {
    return `Ideal growing conditions in ${regionName}`;
  }

  return parts.length > 0 ? parts.join("; ") : null;
}

// ── Main: fetch and compute weather data for a source region ────
/**
 * Fetch weather data for a source region and compute the score
 * adjustment and narrative. Results are cached.
 *
 * @param {number} lat — source region latitude
 * @param {number} lon — source region longitude
 * @param {string} regionName — for narrative generation
 * @returns {{ adjustment, narrative, tempAnomaly, precipAnomaly }}
 */
export async function getSourceWeatherAdjustment(lat, lon, regionName) {
  const cacheKey = `srcweather:${lat.toFixed(1)},${lon.toFixed(1)}`;

  return getCached(
    cacheKey,
    async () => {
      // Fetch recent weather and climate normals in parallel
      const [recent, normals] = await Promise.all([
        fetchRecentWeather(lat, lon),
        fetchClimateNormals(lat, lon),
      ]);

      const { tempAnomaly, precipAnomaly } = computeAnomaly(recent, normals);
      const adjustment = computeAdjustment(tempAnomaly, precipAnomaly);
      const narrative = buildNarrative(tempAnomaly, precipAnomaly, regionName);

      return {
        adjustment,
        narrative,
        tempAnomaly: Math.round(tempAnomaly * 10) / 10,
        precipAnomaly: Math.round(precipAnomaly * 100) / 100,
      };
    },
    TTL.SOURCE_WEATHER,
  );
}

// ── Batch fetch for all unique source coordinates ───────────────
/**
 * Fetch weather adjustments for a list of unique source coordinates.
 * Uses Promise.allSettled so individual failures don't block others.
 * Returns a map keyed by "lat,lon" (1 decimal) → { adjustment, narrative }.
 *
 * @param {Array<{lat, lon, region}>} coords — unique source coordinates
 * @returns {Object} — map of "lat,lon" → weather data
 */
export async function fetchAllSourceWeather(coords) {
  const results = await Promise.allSettled(
    coords.map(async (c) => {
      const data = await getSourceWeatherAdjustment(
        c.lat,
        c.lon,
        c.region || "source region",
      );
      const key = `${c.lat.toFixed(1)},${c.lon.toFixed(1)}`;
      return { key, data };
    }),
  );

  const weatherMap = {};
  for (const result of results) {
    if (result.status === "fulfilled") {
      weatherMap[result.value.key] = result.value.data;
    }
    // Failed fetches are silently skipped — score just won't have
    // a weather adjustment for that source, which is fine.
  }

  return weatherMap;
}
