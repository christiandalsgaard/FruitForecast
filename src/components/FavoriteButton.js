/**
 * FavoriteButton — heart toggle that persists favorites to AsyncStorage.
 *
 * When a user favorites a produce item, it gets added to their favorites
 * list and the notification scheduler is triggered to send an alert
 * when that item comes into peak season.
 */

import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { scheduleSeasonAlerts } from "../utils/notifications";
import { COLORS } from "../utils/theme";

export default function FavoriteButton({ produceId, climateShift }) {
  const [favorited, setFavorited] = useState(false);

  // Load initial favorite state from AsyncStorage on mount
  useEffect(() => {
    isFavorite(produceId).then(setFavorited);
  }, [produceId]);

  const handlePress = async () => {
    const nowFavorited = await toggleFavorite(produceId);
    setFavorited(nowFavorited);

    // Re-schedule all notifications so the new favorite is included
    // (or removed if it was unfavorited). This is cheap because we
    // cancel + re-schedule all at once.
    scheduleSeasonAlerts(climateShift).catch(() => {});
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={styles.button}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={[styles.heart, favorited && styles.heartActive]}>
        {favorited ? "♥" : "♡"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  heart: {
    fontSize: 20,
    color: COLORS.textFaint,
  },
  heartActive: {
    color: "#E53935",
  },
});
