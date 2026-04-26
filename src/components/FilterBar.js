/**
 * FilterBar — stats + filter buttons in a single compact row.
 *
 * Left side: peak and in-season counts as bold white numbers.
 * Right side: All / Fruits / Vegetables toggle buttons.
 * Designed for the sunset gradient background — white text with
 * subtle shadows for legibility.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../utils/theme";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "fruit", label: "Fruits" },
  { key: "vegetable", label: "Vegetables" },
];

export default function FilterBar({ filter, onFilterChange, peakCount, inSeasonCount }) {
  return (
    <View style={styles.container}>
      {/* Stats — compact white numbers on the gradient */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{peakCount}</Text>
          <Text style={styles.statLabel}>PEAK</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{inSeasonCount}</Text>
          <Text style={styles.statLabel}>IN SEASON</Text>
        </View>
      </View>

      {/* Filter toggle buttons */}
      <View style={styles.buttons}>
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onFilterChange(key)}
              activeOpacity={0.7}
              style={[styles.btn, isActive && styles.btnActive]}
            >
              <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: {
    alignItems: "center",
  },
  // Thin vertical line separating the two stat columns
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
    color: COLORS.white,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.7)",
    fontFamily: FONTS.mono,
  },
  buttons: {
    flexDirection: "row",
    gap: 6,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  btnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    fontFamily: FONTS.serif,
  },
  btnTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
