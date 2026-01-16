import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface DisplayPreferences {
  showQuarterCards: boolean;
}

function createDisplayPreferencesStore() {
  const getInitialPreferences = (): DisplayPreferences => {
    if (!browser) return { showQuarterCards: true };

    const stored = localStorage.getItem('displayPreferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse display preferences:', e);
      }
    }

    return { showQuarterCards: true };
  };

  const { subscribe, set, update } = writable<DisplayPreferences>(getInitialPreferences());

  const savePreferences = (prefs: DisplayPreferences) => {
    if (!browser) return;
    localStorage.setItem('displayPreferences', JSON.stringify(prefs));
  };

  return {
    subscribe,
    setShowQuarterCards: (enabled: boolean) => {
      update(prefs => {
        const newPrefs = { ...prefs, showQuarterCards: enabled };
        savePreferences(newPrefs);
        return newPrefs;
      });
    },
    reset: () => {
      const defaults = { showQuarterCards: true };
      savePreferences(defaults);
      set(defaults);
    }
  };
}

export const displayPreferences = createDisplayPreferencesStore();
