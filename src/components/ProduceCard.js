/**
 * ProduceCard — expandable card showing a produce item's season status,
 * source regions, score breakdown, weather impact, shopping tips,
 * season calendar, and a favorite button.
 *
 * Tapping the card expands it to show detailed info. The heart button
 * in the top-right lets users favorite items for push notifications.
 * All taps are tracked via analytics.
 *
 * The expanded section now includes:
 *   1. SHOPPING TIP — existing
 *   2. WHERE IT'S SOURCED — flag + region name + individual score bar
 *   3. SCORE BREAKDOWN — base score, weather adjustment, final score
 *   4. Weather impact banner — conditional, shown when |adjustment| >= 5
 *   5. SEASON CALENDAR — 12-month bar chart
 *   6. Legend — color key for the calendar
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MONTH_NAMES } from "../data/produce";
import { getSeasonLabel } from "../utils/season";
import { getCalendarScore } from "../utils/scoring";
import { addJournalEntry } from "../utils/journal";
import {
  COLORS,
  FONTS,
  getScoreColor,
  getScoreBgColors,
  getCalendarBarColor,
} from "../utils/theme";
import { track, EVENTS } from "../utils/analytics";
import FavoriteButton from "./FavoriteButton";

// Enable LayoutAnimation on Android (no-op on web/iOS)
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProduceCard({
  item,
  rank,
  score,
  baseScore,
  weatherAdjustment,
  sourceDetails,
  currentMonth,
  climateShift,
  marketZone,
  sourceWeatherMap,
}) {
  const [expanded, setExpanded] = useState(false);
  // Log Purchase flow — shows inline form, then confirmation
  const [showLogForm, setShowLogForm] = useState(false);
  const [logNote, setLogNote] = useState("");
  const [logStatus, setLogStatus] = useState(null); // null | "saving" | "saved"

  const label = getSeasonLabel(score);
  const color = getScoreColor(score);
  const [bg1] = getScoreBgColors(score);

  // Whether we have meaningful source data to display
  const hasSources = sourceDetails && sourceDetails.length > 0;
  // Whether weather data has loaded (adjustment !== 0 or sources have weatherNote)
  const hasWeatherData = hasSources && sourceDetails.some((s) => s.weatherNote !== null);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);

    // Track produce taps for analytics
    if (!expanded) {
      track(EVENTS.PRODUCE_TAP, {
        produce: item.name,
        score,
        season: label,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: bg1,
          borderColor: score >= 90 ? COLORS.peakCardBorder : COLORS.cardBorder,
        },
      ]}
    >
      {/* Main row */}
      <View style={styles.row}>
        {/* Rank number */}
        <Text style={styles.rank}>{rank}</Text>

        {/* Produce emoji */}
        <Text style={styles.emoji}>{item.emoji}</Text>

        {/* Name, description, and type badge */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.type === "fruit"
                      ? COLORS.fruitBadgeBg
                      : COLORS.vegBadgeBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      item.type === "fruit"
                        ? COLORS.fruitBadgeText
                        : COLORS.vegBadgeText,
                  },
                ]}
              >
                {item.type}
              </Text>
            </View>
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>

        {/* Score indicator + favorite heart */}
        <View style={styles.scoreArea}>
          <View style={styles.scoreTopRow}>
            <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
            <FavoriteButton produceId={item.id} climateShift={climateShift} />
          </View>
          {/* Numeric score displayed prominently */}
          <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
          <View style={styles.scoreBarBg}>
            <View
              style={[styles.scoreBar, { width: `${score}%`, backgroundColor: color }]}
            />
          </View>
        </View>
      </View>

      {/* Expanded detail section */}
      {expanded && (
        <View style={styles.expandedArea}>
          {/* ── 1. Shopping tip ──────────────────────────────────── */}
          {item.tips && (
            <View style={styles.tipContainer}>
              <Text style={styles.sectionTitle}>SHOPPING TIP</Text>
              <Text style={styles.tipText}>{item.tips}</Text>
            </View>
          )}

          {/* ── LOG PURCHASE button/form ─────────────────────────── */}
          <View style={styles.logSection}>
            {logStatus === "saved" ? (
              // Confirmation feedback — shown for 2 seconds after save
              <View style={styles.logSavedBanner}>
                <Text style={styles.logSavedText}>
                  Logged to your Season Journal
                </Text>
              </View>
            ) : showLogForm ? (
              // Inline form — optional note + save/cancel buttons
              <View style={styles.logForm}>
                <TextInput
                  style={styles.logInput}
                  placeholder="Add a note (optional)..."
                  placeholderTextColor={COLORS.textFaint}
                  value={logNote}
                  onChangeText={setLogNote}
                  maxLength={200}
                  multiline={false}
                />
                <View style={styles.logFormBtns}>
                  <TouchableOpacity
                    style={styles.logCancelBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      setShowLogForm(false);
                      setLogNote("");
                    }}
                  >
                    <Text style={styles.logCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.logSaveBtn, logStatus === "saving" && { opacity: 0.5 }]}
                    activeOpacity={0.7}
                    disabled={logStatus === "saving"}
                    onPress={async () => {
                      setLogStatus("saving");
                      await addJournalEntry({
                        produceId: item.id,
                        produceName: item.name,
                        emoji: item.emoji,
                        note: logNote,
                        score,
                      });
                      setLogStatus("saved");
                      setShowLogForm(false);
                      setLogNote("");
                      // Reset saved banner after 2.5 seconds
                      setTimeout(() => setLogStatus(null), 2500);
                    }}
                  >
                    <Text style={styles.logSaveText}>
                      {logStatus === "saving" ? "Saving…" : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Default state — show the log button
              <TouchableOpacity
                style={styles.logBtn}
                activeOpacity={0.7}
                onPress={() => setShowLogForm(true)}
              >
                <Text style={styles.logBtnIcon}>📓</Text>
                <Text style={styles.logBtnText}>Log Purchase</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── 2. Source regions ────────────────────────────────── */}
          {hasSources && (
            <View style={styles.sourceSection}>
              <Text style={styles.sectionTitle}>WHERE IT'S SOURCED</Text>
              {sourceDetails.map((src, i) => (
                <View key={`${src.region}-${i}`} style={styles.sourceRow}>
                  {/* Flag + region name */}
                  <View style={styles.sourceNameArea}>
                    <Text style={styles.sourceFlag}>{src.flag}</Text>
                    <Text style={styles.sourceRegion}>{src.region}</Text>
                  </View>
                  {/* Individual source score bar */}
                  <View style={styles.sourceScoreArea}>
                    <Text style={[styles.sourceScore, { color: getScoreColor(src.score) }]}>
                      {src.score}
                    </Text>
                    <View style={styles.sourceBarBg}>
                      <View
                        style={[
                          styles.sourceBar,
                          {
                            width: `${src.score}%`,
                            backgroundColor: getScoreColor(src.score),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── 3. Score breakdown ───────────────────────────────── */}
          {hasSources && (
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>SCORE BREAKDOWN</Text>
              <View style={styles.breakdownRow}>
                {/* Base seasonal score */}
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Base</Text>
                  <Text style={styles.breakdownValue}>{baseScore}</Text>
                </View>

                {/* Weather adjustment */}
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Weather</Text>
                  {hasWeatherData ? (
                    <Text
                      style={[
                        styles.breakdownValue,
                        {
                          color:
                            weatherAdjustment > 0
                              ? COLORS.weatherPositiveText
                              : weatherAdjustment < 0
                                ? COLORS.weatherNegativeText
                                : COLORS.textMuted,
                        },
                      ]}
                    >
                      {weatherAdjustment > 0 ? "+" : ""}
                      {weatherAdjustment}
                    </Text>
                  ) : (
                    <Text style={[styles.breakdownValue, { color: COLORS.textFaint, fontSize: 10 }]}>
                      loading…
                    </Text>
                  )}
                </View>

                {/* Equals sign */}
                <Text style={styles.breakdownEquals}>=</Text>

                {/* Final score */}
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Final</Text>
                  <Text style={[styles.breakdownValueFinal, { color }]}>
                    {score}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── 4. Weather impact banner (conditional) ──────────── */}
          {hasSources &&
            hasWeatherData &&
            Math.abs(weatherAdjustment) >= 5 &&
            renderWeatherBanner(sourceDetails, weatherAdjustment)}

          {/* ── 5. Season calendar — 12 bars showing score per month ── */}
          <Text style={styles.sectionTitle}>SEASON CALENDAR</Text>
          <View style={styles.calendarRow}>
            {MONTH_NAMES.map((m, i) => {
              // Use the new scoring engine for calendar bars
              const mScore = getCalendarScore(item, i, marketZone, climateShift, sourceWeatherMap);
              const barColor = getCalendarBarColor(mScore);
              const isCurrent = i === currentMonth;
              return (
                <View key={m} style={styles.calendarCol}>
                  <View
                    style={[
                      styles.calendarBar,
                      {
                        backgroundColor: barColor,
                        opacity: isCurrent ? 1 : 0.65,
                        borderWidth: isCurrent ? 2 : 0,
                        borderColor: isCurrent ? COLORS.text : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.calendarLabel,
                      isCurrent && styles.calendarLabelActive,
                    ]}
                  >
                    {m.charAt(0)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── 6. Color legend for the calendar bars ────────────── */}
          <View style={styles.legend}>
            {[
              { color: COLORS.calPeak, label: "Peak" },
              { color: COLORS.calInSeason, label: "In Season" },
              { color: COLORS.calComing, label: "Coming Soon" },
              { color: COLORS.calOff, label: "Off Season" },
            ].map(({ color: c, label: l }) => (
              <View key={l} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c }]} />
                <Text style={styles.legendText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Weather impact banner ───────────────────────────────────────
// Shows a colored banner with the weather narrative when the
// weather adjustment is significant (>= 5 points).
function renderWeatherBanner(sourceDetails, weatherAdjustment) {
  // Collect unique weather notes from all sources
  const notes = sourceDetails
    .filter((s) => s.weatherNote)
    .map((s) => s.weatherNote);
  const uniqueNotes = [...new Set(notes)];
  if (uniqueNotes.length === 0) return null;

  const isPositive = weatherAdjustment > 0;
  const bannerBg = isPositive ? COLORS.weatherPositiveBg : COLORS.weatherNegativeBg;
  const bannerText = isPositive ? COLORS.weatherPositiveText : COLORS.weatherNegativeText;
  const icon = isPositive ? "✓" : "⚠";

  return (
    <View style={[styles.weatherBanner, { backgroundColor: bannerBg }]}>
      <Text style={[styles.weatherBannerIcon, { color: bannerText }]}>{icon}</Text>
      <Text style={[styles.weatherBannerText, { color: bannerText }]}>
        {uniqueNotes.join(". ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rank: {
    width: 28,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textFaint,
    fontFamily: FONTS.mono,
    textAlign: "center",
  },
  emoji: {
    fontSize: 30,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 50,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: FONTS.mono,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── Score area — label, numeric score, heart, and progress bar ──
  scoreArea: {
    width: 110,
    alignItems: "flex-end",
  },
  scoreTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: FONTS.mono,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: FONTS.mono,
    marginBottom: 3,
  },
  scoreBarBg: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBar: {
    height: "100%",
    borderRadius: 3,
  },

  // ── Expanded detail section ────────────────────────────────────
  expandedArea: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 10,
  },
  tipContainer: {
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontFamily: FONTS.serif,
  },

  // ── Log Purchase ──────────────────────────────────────────────
  logSection: {
    marginBottom: 16,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: "rgba(255,107,53,0.06)",
  },
  logBtnIcon: {
    fontSize: 14,
  },
  logBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accent,
    fontFamily: FONTS.serif,
  },
  logForm: {
    gap: 8,
  },
  logInput: {
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: FONTS.serif,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  logFormBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  logCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logCancelText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
  },
  logSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  logSaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
    fontFamily: FONTS.serif,
  },
  logSavedBanner: {
    backgroundColor: COLORS.peakBg,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  logSavedText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.peak,
    fontFamily: FONTS.serif,
  },

  // ── Source regions ─────────────────────────────────────────────
  sourceSection: {
    marginBottom: 16,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sourceNameArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  sourceFlag: {
    fontSize: 16,
  },
  sourceRegion: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: FONTS.serif,
    fontWeight: "500",
  },
  sourceScoreArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 90,
  },
  sourceScore: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: FONTS.mono,
    width: 28,
    textAlign: "right",
  },
  sourceBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  sourceBar: {
    height: "100%",
    borderRadius: 2,
  },

  // ── Score breakdown ───────────────────────────────────────────
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: COLORS.breakdownBg,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  breakdownItem: {
    alignItems: "center",
    gap: 2,
  },
  breakdownLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    textTransform: "uppercase",
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.mono,
    color: COLORS.text,
  },
  breakdownValueFinal: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: FONTS.mono,
  },
  breakdownEquals: {
    fontSize: 18,
    color: COLORS.textFaint,
    fontFamily: FONTS.mono,
    marginTop: 10,
  },

  // ── Weather impact banner ─────────────────────────────────────
  weatherBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  weatherBannerIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  weatherBannerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.serif,
    lineHeight: 17,
  },

  // ── Calendar ──────────────────────────────────────────────────
  calendarRow: {
    flexDirection: "row",
    gap: 3,
  },
  calendarCol: {
    flex: 1,
    alignItems: "center",
  },
  calendarBar: {
    height: 28,
    width: "100%",
    borderRadius: 4,
  },
  calendarLabel: {
    fontSize: 9,
    marginTop: 4,
    color: COLORS.textFaint,
    fontFamily: FONTS.mono,
  },
  calendarLabelActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  legend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
