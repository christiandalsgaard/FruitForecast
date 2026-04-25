/**
 * Supabase client — connects to the Supabase project for auth and
 * profile data persistence.
 *
 * The app works fully offline / without Supabase configured. When
 * SUPABASE_URL and SUPABASE_ANON_KEY are set, users can create
 * accounts and sync their favorites, journal, and preferences
 * across devices.
 *
 * On web, Supabase stores the session in localStorage automatically.
 * On native, we pass AsyncStorage as the auth storage adapter so
 * sessions persist across app restarts.
 */

import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

// ── Configuration ───────────────────────────────────────────────
// These are safe to expose in client code — the anon key only grants
// access scoped by Row Level Security policies on the Supabase side.
// In production, set these via environment variables or Expo constants.
const SUPABASE_URL = "https://tqfcohqtxzudnqaypqej.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZmNvaHF0eHp1ZG5xYXlwcWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjkxMjAsImV4cCI6MjA2MTEwNTEyMH0.u1C6GJKP_GJNEJd_bJrL9cSuI0VCjW-E8ORRSDnvotQ";

/**
 * Check if Supabase is configured. When false, all auth and sync
 * features are disabled and the app runs in local-only mode.
 */
export function hasSupabase() {
  return (
    typeof SUPABASE_URL === "string" &&
    SUPABASE_URL.length > 0 &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_ANON_KEY.length > 0
  );
}

// ── Client initialization ───────────────────────────────────────
// Build the Supabase client with platform-appropriate auth storage.
// On native, AsyncStorage keeps the session token across app restarts.
// On web, Supabase uses localStorage by default (no extra config needed).

let supabase = null;

if (hasSupabase()) {
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
    },
  };

  // On native, use AsyncStorage for session persistence
  if (Platform.OS !== "web") {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      options.auth.storage = AsyncStorage;
    } catch {
      // AsyncStorage not available — sessions won't persist across restarts
      console.warn("AsyncStorage not available for Supabase session storage");
    }
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

export { supabase };
