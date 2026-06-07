import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// All user settings, persisted to localStorage. Defaults honor the spec:
// authentic yarrow ON, deliberate pacing ON, journal OFF.
const STORAGE_KEY = 'yijing.settings';

const DEFAULTS = {
  authenticYarrow: true, // CLAUDE.md §4.1 — true 1/16,5/16,7/16,3/16 distribution
  deliberatePacing: true, // CLAUDE.md §4.2 — slow, meditative, skippable
  journalEnabled: false, // CLAUDE.md §7 — off by default, local only
  coinHeadsValue: 3, // conventional heads=3, tails=2 (toggleable; distribution is identical)
  translationId: 'legge',
  showNuclear: false, // advanced disclosure, off by default
};

const SettingsContext = createContext(null);

function load() {
  if (typeof localStorage === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage may be unavailable (private mode); settings simply won't persist */
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      set: (key, val) => setSettings((s) => ({ ...s, [key]: val })),
      toggle: (key) => setSettings((s) => ({ ...s, [key]: !s[key] })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
