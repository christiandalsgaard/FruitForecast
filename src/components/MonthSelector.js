import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MONTH_ABBR, MONTH_NAMES } from "../data/produce";
import { COLORS, FONTS } from "../utils/theme";

export default function MonthSelector({ selectedMonth, onSelect }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>MONTH</Text>
        <Text style={styles.currentMonth}>
          {MONTH_NAMES[selectedMonth]}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.12)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    letterSpacing: 3,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  currentMonth: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  scrollContent: {
    gap: 6,
  },
  monthButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  monthButtonActive: {
    backgroundColor: COLORS.accent,
  },
  monthText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
  },
  monthTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
