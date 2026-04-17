/**
 * HomeScreen — main view showing seasonal produce ranked by freshness.
 *
 * On mount, attempts to get the user's device location (browser geolocation
 * on web, expo-location on native). If granted, fetches real weather from
 * Open-Meteo and reverse-geocodes the coordinates into a city name via
 * Nominatim. Users can also tap the location pill to manually pick a region.
 *
 * The scoring pipeline:
 *   1. Determine market zone from user's coordinates
 *   2. Compute base seasonal scores using source region data
 *   3. Fetch weather anomalies from source regions (async, progressive)
 *   4. Blend source scores with weather adjustments into final 1-100 score
 *
 * Scores render immediately with base seasonality; weather adjustments
 * refine them within a few seconds as the data arrives.
 */

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
import { getMarketZone, getUniqueSourceCoords } from "../data/marketZones";
import { getClimateShift } from "../utils/season";
import { computeProduceScore } from "../utils/scoring";
import { fetchAllSourceWeather } from "../utils/weatherAdjust";
import { fetchWeather, reverseGeocode } from "../utils/weather";
import { COLORS, FONTS } from "../utils/theme";
import { track, EVENTS } from "../utils/analytics";
import { scheduleSeasonAlerts } from "../utils/notifications";
import MonthSelector from "../components/MonthSelector";
import InfoBar from "../components/InfoBar";
import FilterBar from "../components/FilterBar";
import ProduceCard from "../components/ProduceCard";
import RegionPicker from "../components/RegionPicker";
import MarketFinder from "../components/MarketFinder";
import RecipeSuggestions from "../components/RecipeSuggestions";

// ── Location helpers ──────────────────────────────────────────────
// Abstracts the difference between web (navigator.geolocation) and
// native (expo-location) into a single async function.

async function getDeviceLocation() {
  if (Platform.OS === "web") {
    // Browser geolocation API — works on localhost and HTTPS origins.
    // Wrapping in a promise with a timeout so we don't hang indefinitely
    // if the user ignores the permission dialog.
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported in this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => reject(error),
        { timeout: 10000, enableHighAccuracy: false },
      );
    });
  }

  // Native (iOS/Android) — use expo-location
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission denied");
  }
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low,
  });
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

// Default coordinates (New York, NY) used when location is unavailable
const DEFAULT_COORDS = { latitude: 40.71, longitude: -74.01 };

// ── Component ─────────────────────────────────────────────────────

