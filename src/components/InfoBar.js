/**
 * InfoBar — location and weather row with expandable 10-day forecast.
 *
 * Two equal-width pills side by side:
 *   - Location pill: tappable to open the region picker
 *   - Weather pill: tappable to expand a 10-day forecast panel
 *
 * The forecast is lazy-loaded from Open-Meteo when the user taps
 * the weather pill, so we don't fetch unless they actually want it.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../utils/theme";
import { fetchForecast } from "../utils/weather";

// Simple emoji based on current temperature
function getWeatherEmoji(temp) {
  if (temp > 85) return "🔥";
  if (temp > 70) return "☀️";
  if (temp > 50) return "🌤️";
  if (temp > 32) return "🌥️";
  return "🥶";
}

// Format ISO date string to short day label (e.g., "Mon", "Tue")
// with "Today" for the first entry
function formatDay(dateStr, index) {
  if (index === 0) return "Today";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export default function InfoBar({ locationName, weather, onLocationPress, latitude, longitude }) {
  const [forecastOpen, setForecastOpen] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Fetch forecast on first expand — lazy loading
  const handleWeatherPress = useCallback(() => {
    setForecastOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!forecastOpen || forecast || !latitude || !longitude) return;
    setForecastLoading(true);
    fetchForecast(latitude, longitude)
      .then((data) => {
        setForecast(data);
        setForecastLoading(false);
      })
      .catch(() => {
        setForecastLoading(false);
      });
  }, [forecastOpen, forecast, latitude, longitude]);

  return (
    <View style={styles.wrapper}>
      {/* Two equal-width pills side by side */}
      <View style={styles.row}>
        {/* Location pill */}
        <TouchableOpacity
          style={[styles.pill, styles.locationPill]}
          activeOpacity={0.6}
          onPress={onLocationPress}
        >
          <Text style={styles.pillText}>📍 </Text>
          <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
          <Text style={styles.chevron}> ▾</Text>
        </TouchableOpacity>

        {/* Weather pill — tappable to show/hide forecast */}
        {weather && (
          <TouchableOpacity
            style={[styles.pill, forecastOpen && styles.pillActive]}
            activeOpacity={0.6}
            onPress={handleWeatherPress}
          >
            <Text style={styles.pillText}>{getWeatherEmoji(weather.temp)} </Text>
            <Text style={styles.pillBold}>{weather.temp}°F</Text>
            <Text style={styles.pillText}> · {weather.humidity}%</Text>
            <Text style={styles.chevron}> {forecastOpen ? "▴" : "▾"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 10-day forecast panel — slides open below the pills */}
      {forecastOpen && (
        <View style={styles.forecastPanel}>
          {forecastLoading && (
            <View style={styles.forecastLoading}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.forecastLoadingText}>Loading forecast…</Text>
            </View>
          )}

          {forecast && forecast.map((day, i) => (
            <View key={day.date} style={[styles.forecastRow, i === 0 && styles.forecastRowFirst]}>
              {/* Day label */}
              <Text style={styles.forecastDay}>{formatDay(day.date, i)}</Text>
              {/* Weather emoji */}
              <Text style={styles.forecastEmoji}>{day.emoji}</Text>
              {/* Temperature range — low and high */}
              <Text style={styles.forecastTempLow}>{day.tempLow}°</Text>
              {/* Visual temp bar */}
              <View style={styles.tempBarTrack}>
                <View
                  style={[
                    styles.tempBarFill,
                    {
                      // Scale bar width relative to the temp range (32–100°F)
                      left: `${Math.max(0, ((day.tempLow - 32) / 68) * 100)}%`,
                      right: `${Math.max(0, 100 - ((day.tempHigh - 32) / 68) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.forecastTempHigh}>{day.tempHigh}°</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  // Both pills share flex: 1 for equal width
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  pillActive: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
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
    flexShrink: 1,
  },
  chevron: {
    fontSize: 11,
    color: COLORS.accent,
  },

  // ── 10-day forecast panel ──────────────────────────────────────
  forecastPanel: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  forecastLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  forecastLoadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  forecastRowFirst: {
    borderTopWidth: 0,
  },
  forecastDay: {
    width: 48,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  forecastEmoji: {
    width: 24,
    fontSize: 14,
    textAlign: "center",
  },
  forecastTempLow: {
    width: 30,
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    textAlign: "right",
    marginRight: 6,
  },
  // Temperature range bar — thin horizontal track with filled segment
  tempBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 2,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  tempBarFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  forecastTempHigh: {
    width: 30,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.mono,
    textAlign: "left",
    marginLeft: 6,
  },
});
