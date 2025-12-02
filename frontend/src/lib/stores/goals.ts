import { writable, derived } from 'svelte/store';
import { goalsAPI, type Goal } from '$lib/api/client';

function createGoalsStore() {
  const { subscribe, set, update } = writable<Goal[]>([]);

  return {
    subscribe,
    load: async (status?: string) => {
      const goals = await goalsAPI.getAll(status);
      set(goals);
    },
    add: async (goal: Partial<Goal>) => {
      const newGoal = await goalsAPI.create(goal);
      update((goals) => [newGoal, ...goals]);
      return newGoal;
    },
    update: async (id: number, data: Partial<Goal>) => {
      const updatedGoal = await goalsAPI.update(id, data);
      update((goals) => goals.map((g) => (g.id === id ? updatedGoal : g)));
      return updatedGoal;
    },
    updateProgress: async (id: number, progress: number) => {
      const updatedGoal = await goalsAPI.updateProgress(id, progress);
      update((goals) => goals.map((g) => (g.id === id ? updatedGoal : g)));
      return updatedGoal;
    },
    delete: async (id: number) => {
      await goalsAPI.delete(id);
      update((goals) => goals.filter((g) => g.id !== id));
    },
  };
}

export const goals = createGoalsStore();

export const activeGoals = derived(goals, ($goals) =>
  $goals.filter((g) => g.status === 'active')
);

export const completedGoals = derived(goals, ($goals) =>
  $goals.filter((g) => g.status === 'completed')
);
