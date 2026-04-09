/**
 * Fruit Forecast — design tokens and theme constants.
 */

export const COLORS = {
  // Core palette
  background: "#fdfcfb",
  backgroundAlt: "#f5f0eb",
  backgroundDark: "#e8e0d8",
  text: "#2c2c2c",
  textSecondary: "#6b6256",
  textMuted: "#8a7a6a",
  textFaint: "#aaaaaa",
  accent: "#2d6a4f",
  accentLight: "#52796f",

  // Season score colors
  peak: "#2d6a4f",
  inSeason: "#52796f",
  comingSoon: "#8a7044",
  offSeason: "#8b6f5e",
  outOfSeason: "#7a7a7a",

  // Season score backgrounds
  peakBg: "#d8f3dc",
  peakBg2: "#b7e4c7",
  inSeasonBg: "#e8f5e9",
  inSeasonBg2: "#dcedc8",
  comingSoonBg: "#fff8e1",
  comingSoonBg2: "#ffecb3",
  offSeasonBg: "#fbe9e7",
  offSeasonBg2: "#ffccbc",
  outBg: "#f5f5f5",
  outBg2: "#e0e0e0",

  // Calendar bar colors
  calPeak: "#2d6a4f",
  calInSeason: "#81b29a",
  calComing: "#c9b458",
  calOff: "#d4a574",
  calOut: "#e0dcd7",

  // Type badge colors
  fruitBadgeBg: "rgba(255,152,0,0.12)",
  fruitBadgeText: "#e65100",
  vegBadgeBg: "rgba(76,175,80,0.12)",
  vegBadgeText: "#2e7d32",

  white: "#ffffff",
  black: "#000000",
  separator: "rgba(0,0,0,0.06)",
  cardBorder: "rgba(0,0,0,0.05)",
  peakCardBorder: "rgba(45,106,79,0.2)",
};

export const FONTS = {
  serif: "Georgia",
  mono: "Courier New",
};

export function getScoreColor(score) {
  if (score === 100) return COLORS.peak;
  if (score >= 60) return COLORS.inSeason;
  if (score >= 50) return COLORS.comingSoon;
  if (score >= 25) return COLORS.offSeason;
  return COLORS.outOfSeason;
}

export function getScoreBgColors(score) {
  if (score === 100) return [COLORS.peakBg, COLORS.peakBg2];
  if (score >= 60) return [COLORS.inSeasonBg, COLORS.inSeasonBg2];
  if (score >= 50) return [COLORS.comingSoonBg, COLORS.comingSoonBg2];
  if (score >= 25) return [COLORS.offSeasonBg, COLORS.offSeasonBg2];
  return [COLORS.outBg, COLORS.outBg2];
}

export function getCalendarBarColor(score) {
  if (score === 100) return COLORS.calPeak;
  if (score >= 60) return COLORS.calInSeason;
  if (score >= 50) return COLORS.calComing;
  if (score >= 25) return COLORS.calOff;
  return COLORS.calOut;
}
