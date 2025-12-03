<script lang="ts">
  import { onMount } from 'svelte';
  import { goalsAPI, type Goal } from '$lib/api/client';
  import { Trash2, RotateCcw, AlertCircle } from 'lucide-svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import NinjaSliceAnimation from '$lib/components/NinjaSliceAnimation.svelte';
  import { formatDateTime } from '$lib/utils/date';

  let deletedGoals: Goal[] = [];
  let loading = true;
  let error = '';
  let showDeleteModal = false;
  let showNinjaSlice = false;
  let goalToDelete: number | null = null;

  onMount(async () => {
    await loadDeletedGoals();
  });

  async function loadDeletedGoals() {
    try {
      loading = true;
      error = '';
      deletedGoals = await goalsAPI.getDeleted();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load deleted goals';
    } finally {
      loading = false;
    }
  }

  async function handleRestore(id: number) {
    try {
      error = '';
      await goalsAPI.restore(id);
      await loadDeletedGoals();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to restore goal';
    }
  }

  function confirmPermanentDelete(id: number) {
    goalToDelete = id;
    showDeleteModal = true;
  }

  async function handlePermanentDelete() {
    if (goalToDelete === null) return;

    try {
      showDeleteModal = false;
      showNinjaSlice = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete goal';
      showDeleteModal = false;
    }
  }

  async function onNinjaSliceComplete() {
    if (goalToDelete === null) return;

    try {
      await goalsAPI.permanentDelete(goalToDelete);
      goalToDelete = null;
      showNinjaSlice = false;
      await loadDeletedGoals();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete goal';
      showNinjaSlice = false;
    }
  }
</script>

<svelte:head>
  <title>Trash Bin - Goal Tracker</title>
</svelte:head>

<div class="trash-page">
  <div class="header">
    <div class="header-content">
      <Trash2 size={32} />
      <h1>Trash Bin</h1>
    </div>
    <p class="subtitle">Restore or permanently delete your goals</p>
  </div>

  {#if error}
    <div class="error-banner">
      <AlertCircle size={20} />
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="loading">Loading deleted goals...</div>
  {:else if deletedGoals.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <Trash2 size={64} />
      </div>
      <h2>Trash bin is empty</h2>
      <p>Deleted goals will appear here. You can restore or permanently delete them.</p>
    </div>
  {:else}
    <div class="goals-list">
      {#each deletedGoals as goal (goal.id)}
        <div class="goal-item">
          <div class="goal-content">
            <h3>{goal.title}</h3>
            {#if goal.description}
              <p class="description">{goal.description}</p>
            {/if}
            <div class="goal-meta">
              <span class="meta-item">Progress: {goal.progress}%</span>
              {#if goal.quarter || goal.year}
                <span class="meta-item">
                  {#if goal.quarter && goal.year}
                    {goal.quarter} {goal.year}
                  {:else if goal.quarter}
                    {goal.quarter}
                  {:else if goal.year}
                    {goal.year}
                  {/if}
                </span>
              {/if}
              <span class="meta-item" title={new Date(goal.updated_at).toLocaleString()}>Deleted: {formatDateTime(goal.updated_at)}</span>
            </div>
          </div>
          <div class="goal-actions">
            <button
              class="btn-restore"
              on:click={() => handleRestore(goal.id)}
              aria-label="Restore goal"
            >
              <RotateCcw size={18} />
              Restore
            </button>
            <button
              class="btn-delete"
              on:click={() => confirmPermanentDelete(goal.id)}
              aria-label="Permanently delete goal"
            >
              <Trash2 size={18} />
              Delete Forever
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showDeleteModal}
  <ConfirmModal
    title="Permanently Delete Goal"
    message="This will permanently delete this goal and all its progress updates and images. This action cannot be undone."
    confirmText="Delete Forever"
    cancelText="Cancel"
    onConfirm={handlePermanentDelete}
    onCancel={() => { showDeleteModal = false; goalToDelete = null; }}
  />
{/if}

{#if showNinjaSlice}
  <NinjaSliceAnimation onComplete={onNinjaSliceComplete} />
{/if}

<style>
  .trash-page {
    max-width: 900px;
    margin: 0 auto;
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
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  .goals-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .goal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .goal-content {
    flex: 1;
    min-width: 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .description {
    margin: 0 0 0.75rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-line;
  }

  .goal-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .meta-item {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }

  .goal-actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-restore {
    background: #dbeafe;
    color: #1e40af;
  }

  .btn-restore:hover {
    background: #bfdbfe;
  }

  .btn-delete {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn-delete:hover {
    background: #fecaca;
  }

  @media (max-width: 768px) {
    .goal-item {
      flex-direction: column;
      align-items: stretch;
    }

    .goal-actions {
      justify-content: stretch;
    }

    .goal-actions button {
      flex: 1;
    }
  }
</style>
