import { useState } from 'react';

// small per-phone preferences; the workouts themselves live in IndexedDB
export interface Settings {
  rpg: boolean;
}

const DEFAULTS: Settings = { rpg: true };

export function readSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('settings') ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(readSettings);
  const update = (changes: Partial<Settings>) => {
    const next = { ...settings, ...changes };
    setSettings(next);
    try {
      localStorage.setItem('settings', JSON.stringify(next));
    } catch {
      // private mode: it works until the page closes
    }
  };
  return [settings, update] as const;
}
