/**
 * HomeScreen — main view showing seasonal produce ranked by freshness.
 *
 * This is now a presentational component — all location, weather, and
 * scoring state is managed by App.js and passed in as props. This
 * lets the Profile tab share the same data without duplicating logic.
 *
 * Two layout modes:
 *   - Web: plain View with page-level scrolling (FlatList is unreliable)
 *   - Native: FlatList with virtualization for smooth 60fps scrolling
 */

import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS, FONTS } from "../utils/theme";
import { track, EVENTS } from "../utils/analytics";
import MonthSelector from "../components/MonthSelector";
import InfoBar from "../components/InfoBar";
import FilterBar from "../components/FilterBar";
import ProduceCard from "../components/ProduceCard";
import MarketFinder from "../components/MarketFinder";
import RecipeSuggestions from "../components/RecipeSuggestions";

export default function HomeScreen({
  // State values from App.js
  month,
  setMonth,
  filter,
  setFilter,
  coords,
  locationName,
  weather,
  loading,
  climateShift,
  marketZone,
  sourceWeatherMap,
  scoredProduce,
  // Region picker state
  // Region picker — the modal is rendered in App.js, HomeScreen just
  // needs to trigger it via setShowRegionPicker
  setShowRegionPicker,
}) {
  // ── Derived counts ────────────────────────────────────────────
  const peakCount = useMemo(
    () => scoredProduce.filter((i) => i.score >= 90).length,
    [scoredProduce],
  );
  const inSeasonCount = useMemo(
    () => scoredProduce.filter((i) => i.score >= 70).length,
    [scoredProduce],
  );

  // Names of peak-season produce for recipe suggestions
  const peakProduceNames = useMemo(
    () =>
      scoredProduce
        .filter((i) => i.score >= 90)
        .map((i) => i.name.toLowerCase()),
    [scoredProduce],
  );

  // Stable render function for FlatList
  const renderItem = useCallback(
    ({ item, index }) => (
      <ProduceCard
        item={item}
        rank={index + 1}
        score={item.score}
        baseScore={item.baseScore}
        weatherAdjustment={item.weatherAdjustment}
        sourceDetails={item.sourceDetails}
        currentMonth={month}
        climateShift={climateShift}
        marketZone={marketZone}
        sourceWeatherMap={sourceWeatherMap}
      />
    ),
    [month, climateShift, marketZone, sourceWeatherMap],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // ── Memoized header ───────────────────────────────────────────
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

        <InfoBar
          locationName={locationName}
          weather={weather}
          month={month}
          onLocationPress={() => setShowRegionPicker(true)}
        />
        <MonthSelector
          selectedMonth={month}
          onSelect={(m) => {
            setMonth(m);
            track(EVENTS.MONTH_CHANGE, { month: m });
          }}
        />
        <FilterBar
          filter={filter}
          onFilterChange={(f) => {
            setFilter(f);
            track(EVENTS.FILTER_CHANGE, { filter: f });
          }}
          peakCount={peakCount}
          inSeasonCount={inSeasonCount}
        />

        {/* Farmer's markets near the user's selected region */}
        <MarketFinder
          latitude={coords?.latitude}
          longitude={coords?.longitude}
        />

        {/* Recipe suggestions using currently peak produce */}
        <RecipeSuggestions peakProduceNames={peakProduceNames} />
      </>
    ),
    [locationName, weather, month, filter, peakCount, inSeasonCount, coords, peakProduceNames, setMonth, setFilter, setShowRegionPicker],
  );

  // ── Memoized footer ───────────────────────────────────────────
  const listFooter = useMemo(
    () => (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Fruit Forecast · Seasonal produce guide
        </Text>
        <Text style={styles.footerText}>
          Weather powered by Open-Meteo · Geocoding by Nominatim
        </Text>
        <Text style={[styles.footerText, { marginTop: 6 }]}>
          Tap any item to view its season calendar & shopping tips
        </Text>
      </View>
    ),
    [],
  );

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Finding your location…</Text>
      </View>
    );
  }

  // ── Web layout: plain View with page-level scrolling ──────────
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
            baseScore={item.baseScore}
            weatherAdjustment={item.weatherAdjustment}
            sourceDetails={item.sourceDetails}
            currentMonth={month}
            climateShift={climateShift}
            marketZone={marketZone}
            sourceWeatherMap={sourceWeatherMap}
          />
        ))}
        {listFooter}
      </View>
    );
  }

  // ── Native layout: FlatList with virtualization ───────────────
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
      {regionPicker}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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

  // ── Header ─────────────────────────────────────────────────────
  header: {
    paddingTop: 24,
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

  // ── Footer ────────────────────────────────────────────────────
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
