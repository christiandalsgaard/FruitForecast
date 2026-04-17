/**
 * Season scoring utilities for Fruit Forecast.
 *
 * Climate shifts adjust peak/shoulder months so that the same database
 * works for different hemispheres and latitudes.
 */

export function getClimateShift(latitude) {
  if (latitude < 0) return 6;   // Southern hemisphere — flip 6 months
  if (latitude > 45) return -1; // Northern cold — seasons arrive ~1 month later
  if (latitude < 25) return 1;  // Tropical — seasons arrive ~1 month earlier
  return 0;                     // Temperate default
}

export function getSeasonScore(item, monthIndex, climateShift = 0) {
  const adjustMonth = (m) => (m + climateShift + 12) % 12;
  const adjustedPeak = item.peak.map(adjustMonth);
  const adjustedShoulder = item.shoulder.map(adjustMonth);

  if (adjustedPeak.includes(monthIndex)) return 100;
  if (adjustedShoulder.includes(monthIndex)) return 60;

  // Distance to nearest peak month (wrapping around the year)
  let minDist = 12;
  for (const pm of adjustedPeak) {
    const dist = Math.min(
      Math.abs(monthIndex - pm),
      12 - Math.abs(monthIndex - pm),
    );
    if (dist < minDist) minDist = dist;
  }

  if (minDist === 1) return 50;
  if (minDist === 2) return 25;
  return 10;
}

export function getSeasonLabel(score) {
  if (score >= 90) return "Peak Season";
  if (score >= 70) return "In Season";
  if (score >= 50) return "Coming Soon";
  if (score >= 30) return "Off Season";
  return "Out of Season";
}

export function getSeasonInfo(month) {
  if ([2, 3, 4].includes(month)) return { emoji: "🌱", name: "Spring" };
  if ([5, 6, 7].includes(month)) return { emoji: "☀️", name: "Summer" };
  if ([8, 9, 10].includes(month)) return { emoji: "🍂", name: "Autumn" };
  return { emoji: "❄️", name: "Winter" };
}

export function getLocationName(lat, lon) {
  if (lat > 40 && lat < 50 && lon > -130 && lon < -60) return "Northern US";
  if (lat > 25 && lat <= 40 && lon > -130 && lon < -60) return "Southern US";
  if (lat > 50) return "Northern Region";
  if (lat < 25 && lat > 0) return "Tropical Region";
  if (lat < 0) return "Southern Hemisphere";
  return "Temperate Region";
}
