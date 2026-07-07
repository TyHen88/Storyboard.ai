import type { StoryData } from './types';
import { validateStoryData } from './storage';

/**
 * Multi-project ("conversation") history persisted to localStorage. Each entry
 * is one generated storyboard; the app keeps the most recent MAX_ENTRIES,
 * most-recent-first. Superset of the single-project storage in lib/storage.ts.
 */

const HISTORY_KEY = 'sb-history-v1';
const MAX_ENTRIES = 30;

export interface HistoryEntry {
  id: string;
  title: string;
  savedAt: string;
  storyData: StoryData;
  seeds: Record<number, number>;
}

/** Stable unique id for a conversation. */
export function newProjectId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

const isEntry = (e: any): e is HistoryEntry =>
  !!e && typeof e === 'object' && typeof e.id === 'string' && validateStoryData(e.storyData);

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).map((e) => ({
      id: e.id,
      title: typeof e.title === 'string' && e.title ? e.title : e.storyData.title,
      savedAt: typeof e.savedAt === 'string' ? e.savedAt : '',
      storyData: e.storyData,
      seeds: e.seeds && typeof e.seeds === 'object' ? e.seeds : {},
    }));
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // quota exceeded or storage unavailable — nothing we can do
  }
}

/** Insert-or-update an entry, moving it to the front. Returns the new list. */
export function saveEntry(entry: HistoryEntry): HistoryEntry[] {
  const rest = loadHistory().filter((e) => e.id !== entry.id);
  const next = [entry, ...rest].slice(0, MAX_ENTRIES);
  writeHistory(next);
  return next;
}

/** Remove an entry by id. Returns the new list. */
export function deleteEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  writeHistory(next);
  return next;
}
