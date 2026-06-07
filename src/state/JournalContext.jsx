import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSettings } from './SettingsContext.jsx';

// The journal is OFF by default and lives only in localStorage; it is never
// transmitted. Nothing is persisted while the toggle is off (CLAUDE.md §7).
const STORAGE_KEY = 'yijing.journal';

const JournalContext = createContext(null);

function load() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function JournalProvider({ children }) {
  const { settings } = useSettings();
  const [entries, setEntries] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore storage failures */
    }
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      enabled: settings.journalEnabled,
      // Save a reading object (schema.md). No-op unless journaling is enabled.
      save(reading) {
        if (!settings.journalEnabled) return null;
        const entry = { id: makeId(), timestamp: new Date().toISOString(), ...reading };
        setEntries((list) => [entry, ...list]);
        return entry;
      },
      remove(id) {
        setEntries((list) => list.filter((e) => e.id !== id));
      },
      clearAll() {
        setEntries([]);
      },
      // Export the whole journal as a JSON string the user can save.
      exportJSON() {
        return JSON.stringify(entries, null, 2);
      },
    }),
    [entries, settings.journalEnabled],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within JournalProvider');
  return ctx;
}
