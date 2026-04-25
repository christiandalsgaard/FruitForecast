/**
 * ProfileScreen — user profile tab with five collapsible sections:
 *
 * 1. MY FAVORITES — all favorited produce with current season scores.
 *    Empty state: prompt to favorite items from the Home tab.
 *
 * 2. SEASON JOURNAL — chronological log of seasonal purchases.
 *    Empty state: explain how to log purchases from produce cards.
 *    Entries can be deleted with a swipe/tap.
 *
 * 3. MY REGION — current location, market zone, and change button.
 *    Always has data (defaults to auto-detected or New York).
 *
 * 4. NOTIFICATIONS — toggle season alerts, show upcoming alerts.
 *    Web: shows informational message (push not available).
 *    Native: toggle + list of scheduled alerts for favorites.
 *
 * 5. ABOUT — app version, data sources, clear cache button.
 *
 * Each section handles its own loading, error, and empty states
 * so the screen never shows a broken or blank section.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { COLORS, FONTS, getScoreColor } from "../utils/theme";
import { getSeasonLabel } from "../utils/season";
import { getFavorites } from "../utils/favorites";
import { getJournalEntries, getJournalStats, deleteJournalEntry } from "../utils/journal";
import { getPreferences, updatePreferences } from "../utils/preferences";
import { clearAllCache } from "../utils/cache";
import { PRODUCE_DB } from "../data/produce";
import { signUp, signIn, signOut } from "../utils/auth";
import { hasSupabase } from "../utils/supabase";
import { pushToCloud, updateCloudField } from "../utils/profileSync";

// ── Collapsible Section wrapper ─────────────────────────────────
// Reusable accordion component used by each profile section.
// Shows a header with icon + title + chevron, toggles content on tap.
function Section({ icon, title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {/* Optional badge count shown next to title */}
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={styles.chevron}>{open ? "▴" : "▾"}</Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

// ── Main Profile Screen ─────────────────────────────────────────

