/**
 * InfoBar — row of info pills showing location, weather, and season.
 * The location pill is a tappable link that opens the region picker.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../utils/theme";
import { getSeasonInfo } from "../utils/season";

function getWeatherEmoji(temp) {
  if (temp > 85) return "🔥";
  if (temp > 70) return "☀️";
  if (temp > 50) return "🌤️";
  if (temp > 32) return "🌥️";
  return "🥶";
}

export default function InfoBar({ locationName, weather, month, onLocationPress }) {
  const season = getSeasonInfo(month);

  return (
    <View style={styles.row}>
      {/* Location pill — tappable so users can change their region */}
      <TouchableOpacity
        style={[styles.pill, styles.locationPill]}
        activeOpacity={0.6}
        onPress={onLocationPress}
      >
        <Text style={styles.pillText}>📍 </Text>
        <Text style={styles.locationText}>{locationName}</Text>
        <Text style={styles.chevron}> ▾</Text>
      </TouchableOpacity>

      {weather && (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{getWeatherEmoji(weather.temp)} </Text>
          <Text style={styles.pillBold}>{weather.temp}°F</Text>
          <Text style={styles.pillText}> · {weather.humidity}% humidity</Text>
        </View>
      )}

      <View style={styles.pill}>
        <Text style={styles.pillText}>{season.emoji} </Text>
        <Text style={styles.pillBold}>{season.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.15)",
  },
  // Location pill has a slightly different style to hint that it's interactive
  locationPill: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pillBold: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  // Underlined + accent-colored to look like a tappable link
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accent,
    textDecorationLine: "underline",
  },
  // Small down-arrow to signal a dropdown/picker
  chevron: {
    fontSize: 11,
    color: COLORS.accent,
  },
});
