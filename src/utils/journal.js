/**
 * Season Journal — shopping log persistence layer.
 *
 * Lets users record when they buy seasonal produce. Each entry captures
 * the item, date, an optional note, and the seasonality score at the
 * time of purchase. This builds a personal history of seasonal eating
 * that the Profile tab surfaces as a timeline.
 *
 * All data is stored via the platform-aware cache layer (localStorage
 * on web, AsyncStorage on native) so it persists across sessions.
 *
 * Data shape per entry:
 *   { id, produceId, produceName, emoji, date, note, score }
 */

import { readCache, writeCache } from "./cache";

// Cache key for the journal entries array
const JOURNAL_KEY = "journal";

/**
 * Get all journal entries, sorted newest-first.
 * Returns an empty array if no entries exist yet.
 *
 * @returns {Promise<Array<{id: string, produceId: string, produceName: string, emoji: string, date: string, note: string, score: number}>>}
 */
export async function getJournalEntries() {
  const entries = await readCache(JOURNAL_KEY);
  if (!entries || !Array.isArray(entries)) return [];
  // Sort newest first so the timeline reads top-to-bottom chronologically
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Add a new journal entry for a produce purchase.
 *
 * Generates a unique ID from timestamp + random suffix to avoid
 * collisions if a user logs two items in the same second.
 *
 * @param {Object} params
 * @param {string} params.produceId — ID from the produce database
 * @param {string} params.produceName — display name (e.g. "Strawberries")
 * @param {string} params.emoji — produce emoji for display
 * @param {string} [params.note] — optional user note ("Got these at the farmers market")
 * @param {number} params.score — current seasonality score (1-100)
 * @returns {Promise<Object>} — the newly created entry
 */
export async function addJournalEntry({ produceId, produceName, emoji, note = "", score }) {
  const entries = await getJournalEntries();

  // Build the new entry with a unique ID
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    produceId,
    produceName,
    emoji,
    date: new Date().toISOString(),
    note: note.trim(),
    score: Math.round(score),
  };

  // Prepend to array (newest first) and persist
  entries.unshift(entry);
  await writeCache(JOURNAL_KEY, entries);

  return entry;
}

/**
 * Delete a journal entry by ID.
 * Returns true if the entry was found and removed, false otherwise.
 *
 * @param {string} entryId
 * @returns {Promise<boolean>}
 */
export async function deleteJournalEntry(entryId) {
  const entries = await getJournalEntries();
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) return false;

  entries.splice(index, 1);
  await writeCache(JOURNAL_KEY, entries);
  return true;
}

/**
 * Get journal entries for a specific produce item.
 * Useful for showing purchase history on a produce detail view.
 *
 * @param {string} produceId
 * @returns {Promise<Array>}
 */
export async function getEntriesForProduce(produceId) {
  const entries = await getJournalEntries();
  return entries.filter((e) => e.produceId === produceId);
}

/**
 * Get summary statistics from the journal.
 * Returns counts and streaks useful for the profile display.
 *
 * @returns {Promise<{totalEntries: number, uniqueItems: number, thisMonth: number, topItems: Array<{name: string, emoji: string, count: number}>}>}
 */
export async function getJournalStats() {
  const entries = await getJournalEntries();

  if (entries.length === 0) {
    return { totalEntries: 0, uniqueItems: 0, thisMonth: 0, topItems: [] };
  }

  // Count entries logged this calendar month
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = entries.filter((e) => new Date(e.date) >= thisMonthStart).length;

  // Count unique produce items the user has logged
  const itemCounts = {};
  for (const entry of entries) {
    const key = entry.produceId;
    if (!itemCounts[key]) {
      itemCounts[key] = { name: entry.produceName, emoji: entry.emoji, count: 0 };
    }
    itemCounts[key].count++;
  }

  // Top 5 most-logged items for the profile display
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEntries: entries.length,
    uniqueItems: Object.keys(itemCounts).length,
    thisMonth,
    topItems,
  };
}
