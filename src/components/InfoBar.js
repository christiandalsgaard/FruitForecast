/**
 * InfoBar — compact row showing location and weather.
 *
 * Location pill is tappable to open the region picker.
 * Weather pill shows current temperature and humidity.
 * Season label is omitted — the month selector and produce
 * scores communicate seasonality more clearly.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../utils/theme";

function getWeatherEmoji(temp) {
  if (temp > 85) return "🔥";
  if (temp > 70) return "☀️";
  if (temp > 50) return "🌤️";
  if (temp > 32) return "🌥️";
  return "🥶";
}

export default function InfoBar({ locationName, weather, onLocationPress }) {
  return (
    <View style={styles.row}>
      {/* Location pill — tappable to change region */}
      <TouchableOpacity
        style={[styles.pill, styles.locationPill]}
        activeOpacity={0.6}
        onPress={onLocationPress}
      >
        <Text style={styles.pillText}>📍 </Text>
        <Text style={styles.locationText}>{locationName}</Text>
        <Text style={styles.chevron}> ▾</Text>
      </TouchableOpacity>

      {/* Weather pill — temperature and humidity at a glance */}
      {weather && (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{getWeatherEmoji(weather.temp)} </Text>
          <Text style={styles.pillBold}>{weather.temp}°F</Text>
          <Text style={styles.pillText}> · {weather.humidity}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  // Location pill — accent border to hint interactivity
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
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accent,
    textDecorationLine: "underline",
  },
  chevron: {
    fontSize: 11,
    color: COLORS.accent,
  },
});
