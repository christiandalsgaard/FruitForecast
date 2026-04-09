import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MONTH_NAMES } from "../data/produce";
import { getSeasonScore, getSeasonLabel } from "../utils/season";
import {
  COLORS,
  FONTS,
  getScoreColor,
  getScoreBgColors,
  getCalendarBarColor,
} from "../utils/theme";

// Enable LayoutAnimation on Android
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
  currentMonth,
  climateShift,
}) {
  const [expanded, setExpanded] = useState(false);

  const label = getSeasonLabel(score);
  const color = getScoreColor(score);
  const [bg1, bg2] = getScoreBgColors(score);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: bg1,
          borderColor: score === 100 ? COLORS.peakCardBorder : COLORS.cardBorder,
        },
      ]}
    >
      {/* Main row */}
      <View style={styles.row}>
        {/* Rank */}
        <Text style={styles.rank}>{rank}</Text>

        {/* Emoji */}
        <Text style={styles.emoji}>{item.emoji}</Text>

        {/* Name and description */}
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

        {/* Score indicator */}
        <View style={styles.scoreArea}>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
          <View style={styles.scoreBarBg}>
            <View
              style={[styles.scoreBar, { width: `${score}%`, backgroundColor: color }]}
            />
          </View>
        </View>
      </View>

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.expandedArea}>
          {/* Shopping tip */}
          {item.tips && (
            <View style={styles.tipContainer}>
              <Text style={styles.sectionTitle}>SHOPPING TIP</Text>
              <Text style={styles.tipText}>{item.tips}</Text>
            </View>
          )}

          {/* Season calendar */}
          <Text style={styles.sectionTitle}>SEASON CALENDAR</Text>
          <View style={styles.calendarRow}>
            {MONTH_NAMES.map((m, i) => {
              const mScore = getSeasonScore(item, i, climateShift);
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

          {/* Legend */}
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
  scoreArea: {
    width: 90,
    alignItems: "flex-end",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: FONTS.mono,
    marginBottom: 4,
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

  // Expanded
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
