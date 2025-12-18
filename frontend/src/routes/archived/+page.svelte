<script lang="ts">
  import { onMount } from 'svelte';
  import { goalsAPI, type Goal } from '$lib/api/client';
  import GoalCard from '$lib/components/GoalCard.svelte';
  import { Archive } from 'lucide-svelte';
  import { terminology } from '$lib/stores/terminology';

  let archivedGoals: Goal[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadArchivedGoals();
  });

  async function loadArchivedGoals() {
    try {
      loading = true;
      error = '';
      archivedGoals = await goalsAPI.getAll('completed');
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to load archived ${$terminology.goal.plural.toLowerCase()}`;
    } finally {
      loading = false;
    }
  }

  async function handleGoalAction() {
    await loadArchivedGoals();
  }
</script>

<svelte:head>
  <title>Archived {$terminology.goal.plural} - {$terminology.appName}</title>
</svelte:head>

<div class="archived-page">
  <div class="header">
    <div class="header-content">
      <Archive size={32} />
      <h1>Archived {$terminology.goal.plural}</h1>
    </div>
    <p class="subtitle">View your completed {$terminology.goal.plural.toLowerCase()}</p>
  </div>

  {#if error}
    <div class="error-banner">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="loading">Loading archived {$terminology.goal.plural.toLowerCase()}...</div>
  {:else if archivedGoals.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <Archive size={64} />
      </div>
      <h2>No archived {$terminology.goal.plural.toLowerCase()}</h2>
      <p>{$terminology.goal.plural} you mark as completed will appear here.</p>
    </div>
  {:else}
    <div class="goals-grid">
      {#each archivedGoals as goal (goal.id)}
        <GoalCard {goal} on:deleted={handleGoalAction} on:updated={handleGoalAction} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .archived-page {
    max-width: 100%;
  }

  .header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
  }

  .empty-icon {
    color: var(--text-tertiary);
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-state p {
    margin: 0;
    color: var(--text-secondary);
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .goals-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
