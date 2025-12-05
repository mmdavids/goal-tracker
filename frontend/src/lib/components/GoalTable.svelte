<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Goal } from '$lib/api/client';
  import { FileText, Image } from 'lucide-svelte';

  export let goals: Goal[] = [];
  export let selectedGoalIds: Set<number> = new Set();

  const dispatch = createEventDispatcher();

  function toggleGoalSelection(goalId: number) {
    dispatch('toggle-selection', goalId);
  }

  function getProgressClass(progress: number): string {
    if (progress >= 100) return 'completed';
    if (progress >= 75) return 'high';
    if (progress >= 50) return 'medium';
    if (progress >= 25) return 'low';
    return 'minimal';
  }
</script>

<div class="table-container">
  <table class="goal-table">
    <thead>
      <tr>
        <th class="checkbox-col"></th>
        <th class="title-col">Title</th>
        <th class="progress-col">Progress</th>
        <th class="type-col">Type</th>
        <th class="updates-col">Updates</th>
        <th class="images-col">Images</th>
        <th class="quarter-col">Quarter</th>
      </tr>
    </thead>
    <tbody>
      {#each goals as goal (goal.id)}
        <tr class="goal-row">
          <td class="checkbox-col">
            <input
              type="checkbox"
              checked={selectedGoalIds.has(goal.id)}
              on:change={() => toggleGoalSelection(goal.id)}
            />
          </td>
          <td class="title-col">
            <a href="/goal/{goal.id}" class="goal-title-link">
              {goal.title}
            </a>
          </td>
          <td class="progress-col">
            <div class="progress-cell">
              <div class="progress-bar-mini">
                <div
                  class="progress-fill {getProgressClass(goal.progress)}"
                  style="width: {Math.min(goal.progress, 100)}%"
                ></div>
              </div>
              <span class="progress-text {getProgressClass(goal.progress)}">
                {#if goal.progress > 100}
                  🔥 {goal.progress}%
                {:else if goal.progress === 100}
                  ✨ {goal.progress}%
                {:else}
                  {goal.progress}%
                {/if}
              </span>
            </div>
          </td>
          <td class="type-col">
            {#if goal.goal_type_name}
              <span
                class="type-badge"
                style="background: {goal.goal_type_color}20; color: {goal.goal_type_color}; border-color: {goal.goal_type_color}40"
              >
                <span class="type-icon">{goal.goal_type_icon}</span>
                {goal.goal_type_name}
              </span>
            {:else}
              <span class="no-type">—</span>
            {/if}
          </td>
          <td class="updates-col">
            <span class="count-badge">
              <FileText size={14} />
              {goal.update_count}
            </span>
          </td>
          <td class="images-col">
            <span class="count-badge">
              <Image size={14} />
              {goal.image_count}
            </span>
          </td>
          <td class="quarter-col">
            {#if goal.quarter}
              <span class="quarter-badge">
                Q{goal.quarter} {goal.year}
              </span>
            {:else}
              <span class="no-quarter">—</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    width: 100%;
    overflow-x: auto;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0 1px 3px var(--shadow);
  }

  .goal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead {
    background: var(--bg-secondary);
    border-bottom: 2px solid var(--border-primary);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .checkbox-col {
    width: 40px;
    text-align: center;
  }

  .title-col {
    min-width: 250px;
  }

  .progress-col {
    width: 200px;
  }

  .type-col {
    width: 150px;
  }

  .updates-col,
  .images-col {
    width: 100px;
    text-align: center;
  }

  .quarter-col {
    width: 120px;
  }

  tbody tr {
    border-bottom: 1px solid var(--border-primary);
    transition: background 0.2s;
  }

  tbody tr:hover {
    background: var(--bg-secondary);
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 1rem 0.75rem;
    color: var(--text-primary);
  }

  .goal-title-link {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .goal-title-link:hover {
    color: var(--color-primary);
  }

  .progress-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-bar-mini {
    flex: 1;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .progress-fill.minimal {
    background: linear-gradient(90deg, #94a3b8, #cbd5e1);
  }

  .progress-fill.low {
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
  }

  .progress-fill.medium {
    background: linear-gradient(90deg, #f59e0b, #d97706);
  }

  .progress-fill.high {
    background: linear-gradient(90deg, #a855f7, #9333ea);
  }

  .progress-fill.completed {
    background: linear-gradient(90deg, #10b981, #059669);
  }

  .progress-text {
    font-weight: 600;
    min-width: 60px;
    text-align: right;
    font-size: 0.875rem;
  }

  .progress-text.completed {
    color: #10b981;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid;
    white-space: nowrap;
  }

  .type-icon {
    font-size: 1rem;
  }

  .no-type,
  .no-quarter {
    color: var(--text-tertiary);
    font-style: italic;
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 6px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .quarter-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 6px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  @media (max-width: 1200px) {
    .goal-table {
      font-size: 0.85rem;
    }

    th,
    td {
      padding: 0.75rem 0.5rem;
    }

    .title-col {
      min-width: 200px;
    }

    .progress-col {
      width: 150px;
    }
  }
</style>
