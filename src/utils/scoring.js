/**
 * Scoring engine for Fruit Forecast — source-aware seasonality.
 *
 * Replaces the old 5-tier scoring (100/60/50/25/10) with a continuous
 * 1-100 scale based on:
 *   1. Cosine curve centered on each source region's peak months
 *   2. Weighted blending across multiple source regions
 *   3. Weather anomaly adjustments per source region
 *
 * When no sourcing data exists for the user's market zone, falls back
 * to the item's top-level peak/shoulder arrays with climate shift
 * (backward compatible with the original behavior).
 */

// ── Circular mean of month indices ──────────────────────────────
// Months wrap around (11 → 0), so we can't just average them.
// Convert to angles on a unit circle, average the x/y components,
// then convert back to a month index.
function circularMean(months) {
  if (months.length === 0) return 0;
  let sumX = 0;
  let sumY = 0;
  for (const m of months) {
    const angle = (m / 12) * 2 * Math.PI;
    sumX += Math.cos(angle);
    sumY += Math.sin(angle);
  }
  let mean = Math.atan2(sumY / months.length, sumX / months.length);
  if (mean < 0) mean += 2 * Math.PI;
  return (mean / (2 * Math.PI)) * 12;
}

// ── Circular distance between two month values ─────────────────
// Returns the shortest distance around the 12-month circle.
// Works with fractional month values (e.g., center = 6.5).
function circularDist(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 12 - diff);
}

// ── Single-source seasonal score (cosine curve) ─────────────────
// Produces a smooth 1-100 score based on how close the target month
// is to the source's peak season. The curve is bell-shaped:
//   - 100 at peak center, gently declining to ~95 at peak edge
//   - Smooth S-curve through shoulder season (down to ~40)
//   - Tails off to ~5 for deeply off-season months
function singleSourceScore(peak, shoulder, targetMonth) {
  // Year-round sources always score high
  if (peak.length >= 11) return 97;
  if (peak.length === 0) return 5;

  const center = circularMean(peak);

  // Peak radius: half the span of peak months, minimum 0.5
  const peakRadius = Math.max(peak.length / 2, 0.5);

  // Shoulder radius: distance from center to farthest shoulder month.
  // If no shoulder months defined, use peakRadius + 1.5 as default.
  let shoulderRadius = peakRadius + 1.5;
  if (shoulder.length > 0) {
    let maxShoulderDist = 0;
    for (const s of shoulder) {
      const d = circularDist(center, s);
      if (d > maxShoulderDist) maxShoulderDist = d;
    }
    // Shoulder radius is at least peakRadius + 0.5 to ensure a smooth transition
    shoulderRadius = Math.max(maxShoulderDist + 0.5, peakRadius + 0.5);
  }

  const d = circularDist(targetMonth, center);

  // Region 1: Within peak — score 95-100
  if (d <= peakRadius) {
    return Math.round(95 + 5 * Math.cos((Math.PI * d) / peakRadius));
  }

  // Region 2: Within shoulder — smooth S-curve from 95 down to 40
  if (d <= shoulderRadius) {
    const t = (d - peakRadius) / (shoulderRadius - peakRadius);
    const score = 40 + 55 * Math.cos((Math.PI / 2) * t);
    return Math.round(Math.max(40, score));
  }

  // Region 3: Off-season — tails from 40 down to 5
  const maxDist = 6; // max possible circular distance is 6
  const remaining = maxDist - shoulderRadius;
  if (remaining <= 0) return 5;
  const t = Math.min((d - shoulderRadius) / remaining, 1);
  const score = 5 + 35 * Math.cos((Math.PI / 2) * t);
  return Math.round(Math.max(5, score));
}

