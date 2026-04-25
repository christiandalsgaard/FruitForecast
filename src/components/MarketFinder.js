/**
 * MarketFinder — collapsible section showing nearby farmer's markets.
 *
 * Fetches markets from OpenStreetMap via the Overpass API when expanded.
 * Each market card shows name, distance, schedule, and address.
 * Tapping a market opens directions in the default maps app.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Platform,
} from "react-native";
import { COLORS, FONTS } from "../utils/theme";
import { findNearbyMarkets } from "../utils/markets";

export default function MarketFinder({ latitude, longitude }) {
  const [expanded, setExpanded] = useState(false);
  const [markets, setMarkets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch markets when the user expands the section — lazy loading
  // so we don't hit the Overpass API unless the user actually wants this.
  useEffect(() => {
    if (!expanded || markets !== null || !latitude || !longitude) return;

    setLoading(true);
    setError(null);
    findNearbyMarkets(latitude, longitude)
      .then((data) => {
        setMarkets(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load nearby markets");
        setLoading(false);
      });
  }, [expanded, latitude, longitude, markets]);

  // Open directions — use coords for precise navigation, fall back to address
  const openDirections = (market) => {
    const url = Platform.select({
      ios: `maps:?ll=${market.lat},${market.lon}&q=${encodeURIComponent(market.name)}`,
      android: `geo:${market.lat},${market.lon}?q=${encodeURIComponent(market.name)}`,
      web: `https://www.google.com/maps/search/?api=1&query=${market.lat},${market.lon}`,
    });
    Linking.openURL(url).catch(() => {});
  };

  // Convert km to miles for display
  const kmToMi = (km) => (km * 0.621371).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Toggle header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerIcon}>🧑‍🌾</Text>
        <Text style={styles.headerText}>Farmer's Markets Near You</Text>
        <Text style={styles.chevron}>{expanded ? "▴" : "▾"}</Text>
      </TouchableOpacity>

      {/* Content — only visible when expanded */}
      {expanded && (
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.loadingText}>Finding markets…</Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {markets && markets.length === 0 && (
            <Text style={styles.emptyText}>
              No farmer's markets found nearby. Try a different region.
            </Text>
          )}

          {markets &&
            markets.map((market) => (
              <TouchableOpacity
                key={market.id}
                style={styles.marketCard}
                activeOpacity={0.7}
                onPress={() => openDirections(market)}
              >
                <View style={styles.marketHeader}>
                  <Text style={styles.marketName}>{market.name}</Text>
                  {market.distance != null && (
                    <Text style={styles.distance}>
                      {kmToMi(market.distance)} mi
                    </Text>
                  )}
                </View>

                {/* Address — may be null if OSM doesn't have addr tags */}
                {market.address && (
                  <Text style={styles.marketAddress}>{market.address}</Text>
                )}

                {/* Opening hours if available */}
                {market.schedule && (
                  <Text style={styles.marketSchedule}>{market.schedule}</Text>
                )}

                {/* Website link if available */}
                {market.website && (
                  <Text
                    style={styles.websiteLink}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      Linking.openURL(market.website).catch(() => {});
                    }}
                    numberOfLines={1}
                  >
                    {market.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                )}

                <Text style={styles.directionsHint}>Tap for directions →</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.12)",
    overflow: "hidden",
  },
  // Toggle header row
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  // Expanded content area
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.outOfSeason,
    fontFamily: FONTS.serif,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  // Individual market card
  marketCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  marketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  marketName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
    flex: 1,
  },
  distance: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    marginLeft: 8,
  },
  marketAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  marketSchedule: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 8,
  },
  // Website link shown below schedule
  websiteLink: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: FONTS.mono,
    marginBottom: 6,
    textDecorationLine: "underline",
  },
  directionsHint: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: FONTS.serif,
    fontWeight: "500",
  },
});
