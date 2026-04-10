/**
 * Analytics event tracking.
 *
 * Provides a simple track() function that logs events. When POSTHOG_KEY
 * is configured in config/api.js, events are sent to PostHog. Otherwise,
 * events are logged to the console in dev mode (useful for debugging).
 *
 * This module is designed to be swappable — you can replace PostHog
 * with Amplitude, Mixpanel, or any other provider by changing the
 * sendToProvider function.
 *
 * Tracked events help answer questions like:
 *   - Which produce items do users tap most?
 *   - Which regions are most popular?
 *   - Do users use the market finder or recipe features?
 *   - What months do users browse most?
 */

import { Platform } from "react-native";
import { POSTHOG_KEY, hasKey } from "../config/api";

// ── Event names (constants to prevent typos) ────────────────────
export const EVENTS = {
  PRODUCE_TAP: "produce_tap",           // User tapped a produce card
  PRODUCE_FAVORITE: "produce_favorite", // User favorited/unfavorited
  REGION_CHANGE: "region_change",       // User changed region
  MONTH_CHANGE: "month_change",         // User changed month
  FILTER_CHANGE: "filter_change",       // User changed filter
  MARKET_EXPAND: "market_expand",       // User opened market finder
  MARKET_TAP: "market_tap",            // User tapped a market for directions
  RECIPE_EXPAND: "recipe_expand",       // User opened recipe section
  RECIPE_TAP: "recipe_tap",            // User tapped a recipe link
};

/**
 * Track an analytics event with optional properties.
 *
 * @param {string} event — event name (use EVENTS constants)
 * @param {Object} properties — key/value pairs (e.g. { produce: "strawberries" })
 */
export function track(event, properties = {}) {
  // Add common properties to every event
  const enriched = {
    ...properties,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  };

  // Send to PostHog if configured
  if (hasKey(POSTHOG_KEY)) {
    sendToPostHog(event, enriched);
  }

  // In dev mode, also log to console for debugging
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, enriched);
  }
}

// ── PostHog integration ─────────────────────────────────────────
// Uses PostHog's HTTP API directly to avoid adding a heavy SDK.
// Events are fire-and-forget — failures are silently ignored so
// analytics never block the UI.

function sendToPostHog(event, properties) {
  const payload = {
    api_key: POSTHOG_KEY,
    event,
    properties: {
      ...properties,
      // PostHog requires a distinct_id. We use a simple device identifier.
      // In production, use a proper anonymous ID or user ID.
      distinct_id: "anonymous",
    },
    timestamp: new Date().toISOString(),
  };

  // Fire-and-forget — don't await, don't block UI
  fetch("https://app.posthog.com/capture/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently ignore analytics failures — they should never affect UX
  });
}