// ── Multi-source blended score ──────────────────────────────────
// Each source region contributes to the final score proportional to
// its weight AND its current seasonal score. This means in-season
// sources naturally dominate the blend — you can't buy from a source
// that has nothing to ship.
function blendSourceScores(sources, targetMonth, weatherMap) {
  if (!sources || sources.length === 0) return null;

  let weightedSum = 0;
  let weightSum = 0;
  let totalBaseWeightedSum = 0;
  let totalWeatherAdj = 0;
  const details = [];

  for (const src of sources) {
    // Compute base seasonal score for this source
    const baseScore = singleSourceScore(src.peak, src.shoulder, targetMonth);

    // Look up weather adjustment for this source's coordinates
    const weatherKey = `${src.lat.toFixed(1)},${src.lon.toFixed(1)}`;
    const weatherData = weatherMap?.[weatherKey];
    const weatherAdj = weatherData?.adjustment || 0;
    const weatherNote = weatherData?.narrative || null;

    // Final score for this source = base + weather, clamped to 1-100
    const adjustedScore = Math.max(1, Math.min(100, baseScore + weatherAdj));

    // Effective weight: source's market share * its seasonal relevance.
    // This makes in-season sources dominate the blend naturally.
    const effectiveWeight = src.weight * adjustedScore;

    weightedSum += effectiveWeight * adjustedScore;
    totalBaseWeightedSum += effectiveWeight * baseScore;
    weightSum += effectiveWeight;

    // Track the weather adjustment contribution from this source
    totalWeatherAdj += effectiveWeight * weatherAdj;

    details.push({
      region: src.region,
      flag: src.flag,
      score: adjustedScore,
      baseScore,
      weatherAdj,
      weatherNote,
    });
  }

  // If all sources are deeply off-season, use the max score as a floor
  if (weightSum < 0.01) {
    const maxScore = Math.max(...details.map((d) => d.score));
    return {
      finalScore: maxScore,
      baseScore: maxScore,
      weatherAdjustment: 0,
      sourceDetails: details,
    };
  }

  const blendedFinal = Math.round(weightedSum / weightSum);
  const blendedBase = Math.round(totalBaseWeightedSum / weightSum);
  const blendedWeather = Math.round(totalWeatherAdj / weightSum);

  return {
    finalScore: Math.max(1, Math.min(100, blendedFinal)),
    baseScore: Math.max(1, Math.min(100, blendedBase)),
    weatherAdjustment: blendedWeather,
    sourceDetails: details,
  };
}

// ── Fallback scoring (no sourcing data) ─────────────────────────
// Uses the item's top-level peak/shoulder arrays with climate shift.
// This is the original behavior for market zones without sourcing data.
function fallbackScore(item, targetMonth, climateShift) {
  const adjustMonth = (m) => (m + climateShift + 12) % 12;
  const adjustedPeak = item.peak.map(adjustMonth);
  const adjustedShoulder = item.shoulder.map(adjustMonth);
  const score = singleSourceScore(adjustedPeak, adjustedShoulder, targetMonth);

  return {
    finalScore: score,
    baseScore: score,
    weatherAdjustment: 0,
    sourceDetails: [],
  };
}

// ── Main scoring function ───────────────────────────────────────
/**
 * Compute a rich seasonality score for a produce item.
 *
 * @param {Object} item          — produce item from PRODUCE_DB
 * @param {number} targetMonth   — 0-indexed month to score for
 * @param {string} marketZone    — market zone key (e.g., "US_NORTHEAST")
 * @param {number} climateShift  — fallback climate shift for unmapped zones
 * @param {Object} weatherMap    — keyed by "lat,lon" → { adjustment, narrative }
 * @returns {{ finalScore, baseScore, weatherAdjustment, sourceDetails }}
 */
export function computeProduceScore(
  item,
  targetMonth,
  marketZone,
  climateShift = 0,
  weatherMap = {},
) {
  // Try sourcing-based scoring first
  const sources = item.sourcing?.[marketZone];
  if (sources && sources.length > 0) {
    return blendSourceScores(sources, targetMonth, weatherMap);
  }

  // No sourcing data for this zone — use legacy fallback
  return fallbackScore(item, targetMonth, climateShift);
}

// ── Calendar score (for the 12-month bar chart) ─────────────────
// Simplified version that returns just a number for each month.
// Used by ProduceCard's season calendar visualization.
export function getCalendarScore(item, monthIndex, marketZone, climateShift, weatherMap) {
  const result = computeProduceScore(item, monthIndex, marketZone, climateShift, weatherMap);
  return result.finalScore;
}
