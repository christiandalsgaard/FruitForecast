import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { PRODUCE_DB } from "../data/produce";
import {
  getClimateShift,
  getSeasonScore,
  getLocationName,
} from "../utils/season";
import { COLORS, FONTS } from "../utils/theme";
import MonthSelector from "../components/MonthSelector";
import InfoBar from "../components/InfoBar";
import FilterBar from "../components/FilterBar";
import ProduceCard from "../components/ProduceCard";

export default function HomeScreen() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [filter, setFilter] = useState("all");
  const [locationName, setLocationName] = useState("Loading…");
  const [climateShift, setClimateShift] = useState(0);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationName("Location unavailable");
          setWeather({ temp: 62, humidity: 55 });
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        const { latitude, longitude } = loc.coords;

        setClimateShift(getClimateShift(latitude));
        setLocationName(getLocationName(latitude, longitude));

        // Simulate weather from latitude & month
        const baseTemps =
          latitude > 40
            ? [28, 32, 42, 55, 65, 75, 82, 80, 70, 58, 44, 32]
            : latitude > 25
            ? [52, 55, 62, 70, 78, 86, 90, 89, 84, 74, 62, 54]
            : [70, 72, 75, 78, 82, 85, 87, 87, 85, 80, 75, 71];
        const temp =
          baseTemps[month] + Math.round((Math.random() - 0.5) * 8);
        setWeather({ temp, humidity: 40 + Math.round(Math.random() * 30) });
      } catch {
        setLocationName("Default region");
        setWeather({ temp: 62, humidity: 55 });
      }
      setLoading(false);
    })();
  }, [month]);

  // Compute scored/sorted list
  const scoredProduce = PRODUCE_DB.filter(
    (item) => filter === "all" || item.type === filter,
  )
    .map((item) => ({
      ...item,
      score: getSeasonScore(item, month, climateShift),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const peakCount = scoredProduce.filter((i) => i.score === 100).length;
  const inSeasonCount = scoredProduce.filter((i) => i.score >= 60).length;

  const renderItem = useCallback(
    ({ item, index }) => (
      <ProduceCard
        item={item}
        rank={index + 1}
        score={item.score}
        currentMonth={month}
        climateShift={climateShift}
      />
    ),
    [month, climateShift],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.tagline}>FRESH · LOCAL · SEASONAL</Text>
        <Text style={styles.title}>Fruit Forecast</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>
          Discover what's freshest at your supermarket based on your location
          and the time of year
        </Text>
      </View>

      {/* Info pills */}
      <InfoBar locationName={locationName} weather={weather} month={month} />

      {/* Month selector */}
      <MonthSelector selectedMonth={month} onSelect={setMonth} />

      {/* Filter + stats */}
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        peakCount={peakCount}
        inSeasonCount={inSeasonCount}
      />
    </>
  );

  const ListFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Fruit Forecast · Seasonal produce guide
      </Text>
      <Text style={styles.footerText}>
        Data based on typical North American growing seasons
      </Text>
      <Text style={[styles.footerText, { marginTop: 6 }]}>
        Tap any item to view its season calendar & shopping tips
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Checking your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        data={scoredProduce}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },

  // Header
  header: {
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 6,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: "400",
    color: COLORS.text,
    fontFamily: FONTS.serif,
    letterSpacing: -0.5,
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: COLORS.accent,
    marginVertical: 14,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: FONTS.serif,
    maxWidth: 340,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    marginTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textFaint,
    fontFamily: FONTS.mono,
    textAlign: "center",
  },
});
