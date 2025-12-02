<script lang="ts">
  import type { Goal } from '$lib/api/client';
  import { goalsAPI } from '$lib/api/client';
  import ProgressBar from './ProgressBar.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import NinjaSliceAnimation from './NinjaSliceAnimation.svelte';
  import { timeAgo } from '$lib/utils/date';
  import { Trash2 } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let goal: Goal;

  const dispatch = createEventDispatcher();
  let showDeleteModal = false;
  let showNinjaSlice = false;

  function confirmDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    showDeleteModal = true;
  }

  async function deleteGoal() {
    try {
      showDeleteModal = false;
      showNinjaSlice = true;
      // Wait for animation to complete before actually deleting
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
      showDeleteModal = false;
    }
  }

  async function onNinjaSliceComplete() {
    try {
      await goalsAPI.delete(goal.id);
      dispatch('deleted');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  }

  function cancelDelete() {
    showDeleteModal = false;
  }
</script>

<a href="/goal/{goal.id}" class="goal-card">
  <button class="delete-btn" on:click={confirmDelete} aria-label="Delete goal">
    <Trash2 size={16} />
  </button>

  <div class="goal-header">
    <div class="goal-title">
      <h3>{goal.title}</h3>
    </div>
    <span class="progress-badge">{goal.progress}%</span>
  </div>

  {#if goal.goal_type_name}
    <div class="goal-type-badge" style="background-color: {goal.goal_type_color}20; color: {goal.goal_type_color}">
      <span class="type-icon">{goal.goal_type_icon}</span>
      <span>{goal.goal_type_name}</span>
    </div>
  {/if}

  {#if goal.description}
    <p class="description">{goal.description}</p>
  {/if}

  <ProgressBar progress={goal.progress} size="md" />

  <div class="goal-footer">
    <div class="meta">
      <span>📝 {goal.update_count} updates</span>
      <span>🖼️ {goal.image_count} images</span>
      {#if goal.quarter || goal.year}
        <span class="quarter-year">
          {#if goal.quarter && goal.year}
            📅 {goal.quarter} {goal.year}
          {:else if goal.quarter}
            📅 {goal.quarter}
          {:else if goal.year}
            📅 {goal.year}
          {/if}
        </span>
      {/if}
    </div>
    <span class="time">{timeAgo(goal.updated_at)}</span>
  </div>

  {#if goal.tags && goal.tags.length > 0}
    <div class="tags">
      {#each goal.tags as tag}
        <span class="tag" style="background-color: {tag.color}20; color: {tag.color}">
          {tag.name}
        </span>
      {/each}
    </div>
  {/if}
</a>

{#if showDeleteModal}
  <ConfirmModal
    title="Delete Goal"
    message='Are you sure you want to delete "{goal.title}"? This will delete all progress updates and images. This action cannot be undone.'
    confirmText="Delete Goal"
    cancelText="Cancel"
    onConfirm={deleteGoal}
    onCancel={cancelDelete}
  />
{/if}

{#if showNinjaSlice}
  <NinjaSliceAnimation onComplete={onNinjaSliceComplete} />
{/if}

<style>
  .goal-card {
    display: block;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  .goal-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .goal-title {
    flex: 1;
  }

  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }

  .progress-badge {
    background: #f3f4f6;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .goal-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .type-icon {
    font-size: 1rem;
  }

  .description {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .goal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .meta {
    display: flex;
    gap: 1rem;
  }

  .time {
    color: #9ca3af;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .delete-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.375rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0;
    z-index: 10;
  }

  .goal-card:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: #fee2e2;
    color: #dc2626;
  }
</style>