export default function HomeScreen() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [filter, setFilter] = useState("all");
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("Loading…");
  const [climateShift, setClimateShift] = useState(0);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  // New state for source-aware scoring
  const [marketZone, setMarketZone] = useState(null);
  const [sourceWeatherMap, setSourceWeatherMap] = useState({});

  // ── Step 1: Get device location on mount ──────────────────────
  // Runs once. On success, sets coords which triggers the weather
  // effect below. On failure, falls back to New York defaults.
  useEffect(() => {
    (async () => {
      try {
        const position = await getDeviceLocation();
        setCoords(position);
      } catch {
        // Location unavailable — fall back to New York
        setCoords(DEFAULT_COORDS);
        setLocationName("New York, NY");
      }
    })();
  }, []);

  // ── Step 2: Fetch weather + geocode whenever coords change ────
  // This runs after initial location detection AND after the user
  // picks a new region from the RegionPicker.
  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    (async () => {
      try {
        // Fetch weather and city name in parallel for speed
        const [weatherData, cityName] = await Promise.all([
          fetchWeather(coords.latitude, coords.longitude),
          reverseGeocode(coords.latitude, coords.longitude),
        ]);

        if (cancelled) return;
        setWeather(weatherData);
        setLocationName(cityName);
        const shift = getClimateShift(coords.latitude);
        setClimateShift(shift);

        // Determine which market zone the user is in — this drives
        // which sourcing data we use for scoring
        const zone = getMarketZone(coords.latitude, coords.longitude);
        setMarketZone(zone);

        // Schedule push notifications for favorited produce now that
        // we know the user's climate zone.
        scheduleSeasonAlerts(shift).catch(() => {});
      } catch {
        if (cancelled) return;
        setWeather({ temp: 62, humidity: 55 });
        const shift = getClimateShift(coords.latitude);
        setClimateShift(shift);
        setMarketZone(getMarketZone(coords.latitude, coords.longitude));
      }
      setLoading(false);
    })();

    // Cleanup: if coords change again before the fetch completes,
    // discard the stale result so we don't flash an old city name.
    return () => {
      cancelled = true;
    };
  }, [coords]);

  // ── Step 3: Fetch source region weather when market zone changes ──
  // Collects all unique source coordinates for the active market zone,
  // deduplicates them, and fetches weather anomaly data in parallel.
  // This runs asynchronously — the UI shows base scores immediately
  // and refines them when weather data arrives.
  useEffect(() => {
    if (!marketZone) return;

    let cancelled = false;
    (async () => {
      try {
        // Get all unique source region coordinates for this market zone
        const uniqueCoords = getUniqueSourceCoords(PRODUCE_DB, marketZone);

        // Also attach region names for narrative generation.
        // Build a map of coord key → region name from the produce data.
        const regionNames = {};
        for (const item of PRODUCE_DB) {
          const sources = item.sourcing?.[marketZone];
          if (!sources) continue;
          for (const src of sources) {
            const key = `${src.lat.toFixed(1)},${src.lon.toFixed(1)}`;
            if (!regionNames[key]) regionNames[key] = src.region;
          }
        }

        // Enrich coords with region names for the weather fetcher
        const enrichedCoords = uniqueCoords.map((c) => ({
          ...c,
          region: regionNames[`${c.lat.toFixed(1)},${c.lon.toFixed(1)}`] || "source",
        }));

        // Fetch weather for all source regions in parallel
        const weatherMap = await fetchAllSourceWeather(enrichedCoords);
        if (cancelled) return;
        setSourceWeatherMap(weatherMap);
      } catch (error) {
        // Source weather fetch failed — not critical, scores just won't
        // have weather adjustments. Log and continue.
        console.warn("Source weather fetch failed:", error.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [marketZone]);

  // ── Region picker handlers ────────────────────────────────────

  // Called when the user picks a preset city from the list
  const handleRegionSelect = useCallback((region) => {
    setLoading(true);
    setLocationName(region.name);
    setSourceWeatherMap({}); // reset weather data for the new zone
    setCoords({ latitude: region.latitude, longitude: region.longitude });
    track(EVENTS.REGION_CHANGE, { region: region.name });
  }, []);

  // Called when the user taps "Use My Location" in the picker
  const handleUseMyLocation = useCallback(async () => {
    setLoading(true);
    setLocationName("Locating…");
    setSourceWeatherMap({}); // reset weather data
    try {
      const position = await getDeviceLocation();
      setCoords(position);
    } catch {
      setCoords(DEFAULT_COORDS);
      setLocationName("New York, NY");
      setLoading(false);
    }
  }, []);

  // ── Compute scored/sorted produce list ────────────────────────
  // Uses the new source-aware scoring engine. Each item gets a rich
  // score object with base score, weather adjustment, and source details.
  const scoredProduce = useMemo(
    () =>
      PRODUCE_DB.filter((item) => filter === "all" || item.type === filter)
        .map((item) => {
          const scoreResult = computeProduceScore(
            item,
            month,
            marketZone,
            climateShift,
            sourceWeatherMap,
          );
          return {
            ...item,
            score: scoreResult.finalScore,
            baseScore: scoreResult.baseScore,
            weatherAdjustment: scoreResult.weatherAdjustment,
            sourceDetails: scoreResult.sourceDetails,
          };
        })
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [month, filter, climateShift, marketZone, sourceWeatherMap],
  );

  const peakCount = useMemo(
    () => scoredProduce.filter((i) => i.score >= 90).length,
    [scoredProduce],
  );
  const inSeasonCount = useMemo(
    () => scoredProduce.filter((i) => i.score >= 70).length,
    [scoredProduce],
  );

  // Names of peak-season produce — passed to RecipeSuggestions so it
  // can query the Spoonacular API with the right ingredients.
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

  // ── Memoized header and footer ────────────────────────────────
  // Defined as memoized elements (not inline components) so FlatList
  // doesn't remount them on every render.

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

        {/* Recipe suggestions using currently peak produce (requires API key) */}
        <RecipeSuggestions peakProduceNames={peakProduceNames} />
      </>
    ),
    [locationName, weather, month, filter, peakCount, inSeasonCount, coords, peakProduceNames],
  );

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

  // ── Region picker modal (rendered regardless of layout) ───────
  const regionPicker = (
    <RegionPicker
      visible={showRegionPicker}
      onClose={() => setShowRegionPicker(false)}
      onSelect={handleRegionSelect}
      onUseMyLocation={handleUseMyLocation}
    />
  );

  // ── Web layout: plain View with page-level scrolling ──────────
  // FlatList needs a fixed-height container which is unreliable on web.
  // Instead we render items in a View and let the browser scroll the page.
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
        {regionPicker}
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
  // Native: flex fills safe area, FlatList scrolls internally
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Web: no fixed height — grows with content, page scrolls
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
