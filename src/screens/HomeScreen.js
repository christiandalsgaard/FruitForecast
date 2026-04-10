import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
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

  // Location is fetched ONCE on mount — not on every month change.
  // The original code had [month] as a dep, which re-requested location
  // permissions every time the user tapped a different month. Weather is
  // calculated from the actual current month, not the selected display month.
  useEffect(() => {
    (async () => {
      try {
        // Web: expo-location hangs indefinitely waiting for a browser permission
        // dialog that never appears in some environments. Skip it and use defaults.
        if (Platform.OS === "web") {
          setLocationName("Default region");
          setWeather({ temp: 62, humidity: 55 });
          setLoading(false);
          return;
        }

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

        // Use the real current month for weather, not the selected display month.
        // The user can browse different months for seasonal data, but weather
        // should always reflect current conditions.
        const currentMonth = new Date().getMonth();
        const baseTemps =
          latitude > 40
            ? [28, 32, 42, 55, 65, 75, 82, 80, 70, 58, 44, 32]
            : latitude > 25
            ? [52, 55, 62, 70, 78, 86, 90, 89, 84, 74, 62, 54]
            : [70, 72, 75, 78, 82, 85, 87, 87, 85, 80, 75, 71];
        const temp =
          baseTemps[currentMonth] + Math.round((Math.random() - 0.5) * 8);

        setClimateShift(getClimateShift(latitude));
        setLocationName(getLocationName(latitude, longitude));
        setWeather({ temp, humidity: 40 + Math.round(Math.random() * 30) });
      } catch {
        setLocationName("Default region");
        setWeather({ temp: 62, humidity: 55 });
      }
      setLoading(false);
    })();
  }, []); // Empty deps — location fetched once, not on every month change

  // Compute scored and sorted produce list whenever month, filter, or climate changes
  const scoredProduce = useMemo(
    () =>
      PRODUCE_DB.filter((item) => filter === "all" || item.type === filter)
        .map((item) => ({
          ...item,
          score: getSeasonScore(item, month, climateShift),
        }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [month, filter, climateShift],
  );

  const peakCount = useMemo(
    () => scoredProduce.filter((i) => i.score === 100).length,
    [scoredProduce],
  );
  const inSeasonCount = useMemo(
    () => scoredProduce.filter((i) => i.score >= 60).length,
    [scoredProduce],
  );

  // Stable render function for FlatList — only recreates when month or climate changes
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

  // Memoize header and footer elements so FlatList doesn't remount them on
  // every render. Defining them as inline arrow functions inside the component
  // produces a new function reference each render, which FlatList treats as a
  // new component type — causing unnecessary remounts.
  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.header}>
          <Text style={styles.tagline}>FRESH · LOCAL · SEASONAL</Text>
          <Text style={styles.title}>Fruit Forecast</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Discover what's freshest at your supermarket based on your location
            and the time of year
          </Text>
        </View>

        <InfoBar locationName={locationName} weather={weather} month={month} />
        <MonthSelector selectedMonth={month} onSelect={setMonth} />
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          peakCount={peakCount}
          inSeasonCount={inSeasonCount}
        />
      </>
    ),
    [locationName, weather, month, filter, peakCount, inSeasonCount],
  );

  const listFooter = useMemo(
    () => (
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
    ),
    [],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Checking your location…</Text>
      </View>
    );
  }

  // Web layout: FlatList requires an internal scroll container with a fixed height,
  // which is unreliable across browsers. Instead, render items in a plain View and
  // let the page scroll naturally (body overflow is set to auto in App.js).
  if (Platform.OS === "web") {
    return (
      <View style={styles.screenWeb}>
        <StatusBar style="dark" />
        {listHeader}
        {scoredProduce.map((item, index) => (
          <ProduceCard
            key={item.id}
            item={item}
            rank={index + 1}
            score={item.score}
            currentMonth={month}
            climateShift={climateShift}
          />
        ))}
        {listFooter}
      </View>
    );
  }

  // Native (iOS/Android): FlatList with virtualization for smooth scrolling
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <FlatList
        data={scoredProduce}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
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
  // Native screen: flex: 1 fills the safe area, FlatList scrolls internally
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Web screen: no fixed height — grows with content and lets the page scroll
  screenWeb: {
    backgroundColor: COLORS.background,
    paddingBottom: 40,
    minHeight: "100vh",
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
    minHeight: "100vh",
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },

  // Header section
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

  // Footer section
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
