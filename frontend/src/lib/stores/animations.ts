import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AnimationPreferences {
  deleteAnimation: boolean;
}

function createAnimationStore() {
  const getInitialPreferences = (): AnimationPreferences => {
    if (!browser) return { deleteAnimation: true };

    const stored = localStorage.getItem('animationPreferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse animation preferences:', e);
      }
    }

    return { deleteAnimation: true };
  };

  const { subscribe, set, update } = writable<AnimationPreferences>(getInitialPreferences());

  const savePreferences = (prefs: AnimationPreferences) => {
    if (!browser) return;
    localStorage.setItem('animationPreferences', JSON.stringify(prefs));
  };

  return {
    subscribe,
    setDeleteAnimation: (enabled: boolean) => {
      update(prefs => {
        const newPrefs = { ...prefs, deleteAnimation: enabled };
        savePreferences(newPrefs);
        return newPrefs;
      });
    },
    reset: () => {
      const defaults = { deleteAnimation: true };
      savePreferences(defaults);
      set(defaults);
    }
  };
}

export const animationPreferences = createAnimationStore();
