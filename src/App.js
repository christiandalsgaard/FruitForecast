/**
 * App.js — root component with bottom tab navigation.
 *
 * Two tabs: Home (seasonal produce list) and Profile (favorites,
 * journal, region settings, notifications, about).
 *
 * Location/scoring state is lifted here so both tabs share it.
 * The Home tab owns the produce list rendering; the Profile tab
 * receives scored produce, location info, and a region-change
 * callback so it can trigger updates that reflect on both tabs.
 *
 * On web, we inject Google Fonts and reset body scroll constraints
 * before React mounts. Tab navigation works on all platforms via
 * React Navigation's bottom-tabs navigator.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";

// Screens
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegionPicker from "./components/RegionPicker";

// Data and utilities
import { PRODUCE_DB } from "./data/produce";
import { getMarketZone, getUniqueSourceCoords } from "./data/marketZones";
import { getClimateShift } from "./utils/season";
import { computeProduceScore } from "./utils/scoring";
import { fetchAllSourceWeather } from "./utils/weatherAdjust";
import { fetchWeather, reverseGeocode } from "./utils/weather";
import { scheduleSeasonAlerts } from "./utils/notifications";
import { getSavedRegion, saveRegion } from "./utils/preferences";
import { COLORS, FONTS } from "./utils/theme";
import { track, EVENTS } from "./utils/analytics";

// ── Web-only setup ──────────────────────────────────────────────
// On web, Expo's HTML template sets body { overflow: hidden; height: 100% }
// which prevents page-level scrolling. We reset those constraints here.
// Also load Google Fonts for the rounded, playful typeface.
if (Platform.OS === "web") {
  document.documentElement.style.height = "auto";
  document.body.style.height = "auto";
  document.body.style.overflow = "auto";

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
  document.head.appendChild(fontLink);
}

// ── Tab navigator ───────────────────────────────────────────────
const Tab = createBottomTabNavigator();

// Default coordinates (New York, NY) used when location is unavailable
const DEFAULT_COORDS = { latitude: 40.71, longitude: -74.01 };

// ── Location helper ─────────────────────────────────────────────
// Abstracts web (navigator.geolocation) vs native (expo-location).
async function getDeviceLocation() {
  if (Platform.OS === "web") {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 10000, enableHighAccuracy: false },
      );
    });
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission denied");
  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
}

// ── Root App Component ──────────────────────────────────────────

function App() {
  // ── Shared state (used by both Home and Profile) ──────────────
  const [month, setMonth] = useState(new Date().getMonth());
  const [filter, setFilter] = useState("all");
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("Loading…");
  const [climateShift, setClimateShift] = useState(0);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [marketZone, setMarketZone] = useState(null);
  const [sourceWeatherMap, setSourceWeatherMap] = useState({});

  // ── Step 1: Get device location on mount ──────────────────────
  // Check for a saved region preference first, then fall back to
  // device location, then fall back to New York defaults.
  useEffect(() => {
    (async () => {
      try {
        // Check if the user has a saved region from a previous session
        const savedRegion = await getSavedRegion();
        if (savedRegion) {
          setCoords({ latitude: savedRegion.latitude, longitude: savedRegion.longitude });
          setLocationName(savedRegion.name);
          return;
        }
        // No saved region — try device location
        const position = await getDeviceLocation();
        setCoords(position);
      } catch {
        setCoords(DEFAULT_COORDS);
        setLocationName("New York, NY");
      }
    })();
  }, []);

  // ── Step 2: Fetch weather + geocode whenever coords change ────
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    (async () => {
      try {
        const [weatherData, cityName] = await Promise.all([
          fetchWeather(coords.latitude, coords.longitude),
          reverseGeocode(coords.latitude, coords.longitude),
        ]);
        if (cancelled) return;
        setWeather(weatherData);
        setLocationName(cityName);
        const shift = getClimateShift(coords.latitude);
        setClimateShift(shift);
        const zone = getMarketZone(coords.latitude, coords.longitude);
        setMarketZone(zone);
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
    return () => { cancelled = true; };
  }, [coords]);

  // ── Step 3: Fetch source region weather when market zone changes ──
  useEffect(() => {
    if (!marketZone) return;
    let cancelled = false;
    (async () => {
      try {
        const uniqueCoords = getUniqueSourceCoords(PRODUCE_DB, marketZone);
        const regionNames = {};
        for (const item of PRODUCE_DB) {
          const sources = item.sourcing?.[marketZone];
          if (!sources) continue;
          for (const src of sources) {
            const key = `${src.lat.toFixed(1)},${src.lon.toFixed(1)}`;
            if (!regionNames[key]) regionNames[key] = src.region;
          }
        }
        const enrichedCoords = uniqueCoords.map((c) => ({
          ...c,
          region: regionNames[`${c.lat.toFixed(1)},${c.lon.toFixed(1)}`] || "source",
        }));
        const weatherMap = await fetchAllSourceWeather(enrichedCoords);
        if (cancelled) return;
        setSourceWeatherMap(weatherMap);
      } catch (error) {
        console.warn("Source weather fetch failed:", error.message);
      }
    })();
    return () => { cancelled = true; };
  }, [marketZone]);

  // ── Compute scored produce (shared between tabs) ──────────────
  const scoredProduce = useMemo(
    () =>
      PRODUCE_DB.map((item) => {
        const scoreResult = computeProduceScore(item, month, marketZone, climateShift, sourceWeatherMap);
        return {
          ...item,
          score: scoreResult.finalScore,
          baseScore: scoreResult.baseScore,
          weatherAdjustment: scoreResult.weatherAdjustment,
          sourceDetails: scoreResult.sourceDetails,
        };
      }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [month, climateShift, marketZone, sourceWeatherMap],
  );

  // Filtered produce (only Home uses the filter)
  const filteredProduce = useMemo(
    () => scoredProduce.filter((item) => filter === "all" || item.type === filter),
    [scoredProduce, filter],
  );

  // ── Region picker handlers ────────────────────────────────────
  const handleRegionSelect = useCallback((region) => {
    setLoading(true);
    setLocationName(region.name);
    setSourceWeatherMap({});
    setCoords({ latitude: region.latitude, longitude: region.longitude });
    // Persist the region so it's restored on next app launch
    saveRegion(region).catch(() => {});
    track(EVENTS.REGION_CHANGE, { region: region.name });
  }, []);

  const handleUseMyLocation = useCallback(async () => {
    setLoading(true);
    setLocationName("Locating…");
    setSourceWeatherMap({});
    // Clear saved region so next launch auto-detects again
    saveRegion(null).catch(() => {});
    try {
      const position = await getDeviceLocation();
      setCoords(position);
    } catch {
      setCoords(DEFAULT_COORDS);
      setLocationName("New York, NY");
      setLoading(false);
    }
  }, []);

  const handleOpenRegionPicker = useCallback(() => {
    setShowRegionPicker(true);
  }, []);

  // ── Tab screen wrapper components ─────────────────────────────
  // These are inline components that pass shared state as props to
  // the actual screen components. React Navigation requires screen
  // components to accept { navigation, route } — we wrap them.

  const HomeTab = useCallback(() => (
    <HomeScreen
      month={month}
      setMonth={setMonth}
      filter={filter}
      setFilter={setFilter}
      coords={coords}
      locationName={locationName}
      weather={weather}
      loading={loading}
      climateShift={climateShift}
      marketZone={marketZone}
      sourceWeatherMap={sourceWeatherMap}
      scoredProduce={filteredProduce}
      setShowRegionPicker={setShowRegionPicker}
    />
  ), [month, filter, coords, locationName, weather, loading, climateShift,
      marketZone, sourceWeatherMap, filteredProduce, setShowRegionPicker]);

  const ProfileTab = useCallback(() => (
    <ProfileScreen
      locationName={locationName}
      coords={coords}
      marketZone={marketZone}
      onChangeRegion={handleOpenRegionPicker}
      scoredProduce={scoredProduce}
    />
  ), [locationName, coords, marketZone, handleOpenRegionPicker, scoredProduce]);

  return (
    <View style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: COLORS.accent,
              tabBarInactiveTintColor: COLORS.textMuted,
              tabBarLabelStyle: styles.tabLabel,
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeTab}
              options={{
                tabBarIcon: ({ color }) => (
                  <Text style={[styles.tabIcon, { color }]}>🍊</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileTab}
              options={{
                tabBarIcon: ({ color }) => (
                  <Text style={[styles.tabIcon, { color }]}>👤</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        {/* RegionPicker rendered at root level so it works from both tabs */}
        <RegionPicker
          visible={showRegionPicker}
          onClose={() => setShowRegionPicker(false)}
          onSelect={handleRegionSelect}
          onUseMyLocation={handleUseMyLocation}
        />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100vh",
  },
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.separator,
    borderTopWidth: 1,
    paddingTop: 4,
    height: Platform.OS === "web" ? 56 : 85,
  },
  tabLabel: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: "600",
  },
  tabIcon: {
    fontSize: 22,
  },
});

registerRootComponent(App);
