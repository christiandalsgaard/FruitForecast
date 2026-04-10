/**
 * MarketFinder — collapsible section showing nearby farmer's markets.
 *
 * Fetches markets from the USDA API when expanded. Each market card
 * shows name, distance, schedule, and available products. Tapping a
 * market opens directions in the default maps app.
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
  // so we don't hit the USDA API unless the user actually wants this.
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

  // Open directions in the device's maps app
  const openDirections = (address) => {
    const encoded = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:?q=${encoded}`,
      android: `geo:0,0?q=${encoded}`,
      web: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    });
    Linking.openURL(url).catch(() => {});
  };

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
                onPress={() => openDirections(market.address)}
              >
                <View style={styles.marketHeader}>
                  <Text style={styles.marketName}>{market.name}</Text>
                  {market.distance && (
                    <Text style={styles.distance}>
                      {market.distance.toFixed(1)} mi
                    </Text>
                  )}
                </View>

                <Text style={styles.marketAddress}>{market.address}</Text>
                <Text style={styles.marketSchedule}>{market.schedule}</Text>

                {/* Product tags — show what this market sells */}
                {market.products.length > 0 && (
                  <View style={styles.productRow}>
                    {market.products.slice(0, 6).map((product) => (
                      <View key={product} style={styles.productTag}>
                        <Text style={styles.productText}>{product}</Text>
                      </View>
                    ))}
                  </View>
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
    backgroundColor: "rgba(255,255,255,0.65)",
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
  // Product category tags
  productRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  productTag: {
    backgroundColor: COLORS.vegBadgeBg,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 50,
  },
  productText: {
    fontSize: 9,
    color: COLORS.vegBadgeText,
    fontWeight: "600",
    fontFamily: FONTS.mono,
  },
  directionsHint: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: FONTS.serif,
    fontWeight: "500",
  },
});
