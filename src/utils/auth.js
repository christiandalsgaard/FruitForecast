/**
 * Auth layer — email/password authentication via Supabase.
 *
 * Provides sign up, sign in, sign out, and session management.
 * When Supabase is not configured, all functions return graceful
 * null/false results so the app runs in local-only mode.
 *
 * Session state is exposed via getSession() and onAuthStateChange().
 * The App.js component listens for auth changes and passes the
 * current user down to screens via props.
 *
 * Error messages are user-friendly strings, not raw Supabase errors.
 */

import { supabase, hasSupabase } from "./supabase";

/**
 * Sign up a new user with email and password.
 *
 * @param {string} email
 * @param {string} password — minimum 6 characters (Supabase default)
 * @returns {{ user: Object|null, error: string|null }}
 */
export async function signUp(email, password) {
  if (!hasSupabase()) {
    return { user: null, error: "Account features are not configured." };
  }

  // Client-side validation before hitting the API
  if (!email || !email.includes("@")) {
    return { user: null, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { user: null, error: "Password must be at least 6 characters." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { user: null, error: friendlyError(error.message) };
    }

    // Supabase returns a user even if email confirmation is required.
    // Check if the user is confirmed or pending.
    if (data.user && !data.session) {
      return {
        user: data.user,
        error: null,
        needsConfirmation: true,
      };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: "Network error. Please check your connection." };
  }
}

/**
 * Sign in an existing user with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {{ user: Object|null, error: string|null }}
 */
export async function signIn(email, password) {
  if (!hasSupabase()) {
    return { user: null, error: "Account features are not configured." };
  }

  if (!email || !email.includes("@")) {
    return { user: null, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { user: null, error: "Please enter your password." };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { user: null, error: friendlyError(error.message) };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: "Network error. Please check your connection." };
  }
}

/**
 * Sign out the current user. Clears the session from storage.
 *
 * @returns {{ error: string|null }}
 */
export async function signOut() {
  if (!hasSupabase()) return { error: null };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: friendlyError(error.message) };
    return { error: null };
  } catch {
    return { error: "Could not sign out. Please try again." };
  }
}

/**
 * Get the current session (user + access token).
 * Returns null if not authenticated.
 *
 * @returns {Promise<{ user: Object, session: Object }|null>}
 */
export async function getSession() {
  if (!hasSupabase()) return null;

  try {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to auth state changes (sign in, sign out, token refresh).
 * Returns an unsubscribe function.
 *
 * @param {Function} callback — receives (event, session)
 * @returns {Function} unsubscribe
 */
export function onAuthStateChange(callback) {
  if (!hasSupabase()) return () => {};

  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

/**
 * Map raw Supabase error messages to user-friendly strings.
 * Supabase errors can be cryptic — this makes them readable.
 */
function friendlyError(message) {
  const msg = (message || "").toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please check your email and confirm your account first.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Please check your connection.";
  }
  if (msg.includes("password") && msg.includes("short")) {
    return "Password must be at least 6 characters.";
  }

  // Fall back to the original message if we don't have a friendly version
  return message;
}
