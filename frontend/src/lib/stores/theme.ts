import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
  // Initialize from localStorage or system preference
  const getInitialTheme = (): Theme => {
    if (!browser) return 'light';

    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  };

  const { subscribe, set } = writable<Theme>(getInitialTheme());

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (!browser) return;

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Apply initial theme
  if (browser) {
    applyTheme(getInitialTheme());
  }

  return {
    subscribe,
    toggle: () => {
      const current = browser ? localStorage.getItem('theme') as Theme : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      set(next);
    },
    set: (theme: Theme) => {
      applyTheme(theme);
      set(theme);
    }
  };
}

export const theme = createThemeStore();
