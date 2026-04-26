/**
 * MonthSelector — compact single-row month picker.
 *
 * Shows all 12 months as tappable pills in a horizontal scroll.
 * The active month is highlighted with the accent color.
 * No header labels — the selected state is self-explanatory.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MONTH_ABBR } from "../data/produce";
import { COLORS, FONTS } from "../utils/theme";

export default function MonthSelector({ selectedMonth, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {MONTH_ABBR.map((abbr, i) => {
        const isActive = i === selectedMonth;
        return (
          <TouchableOpacity
            key={abbr}
            onPress={() => onSelect(i)}
            activeOpacity={0.7}
            style={[
              styles.monthButton,
              isActive && styles.monthButtonActive,
            ]}
          >
            <Text
              style={[
                styles.monthText,
                isActive && styles.monthTextActive,
              ]}
            >
              {abbr}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  scrollContent: {
    // Compact row of month pills with consistent spacing
    gap: 4,
    paddingVertical: 2,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  monthButtonActive: {
    backgroundColor: COLORS.accent,
  },
  monthText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    fontFamily: FONTS.mono,
  },
  monthTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
