import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../utils/theme";
import { getSeasonInfo } from "../utils/season";

function getWeatherEmoji(temp) {
  if (temp > 85) return "🔥";
  if (temp > 70) return "☀️";
  if (temp > 50) return "🌤️";
  if (temp > 32) return "🌥️";
  return "🥶";
}

export default function InfoBar({ locationName, weather, month }) {
  const season = getSeasonInfo(month);

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>📍 </Text>
        <Text style={styles.pillBold}>{locationName}</Text>
      </View>

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
    marginBottom: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(45,106,79,0.12)",
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
});
