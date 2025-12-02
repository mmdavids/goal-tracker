import { writable } from 'svelte/store';

export interface Celebration {
  type: '25' | '50' | '75' | '100';
  emoji: string;
  message: string;
}

export const celebration = writable<Celebration | null>(null);

export function celebrateProgress(progress: number) {
  let type: Celebration['type'] | null = null;
  let emoji = '';
  let message = '';

  if (progress >= 100) {
    type = '100';
    emoji = '🏆';
    message = 'Goal crushed!';
  } else if (progress >= 75) {
    type = '75';
    emoji = '⭐';
    message = 'Almost there!';
  } else if (progress >= 50) {
    type = '50';
    emoji = '🔥';
    message = 'Halfway there!';
  } else if (progress >= 25) {
    type = '25';
    emoji = '🎉';
    message = 'Great start!';
  }

  if (type) {
    celebration.set({ type, emoji, message });
    setTimeout(() => celebration.set(null), 3000);
  }
}