export default function ProfileScreen({
  locationName, coords, marketZone, onChangeRegion, scoredProduce,
  user, authLoading, syncStatus, onAuthChange,
}) {
  // ── Auth form state ────────────────────────────────────────────
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // ── Profile editing state ──────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");

  // ── State for each section's data ──────────────────────────────
  const [favorites, setFavorites] = useState(null);        // Set<string> or null while loading
  const [journal, setJournal] = useState(null);             // Array or null
  const [journalStats, setJournalStats] = useState(null);   // Stats object or null
  const [prefs, setPrefs] = useState(null);                 // Preferences object or null
  const [loading, setLoading] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  // ── Load all profile data on mount and when tab is focused ─────
  const loadData = useCallback(async () => {
    try {
      const [favs, entries, stats, userPrefs] = await Promise.all([
        getFavorites(),
        getJournalEntries(),
        getJournalStats(),
        getPreferences(),
      ]);
      setFavorites(favs);
      setJournal(entries);
      setJournalStats(stats);
      setPrefs(userPrefs);
    } catch (error) {
      console.warn("Profile data load failed:", error.message);
      // Set empty defaults so UI still renders with empty states
      setFavorites(new Set());
      setJournal([]);
      setJournalStats({ totalEntries: 0, uniqueItems: 0, thisMonth: 0, topItems: [] });
      setPrefs({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen regains focus (user may have favorited
  // or logged items on the Home tab). We poll on a simple interval
  // since React Navigation's focus event isn't available without hooks.
  useEffect(() => {
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Journal entry deletion handler ─────────────────────────────
  const handleDeleteEntry = useCallback(async (entryId, entryName) => {
    // Confirm deletion — web uses window.confirm, native uses Alert
    const doDelete = async () => {
      const success = await deleteJournalEntry(entryId);
      if (success) {
        // Refresh journal data after deletion
        const [entries, stats] = await Promise.all([
          getJournalEntries(),
          getJournalStats(),
        ]);
        setJournal(entries);
        setJournalStats(stats);
      }
    };

    if (Platform.OS === "web") {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Remove "${entryName}" from your journal?`)) {
        await doDelete();
      }
    } else {
      Alert.alert(
        "Delete Entry",
        `Remove "${entryName}" from your journal?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: doDelete },
        ],
      );
    }
  }, []);

  // ── Notification toggle handler ────────────────────────────────
  const handleToggleNotifications = useCallback(async () => {
    const newValue = !prefs?.notificationsEnabled;
    const updated = await updatePreferences({ notificationsEnabled: newValue });
    setPrefs(updated);
  }, [prefs]);

  // ── Clear cache handler ────────────────────────────────────────
  const handleClearCache = useCallback(async () => {
    const doClear = async () => {
      await clearAllCache();
      setCacheCleared(true);
      // Reset cleared flag after 3 seconds
      setTimeout(() => setCacheCleared(false), 3000);
    };

    if (Platform.OS === "web") {
      // eslint-disable-next-line no-restricted-globals
      if (confirm("Clear all cached data? Weather, markets, and geocoding will be re-fetched.")) {
        await doClear();
      }
    } else {
      Alert.alert(
        "Clear Cache",
        "Clear all cached data? Weather, markets, and geocoding will be re-fetched. Your favorites and journal will not be affected.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: doClear },
        ],
      );
    }
  }, []);

  // ── Auth handlers ──────────────────────────────────────────────
  const handleSignUp = useCallback(async () => {
    setAuthError(null);
    setAuthBusy(true);
    const result = await signUp(email, password);
    setAuthBusy(false);

    if (result.error) {
      setAuthError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      // Supabase requires email confirmation
      setConfirmationSent(true);
      return;
    }
    // Sign-up with auto-confirm succeeded — clear form
    setEmail("");
    setPassword("");
    setDisplayName("");
  }, [email, password]);

  const handleSignIn = useCallback(async () => {
    setAuthError(null);
    setAuthBusy(true);
    const result = await signIn(email, password);
    setAuthBusy(false);

    if (result.error) {
      setAuthError(result.error);
      return;
    }
    // Sign-in succeeded — clear form
    setEmail("");
    setPassword("");
  }, [email, password]);

  const handleSignOut = useCallback(async () => {
    const doSignOut = async () => {
      await signOut();
    };

    if (Platform.OS === "web") {
      if (confirm("Sign out? Your data is saved locally and will sync when you sign back in.")) {
        await doSignOut();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Your data is saved locally and will sync when you sign back in.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", onPress: doSignOut },
        ],
      );
    }
  }, []);

  const handleUpdateDisplayName = useCallback(async () => {
    if (!user || !newDisplayName.trim()) return;
    await updateCloudField(user.id, { display_name: newDisplayName.trim() });
    setEditingName(false);
    setNewDisplayName("");
  }, [user, newDisplayName]);

  // ── Build favorites list with current scores ───────────────────
  // Cross-reference favorite IDs with the scored produce data passed
  // from the parent so we show live scores, not stale cached ones.
  const favoriteItems = (favorites && scoredProduce)
    ? scoredProduce.filter((item) => favorites.has(item.id))
    : [];

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  // ── Format a date string for display ───────────────────────────
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🍎</Text>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>
          Your seasonal produce preferences & history
        </Text>
      </View>

      {/* ── SECTION 0: ACCOUNT ────────────────────────────────────── */}
      <Section icon="👤" title="Account" defaultOpen={!user}>
        {!hasSupabase() ? (
          // Supabase not configured — local-only mode
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔒</Text>
            <Text style={styles.emptyTitle}>Local Only</Text>
            <Text style={styles.emptyText}>
              Account features are not configured. Your data is stored
              on this device only.
            </Text>
          </View>
        ) : authLoading ? (
          // Auth is initializing
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.emptyText}>Checking account…</Text>
          </View>
        ) : user ? (
          // Signed in — show profile info
          <View style={styles.accountCard}>
            {/* User info row */}
            <View style={styles.accountHeader}>
              <Text style={styles.accountAvatar}>🍎</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountEmail}>{user.email}</Text>
                <Text style={styles.accountMember}>
                  Member since {new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>

            {/* Sync status indicator */}
            <View style={styles.syncRow}>
              <View style={[
                styles.syncDot,
                { backgroundColor:
                  syncStatus === "synced" ? COLORS.peak :
                  syncStatus === "syncing" ? COLORS.comingSoon :
                  syncStatus === "error" ? COLORS.outOfSeason :
                  COLORS.textFaint
                }
              ]} />
              <Text style={styles.syncText}>
                {syncStatus === "synced" ? "Data synced across devices" :
                 syncStatus === "syncing" ? "Syncing…" :
                 syncStatus === "error" ? "Sync failed — data saved locally" :
                 "Not synced"}
              </Text>
            </View>

            {/* Sign out button */}
            <TouchableOpacity
              style={styles.signOutBtn}
              activeOpacity={0.7}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : confirmationSent ? (
          // Email confirmation required
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📧</Text>
            <Text style={styles.emptyTitle}>Check your email</Text>
            <Text style={styles.emptyText}>
              We sent a confirmation link to your email. Click it to
              activate your account, then come back and sign in.
            </Text>
            <TouchableOpacity
              style={styles.authSwitchBtn}
              onPress={() => {
                setConfirmationSent(false);
                setAuthMode("signin");
              }}
            >
              <Text style={styles.authSwitchText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Sign in / sign up form
          <View style={styles.authForm}>
            {/* Mode toggle tabs */}
            <View style={styles.authTabs}>
              <TouchableOpacity
                style={[styles.authTab, authMode === "signin" && styles.authTabActive]}
                onPress={() => { setAuthMode("signin"); setAuthError(null); }}
              >
                <Text style={[styles.authTabText, authMode === "signin" && styles.authTabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authTab, authMode === "signup" && styles.authTabActive]}
                onPress={() => { setAuthMode("signup"); setAuthError(null); }}
              >
                <Text style={[styles.authTabText, authMode === "signup" && styles.authTabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Display name field (sign up only) */}
            {authMode === "signup" && (
              <TextInput
                style={styles.authInput}
                placeholder="Display name (optional)"
                placeholderTextColor={COLORS.textFaint}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                maxLength={50}
              />
            )}

            {/* Email field */}
            <TextInput
              style={styles.authInput}
              placeholder="Email address"
              placeholderTextColor={COLORS.textFaint}
              value={email}
              onChangeText={(t) => { setEmail(t); setAuthError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password field */}
            <TextInput
              style={styles.authInput}
              placeholder={authMode === "signup" ? "Password (min 6 characters)" : "Password"}
              placeholderTextColor={COLORS.textFaint}
              value={password}
              onChangeText={(t) => { setPassword(t); setAuthError(null); }}
              secureTextEntry
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            />

            {/* Error message */}
            {authError && (
              <View style={styles.authErrorRow}>
                <Text style={styles.authErrorText}>{authError}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.authSubmitBtn, authBusy && { opacity: 0.6 }]}
              activeOpacity={0.7}
              disabled={authBusy}
              onPress={authMode === "signup" ? handleSignUp : handleSignIn}
            >
              <Text style={styles.authSubmitText}>
                {authBusy ? "Please wait…" : authMode === "signup" ? "Create Account" : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Benefits pitch */}
            <Text style={styles.authBenefits}>
              {authMode === "signup"
                ? "Create an account to sync your favorites, journal, and preferences across all your devices."
                : "Sign in to restore your synced data on this device."}
            </Text>
          </View>
        )}
      </Section>

      {/* ── SECTION 1: MY FAVORITES ───────────────────────────────── */}
      <Section
        icon="♥"
        title="My Favorites"
        badge={favoriteItems.length}
        defaultOpen={true}
      >
        {favoriteItems.length === 0 ? (
          // Empty state — guide the user to the Home tab
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💛</Text>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any produce item in the Home tab to save it
              here. You'll see its current season score and get notified when it
              hits peak season.
            </Text>
          </View>
        ) : (
          // Favorites list with live scores
          <View>
            {favoriteItems.map((item) => {
              const scoreColor = getScoreColor(item.score);
              const label = getSeasonLabel(item.score);
              return (
                <View key={item.id} style={styles.favRow}>
                  <Text style={styles.favEmoji}>{item.emoji}</Text>
                  <View style={styles.favInfo}>
                    <Text style={styles.favName}>{item.name}</Text>
                    <Text style={[styles.favLabel, { color: scoreColor }]}>
                      {label}
                    </Text>
                  </View>
                  {/* Score pill */}
                  <View style={[styles.scorePill, { backgroundColor: scoreColor + "18" }]}>
                    <Text style={[styles.scoreText, { color: scoreColor }]}>
                      {item.score}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Section>

      {/* ── SECTION 2: SEASON JOURNAL ─────────────────────────────── */}
      <Section
        icon="📓"
        title="Season Journal"
        badge={journalStats?.totalEntries}
      >
        {/* Stats summary bar — only shown when entries exist */}
        {journalStats && journalStats.totalEntries > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{journalStats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{journalStats.uniqueItems}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{journalStats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        )}

        {/* Top items — show most-logged produce */}
        {journalStats && journalStats.topItems.length > 0 && (
          <View style={styles.topItemsRow}>
            <Text style={styles.topItemsLabel}>Most logged:</Text>
            {journalStats.topItems.map((item) => (
              <Text key={item.name} style={styles.topItemChip}>
                {item.emoji} {item.name} ({item.count})
              </Text>
            ))}
          </View>
        )}

        {/* Journal entries timeline */}
        {!journal || journal.length === 0 ? (
          // Empty state — explain how to log purchases
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              When you buy seasonal produce, tap any item on the Home tab and
              use the "Log Purchase" button to record it here. Build a personal
              history of your seasonal eating!
            </Text>
          </View>
        ) : (
          // Timeline of journal entries
          <View>
            {journal.map((entry) => (
              <View key={entry.id} style={styles.journalEntry}>
                <View style={styles.journalLeft}>
                  <Text style={styles.journalEmoji}>{entry.emoji}</Text>
                  <View style={styles.journalTimeline} />
                </View>
                <View style={styles.journalBody}>
                  <View style={styles.journalHeader}>
                    <Text style={styles.journalName}>{entry.produceName}</Text>
                    <Text style={styles.journalDate}>{formatDate(entry.date)}</Text>
                  </View>
                  {/* Show the score at time of purchase */}
                  <Text style={[styles.journalScore, { color: getScoreColor(entry.score) }]}>
                    Score: {entry.score} · {getSeasonLabel(entry.score)}
                  </Text>
                  {/* User's note if provided */}
                  {entry.note ? (
                    <Text style={styles.journalNote}>"{entry.note}"</Text>
                  ) : null}
                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.6}
                    onPress={() => handleDeleteEntry(entry.id, entry.produceName)}
                  >
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </Section>

      {/* ── SECTION 3: MY REGION ──────────────────────────────────── */}
      <Section icon="📍" title="My Region">
        <View style={styles.regionCard}>
          {/* Current location display */}
          <View style={styles.regionRow}>
            <Text style={styles.regionLabel}>Location</Text>
            <Text style={styles.regionValue}>{locationName || "Unknown"}</Text>
          </View>

          {/* Market zone — the scoring region */}
          <View style={styles.regionRow}>
            <Text style={styles.regionLabel}>Market Zone</Text>
            <Text style={styles.regionValue}>
              {marketZone ? marketZone.replace(/_/g, " ") : "Detecting…"}
            </Text>
          </View>

          {/* Coordinates */}
          {coords && (
            <View style={styles.regionRow}>
              <Text style={styles.regionLabel}>Coordinates</Text>
              <Text style={styles.regionCoords}>
                {coords.latitude.toFixed(2)}°, {coords.longitude.toFixed(2)}°
              </Text>
            </View>
          )}

          {/* Change region button */}
          <TouchableOpacity
            style={styles.regionBtn}
            activeOpacity={0.7}
            onPress={onChangeRegion}
          >
            <Text style={styles.regionBtnText}>Change Region</Text>
          </TouchableOpacity>

          {/* Info about how region affects scores */}
          <Text style={styles.regionHint}>
            Your market zone determines where produce is sourced from and
            affects seasonality scores. Changing your region will update
            all scores on the Home tab.
          </Text>
        </View>
      </Section>

      {/* ── SECTION 4: NOTIFICATIONS ──────────────────────────────── */}
      <Section icon="🔔" title="Notifications">
        {Platform.OS === "web" ? (
          // Web: push notifications aren't available
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyTitle}>Mobile only</Text>
            <Text style={styles.emptyText}>
              Push notifications for seasonal alerts are available on the iOS
              and Android apps. On the web, check back here or browse the Home
              tab to see what's in season.
            </Text>
          </View>
        ) : (
          // Native: toggle + upcoming alerts info
          <View>
            {/* Toggle row */}
            <TouchableOpacity
              style={styles.toggleRow}
              activeOpacity={0.7}
              onPress={handleToggleNotifications}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Season Alerts</Text>
                <Text style={styles.toggleDesc}>
                  Get notified when your favorite produce hits peak season
                </Text>
              </View>
              <View style={[
                styles.toggle,
                prefs?.notificationsEnabled && styles.toggleOn,
              ]}>
                <View style={[
                  styles.toggleKnob,
                  prefs?.notificationsEnabled && styles.toggleKnobOn,
                ]} />
              </View>
            </TouchableOpacity>

            {/* Show what alerts are pending */}
            {prefs?.notificationsEnabled && favoriteItems.length > 0 && (
              <View style={styles.alertsList}>
                <Text style={styles.alertsTitle}>Upcoming alerts for:</Text>
                {favoriteItems.map((item) => (
                  <Text key={item.id} style={styles.alertItem}>
                    {item.emoji} {item.name}
                  </Text>
                ))}
              </View>
            )}

            {/* No favorites = no alerts */}
            {prefs?.notificationsEnabled && favoriteItems.length === 0 && (
              <Text style={styles.alertsEmpty}>
                Favorite some produce on the Home tab to receive season alerts.
              </Text>
            )}
          </View>
        )}
      </Section>

      {/* ── SECTION 5: ABOUT ──────────────────────────────────────── */}
      <Section icon="ℹ️" title="About">
        <View style={styles.aboutCard}>
          <Text style={styles.aboutName}>Fruit Forecast</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            A seasonal produce guide that shows you what's freshest based on
            your location, source regions, and real weather data.
          </Text>

          {/* Data sources */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutSectionTitle}>Data Sources</Text>
            <Text style={styles.aboutSource}>Weather — Open-Meteo (free, open-source)</Text>
            <Text style={styles.aboutSource}>Geocoding — Nominatim / OpenStreetMap</Text>
            <Text style={styles.aboutSource}>Markets — OpenStreetMap Overpass API</Text>
            <Text style={styles.aboutSource}>Produce data — curated seasonal database</Text>
          </View>

          {/* Clear cache button */}
          <TouchableOpacity
            style={[styles.clearCacheBtn, cacheCleared && styles.clearCacheDone]}
            activeOpacity={0.7}
            onPress={handleClearCache}
            disabled={cacheCleared}
          >
            <Text style={[styles.clearCacheText, cacheCleared && styles.clearCacheDoneText]}>
              {cacheCleared ? "Cache Cleared ✓" : "Clear Cached Data"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.clearCacheHint}>
            Clears weather, geocoding, and market data. Your favorites and
            journal entries will not be affected.
          </Text>
        </View>
      </Section>

      {/* Bottom padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    gap: 16,
    minHeight: 300,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONTS.serif,
  },

  // ── Profile header ──────────────────────────────────────────────
  header: {
    alignItems: "center",
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "400",
    color: COLORS.white,
    fontFamily: FONTS.serif,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    marginTop: 4,
  },

  // ── Collapsible section ─────────────────────────────────────────
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.mono,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  sectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  // ── Empty states ────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Favorites section ───────────────────────────────────────────
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    gap: 10,
  },
  favEmoji: {
    fontSize: 24,
  },
  favInfo: {
    flex: 1,
  },
  favName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  favLabel: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    marginTop: 2,
  },
  scorePill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: FONTS.mono,
  },

  // ── Journal section ─────────────────────────────────────────────
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.breakdownBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: FONTS.mono,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.separator,
  },
  topItemsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  topItemsLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  topItemChip: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  journalEntry: {
    flexDirection: "row",
    marginBottom: 4,
  },
  journalLeft: {
    alignItems: "center",
    width: 36,
    marginRight: 10,
  },
  journalEmoji: {
    fontSize: 20,
  },
  journalTimeline: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.separator,
    marginTop: 4,
  },
  journalBody: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  journalName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  journalDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  journalScore: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    marginBottom: 4,
  },
  journalNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    marginBottom: 4,
  },
  deleteBtn: {
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontSize: 11,
    color: COLORS.outOfSeason,
    fontFamily: FONTS.mono,
  },

  // ── Region section ──────────────────────────────────────────────
  regionCard: {
    gap: 8,
  },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  regionLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  regionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  regionCoords: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
  },
  regionBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  regionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.serif,
  },
  regionHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
    lineHeight: 16,
    marginTop: 4,
  },

  // ── Notifications section ───────────────────────────────────────
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  toggleDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.separator,
    padding: 2,
    justifyContent: "center",
  },
  toggleOn: {
    backgroundColor: COLORS.peak,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleKnobOn: {
    alignSelf: "flex-end",
  },
  alertsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  alertsTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 6,
  },
  alertItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    paddingVertical: 3,
  },
  alertsEmpty: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    marginTop: 8,
  },

  // ── About section ───────────────────────────────────────────────
  aboutCard: {
    gap: 4,
  },
  aboutName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  aboutVersion: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 4,
  },
  aboutDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutSection: {
    marginBottom: 12,
  },
  aboutSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginBottom: 6,
    letterSpacing: 1,
  },
  aboutSource: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
    paddingVertical: 2,
  },
  clearCacheBtn: {
    borderWidth: 1,
    borderColor: COLORS.outOfSeason,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  clearCacheDone: {
    borderColor: COLORS.peak,
    backgroundColor: COLORS.peakBg,
  },
  clearCacheText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.outOfSeason,
    fontFamily: FONTS.serif,
  },
  clearCacheDoneText: {
    color: COLORS.peak,
  },
  clearCacheHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
    marginTop: 6,
    lineHeight: 16,
  },

  // ── Account / Auth section ──────────────────────────────────────
  accountCard: {
    gap: 12,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountAvatar: {
    fontSize: 36,
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  accountMember: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
    marginTop: 2,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.breakdownBg,
    borderRadius: 8,
    padding: 10,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
  },

  // ── Auth form ───────────────────────────────────────────────────
  authForm: {
    gap: 10,
  },
  authTabs: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.separator,
    marginBottom: 4,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  authTabActive: {
    backgroundColor: COLORS.accent,
  },
  authTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
  },
  authTabTextActive: {
    color: COLORS.white,
  },
  authInput: {
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.serif,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  authErrorRow: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 10,
  },
  authErrorText: {
    fontSize: 12,
    color: COLORS.outOfSeason,
    fontFamily: FONTS.serif,
  },
  authSubmitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
  },
  authSubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.serif,
  },
  authBenefits: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: FONTS.serif,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 4,
  },
  authSwitchBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  authSwitchText: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.serif,
    fontWeight: "600",
  },
});
