/**
 * Fruit Forecast — design tokens and theme constants.
 *
 * Traffic-light season palette:
 *   Green  → in season / peak
 *   Yellow → coming soon / shoulder
 *   Red    → off season / out of season
 *
 * Background and text use a warm peach/cream palette
 * for a friendly, produce-market feel.
 */

import { Platform } from "react-native";

export const COLORS = {
  // Core palette — warm, tropical, inviting
  background: "#FFF5EB",       // Peach cream
  backgroundAlt: "#FFE8D6",    // Warm apricot
  backgroundDark: "#FFDAB9",   // Peach puff
  text: "#3D2315",             // Rich cocoa brown
  textSecondary: "#6B4226",    // Warm brown
  textMuted: "#A0785C",        // Caramel
  textFaint: "#C4A882",        // Light tan
  accent: "#FF6B35",           // Tangerine orange — primary action color
  accentLight: "#FF8C5A",      // Light tangerine

  // ── Traffic-light season score colors ──────────────────────────
  peak: "#2E7D32",             // Deep green — peak freshness
  inSeason: "#43A047",         // Green — in season and available
  comingSoon: "#F9A825",       // Amber yellow — approaching season
  offSeason: "#E65100",        // Deep orange — winding down
  outOfSeason: "#C62828",      // Red — out of season

  // ── Card backgrounds — soft tinted washes ─────────────────────
  peakBg: "#E8F5E9",           // Light green wash
  peakBg2: "#C8E6C9",          // Deeper green wash
  inSeasonBg: "#F1F8E9",       // Pale green
  inSeasonBg2: "#DCEDC8",      // Soft green
  comingSoonBg: "#FFFDE7",     // Light yellow
  comingSoonBg2: "#FFF9C4",    // Soft yellow
  offSeasonBg: "#FFF3E0",      // Light orange
  offSeasonBg2: "#FFE0B2",     // Soft orange
  outBg: "#FFEBEE",            // Light red wash
  outBg2: "#FFCDD2",           // Soft red wash

  // ── Calendar bar colors — vivid strips ────────────────────────
  calPeak: "#2E7D32",          // Deep green
  calInSeason: "#66BB6A",      // Medium green
  calComing: "#F9A825",        // Amber yellow
  calOff: "#EF6C00",           // Orange
  calOut: "#EF5350",           // Red

  // ── Type badge colors ─────────────────────────────────────────
  fruitBadgeBg: "rgba(255,107,53,0.14)",
  fruitBadgeText: "#D84315",
  vegBadgeBg: "rgba(76,175,80,0.14)",
  vegBadgeText: "#2E7D32",

  white: "#ffffff",
  black: "#000000",
  separator: "rgba(61,35,21,0.08)",
  cardBorder: "rgba(61,35,21,0.06)",
  peakCardBorder: "rgba(46,125,50,0.25)",  // Green glow for peak cards
};

// Rounded, friendly fonts. Avenir Next (iOS) and Nunito (web) have a soft,
// organic feel that fits the produce-market vibe. Menlo/JetBrains Mono
// give labels a clean, informational look.
export const FONTS = {
  serif: Platform.select({
    ios: "Avenir Next",
    android: "sans-serif",
    web: "Nunito, Quicksand, 'Segoe UI', sans-serif",
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    web: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  }),
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
