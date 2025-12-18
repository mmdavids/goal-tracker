import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Terminology {
  appName: string;
  goal: {
    singular: string;
    plural: string;
  };
}

const defaultTerminology: Terminology = {
  appName: 'Goal Tracker',
  goal: {
    singular: 'Goal',
    plural: 'Goals'
  }
};

function createTerminologyStore() {
  // Load from localStorage if available
  const stored = browser ? localStorage.getItem('terminology') : null;
  const initial = stored ? { ...defaultTerminology, ...JSON.parse(stored) } : defaultTerminology;

  const { subscribe, set, update } = writable<Terminology>(initial);

  return {
    subscribe,
    setGoalTerminology: (singular: string, plural: string) => {
      update(current => {
        const newTerminology = {
          ...current,
          goal: { singular, plural }
        };
        if (browser) {
          localStorage.setItem('terminology', JSON.stringify(newTerminology));
        }
        return newTerminology;
      });
    },
    setAppName: (appName: string) => {
      update(current => {
        const newTerminology = {
          ...current,
          appName
        };
        if (browser) {
          localStorage.setItem('terminology', JSON.stringify(newTerminology));
        }
        return newTerminology;
      });
    },
    reset: () => {
      set(defaultTerminology);
      if (browser) {
        localStorage.removeItem('terminology');
      }
    }
  };
}

export const terminology = createTerminologyStore();
