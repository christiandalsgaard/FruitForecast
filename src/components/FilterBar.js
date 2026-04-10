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
      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: COLORS.peak }]}>{peakCount}</Text>
          <Text style={styles.statLabel}>AT PEAK</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: COLORS.inSeason }]}>{inSeasonCount}</Text>
          <Text style={styles.statLabel}>IN SEASON</Text>
        </View>
      </View>

      {/* Filter buttons */}
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
    marginBottom: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 20,
  },
  stat: {},
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  buttons: {
    flexDirection: "row",
    gap: 6,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.15)",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  btnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "400",
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },
  btnTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
