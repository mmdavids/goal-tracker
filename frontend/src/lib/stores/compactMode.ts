import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createCompactModeStore() {
  // Initialize from localStorage, default to false
  const getInitialMode = (): boolean => {
    if (!browser) return false;

    const stored = localStorage.getItem('compactMode');
    if (stored !== null) {
      return stored === 'true';
    }

    return false;
  };

  const { subscribe, set } = writable<boolean>(getInitialMode());

  // Apply compact mode to document
  const applyCompactMode = (enabled: boolean) => {
    if (!browser) return;

    if (enabled) {
      document.documentElement.setAttribute('data-compact', 'true');
    } else {
      document.documentElement.removeAttribute('data-compact');
    }
    localStorage.setItem('compactMode', enabled.toString());
  };

  // Apply initial mode
  if (browser) {
    applyCompactMode(getInitialMode());
  }

  return {
    subscribe,
    toggle: () => {
      const current = browser ? localStorage.getItem('compactMode') === 'true' : false;
      const next = !current;
      applyCompactMode(next);
      set(next);
    },
    set: (enabled: boolean) => {
      applyCompactMode(enabled);
      set(enabled);
    }
  };
}

export const compactMode = createCompactModeStore();
