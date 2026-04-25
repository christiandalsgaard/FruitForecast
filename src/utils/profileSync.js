/**
 * Profile sync — bidirectional sync between local storage and Supabase.
 *
 * When a user signs in, we:
 *   1. Check if they have a profile in Supabase
 *   2. If yes: pull cloud data and merge with local (cloud wins for conflicts)
 *   3. If no: create a profile from current local data (first-time setup)
 *
 * When the user makes changes locally (favorite, journal entry, etc.),
 * we push the update to Supabase in the background. If the push fails
 * (offline, network error), changes are preserved locally and will
 * sync on next successful push.
 *
 * The sync is eventually-consistent, not real-time. This is fine for
 * a produce app where data changes are infrequent and non-critical.
 */

import { supabase, hasSupabase } from "./supabase";
import { getFavorites } from "./favorites";
import { getJournalEntries } from "./journal";
import { getPreferences } from "./preferences";
import { writeCache } from "./cache";

/**
 * Load the user's profile from Supabase.
 * Returns null if no profile exists or Supabase is not configured.
 *
 * @param {string} userId — the auth user's UUID
 * @returns {Promise<Object|null>}
 */
export async function loadCloudProfile(userId) {
  if (!hasSupabase() || !userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is normal for new users
      if (error.code === "PGRST116") return null;
      console.warn("Failed to load cloud profile:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Cloud profile load error:", err.message);
    return null;
  }
}

/**
 * Create a new profile in Supabase from the user's current local data.
 * Called on first sign-in when no cloud profile exists yet.
 *
 * @param {string} userId
 * @param {string} displayName — from sign-up form
 * @returns {Promise<Object|null>} — the created profile
 */
export async function createCloudProfile(userId, displayName = "") {
  if (!hasSupabase() || !userId) return null;

  try {
    // Gather current local data to seed the cloud profile
    const [favorites, journal, preferences] = await Promise.all([
      getFavorites(),
      getJournalEntries(),
      getPreferences(),
    ]);

    const profile = {
      user_id: userId,
      display_name: displayName,
      avatar_emoji: "🍎",
      preferred_region: preferences.savedRegion || null,
      favorites: [...favorites],
      journal: journal,
      preferences: {
        notificationsEnabled: preferences.notificationsEnabled,
        distanceUnit: preferences.distanceUnit,
      },
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.warn("Failed to create cloud profile:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Cloud profile create error:", err.message);
    return null;
  }
}

/**
 * Pull cloud profile data into local storage.
 * Cloud data wins for conflicts (latest-write-wins strategy).
 *
 * @param {Object} cloudProfile — the profile row from Supabase
 */
export async function pullFromCloud(cloudProfile) {
  if (!cloudProfile) return;

  try {
    // Sync favorites — cloud overwrites local
    if (Array.isArray(cloudProfile.favorites)) {
      await writeCache("favorites", cloudProfile.favorites);
    }

    // Sync journal — merge: keep all entries, deduplicate by ID
    if (Array.isArray(cloudProfile.journal)) {
      const localJournal = (await getJournalEntries()) || [];
      const localIds = new Set(localJournal.map((e) => e.id));
      // Add any cloud entries not already in local
      const merged = [...localJournal];
      for (const entry of cloudProfile.journal) {
        if (!localIds.has(entry.id)) {
          merged.push(entry);
        }
      }
      // Sort newest first and persist
      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      await writeCache("journal", merged);
    }

    // Sync preferences
    if (cloudProfile.preferences && typeof cloudProfile.preferences === "object") {
      const localPrefs = await getPreferences();
      const merged = { ...localPrefs, ...cloudProfile.preferences };
      // Also restore saved region if the cloud has one
      if (cloudProfile.preferred_region) {
        merged.savedRegion = cloudProfile.preferred_region;
      }
      await writeCache("preferences", merged);
    }
  } catch (err) {
    console.warn("Pull from cloud failed:", err.message);
  }
}

/**
 * Push current local data to the cloud profile.
 * Called after local changes (favorite toggle, journal entry, etc.).
 * Runs in the background — failures are silently logged.
 *
 * @param {string} userId
 */
export async function pushToCloud(userId) {
  if (!hasSupabase() || !userId) return;

  try {
    const [favorites, journal, preferences] = await Promise.all([
      getFavorites(),
      getJournalEntries(),
      getPreferences(),
    ]);

    const updates = {
      favorites: [...favorites],
      journal: journal,
      preferred_region: preferences.savedRegion || null,
      preferences: {
        notificationsEnabled: preferences.notificationsEnabled,
        distanceUnit: preferences.distanceUnit,
      },
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      console.warn("Push to cloud failed:", error.message);
    }
  } catch (err) {
    console.warn("Cloud push error:", err.message);
  }
}

/**
 * Update a specific field on the cloud profile.
 * Lighter than pushToCloud when only one thing changed.
 *
 * @param {string} userId
 * @param {Object} fields — key/value pairs to update
 */
export async function updateCloudField(userId, fields) {
  if (!hasSupabase() || !userId) return;

  try {
    const { error } = await supabase
      .from("profiles")
      .update(fields)
      .eq("user_id", userId);

    if (error) {
      console.warn("Cloud field update failed:", error.message);
    }
  } catch (err) {
    console.warn("Cloud field update error:", err.message);
  }
}

/**
 * Full sync — called on sign-in. Loads cloud profile, merges with
 * local, then pushes the merged result back to cloud.
 *
 * @param {string} userId
 * @param {string} displayName — used only if creating a new profile
 * @returns {Promise<Object|null>} — the cloud profile
 */
export async function fullSync(userId, displayName = "") {
  if (!hasSupabase() || !userId) return null;

  // Try to load existing cloud profile
  let profile = await loadCloudProfile(userId);

  if (!profile) {
    // First time — create cloud profile from local data
    profile = await createCloudProfile(userId, displayName);
  } else {
    // Existing profile — pull cloud data into local
    await pullFromCloud(profile);
  }

  // Push merged local state back to cloud (ensures both sides are in sync)
  await pushToCloud(userId);

  return profile;
}
