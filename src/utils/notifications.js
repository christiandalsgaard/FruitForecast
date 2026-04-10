/**
 * Push notification scheduler for seasonal alerts.
 *
 * Checks the user's favorited produce and schedules local notifications
 * for the start of each item's peak season. Notifications are local-only
 * (no server needed) and use expo-notifications.
 *
 * On web, notifications are not supported — all functions are no-ops.
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { PRODUCE_DB } from "../data/produce";
import { getFavorites } from "./favorites";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted, false otherwise.
 * On web, always returns false (not supported).
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === "web") return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule notifications for all favorited produce items.
 *
 * For each favorite, schedules a notification at the start of its
 * peak season (the first peak month). Cancels any existing scheduled
 * notifications first to avoid duplicates.
 *
 * @param {number} climateShift — the user's climate offset (from getClimateShift)
 */
export async function scheduleSeasonAlerts(climateShift = 0) {
  if (Platform.OS === "web") return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Cancel all previously scheduled notifications to start fresh —
  // the user's favorites or location may have changed.
  await Notifications.cancelAllScheduledNotificationsAsync();

  const favorites = await getFavorites();
  if (favorites.size === 0) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (const produceId of favorites) {
    const item = PRODUCE_DB.find((p) => p.id === produceId);
    if (!item || item.peak.length === 0) continue;

    // Find the first peak month, adjusted for climate
    const firstPeakMonth = (item.peak[0] + climateShift + 12) % 12;

    // Calculate the next occurrence of this month.
    // If it's already past this year, schedule for next year.
    let targetYear = currentYear;
    if (firstPeakMonth <= currentMonth) {
      targetYear += 1;
    }

    // Schedule for the 1st of the peak month at 9:00 AM
    const triggerDate = new Date(targetYear, firstPeakMonth, 1, 9, 0, 0);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${item.emoji} ${item.name} is in season!`,
          body: `${item.name} just hit peak season. Head to your local market for the freshest pick.`,
          data: { produceId: item.id },
        },
        trigger: { date: triggerDate },
      });
    } catch (error) {
      // Individual notification failure shouldn't stop the rest
      console.warn(`Failed to schedule notification for ${item.name}:`, error.message);
    }
  }
}
