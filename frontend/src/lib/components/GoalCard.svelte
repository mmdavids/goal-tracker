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
    <span
      class="progress-badge"
      class:completed={goal.progress >= 100}
      class:over-completed={goal.progress > 100}
      style="--progress: {Math.min(goal.progress, 100)}"
    >
      <span class="progress-text">
        {#if goal.progress > 100}
          🔥 {goal.progress}%
        {:else if goal.progress === 100}
          ✨ {goal.progress}%
        {:else}
          {goal.progress}%
        {/if}
      </span>
    </span>
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
      <span>📝 {goal.update_count} {goal.update_count === 1 ? 'update' : 'updates'}</span>
      <span>🖼️ {goal.image_count} {goal.image_count === 1 ? 'image' : 'images'}</span>
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
    <span class="time" title={new Date(goal.updated_at).toLocaleString()}>{timeAgo(goal.updated_at)}</span>
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
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    position: relative;
    min-height: 100%;
  }

  .goal-card:hover {
    box-shadow: 0 4px 12px var(--shadow);
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
    color: var(--text-primary);
  }

  .progress-badge {
    position: relative;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    background: #475569;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    min-width: 80px;
    text-align: center;
  }

  .progress-badge::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: calc(var(--progress, 0) * 1%);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    z-index: 0;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    animation: shimmer 3s infinite;
    z-index: 2;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    50%, 100% {
      transform: translateX(200%);
    }
  }

  .progress-text {
    position: relative;
    z-index: 3;
  }

  .progress-badge.completed {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.4);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .progress-badge.completed::after {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 2px 12px rgba(16, 185, 129, 0.4);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.6);
      transform: scale(1.05);
    }
  }

  .progress-badge.over-completed {
    background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
    box-shadow: 0 2px 12px rgba(245, 158, 11, 0.5);
    animation: pulse-fire 1.5s ease-in-out infinite;
  }

  .progress-badge.over-completed::after {
    width: 100%;
    background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
  }

  @keyframes pulse-fire {
    0%, 100% {
      box-shadow: 0 2px 12px rgba(245, 158, 11, 0.5);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 4px 24px rgba(220, 38, 38, 0.6);
      transform: scale(1.08);
    }
  }

  .goal-card:hover .progress-badge {
    transform: translateY(-2px);
  }

  .goal-card:hover .progress-badge.completed {
    animation: pulse-glow 1s ease-in-out infinite;
  }

  .goal-card:hover .progress-badge.over-completed {
    animation: pulse-fire 1s ease-in-out infinite;
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
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
    line-height: 1.5;
    white-space: pre-line;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    overflow: hidden;
  }

  .goal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 0.75rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
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
