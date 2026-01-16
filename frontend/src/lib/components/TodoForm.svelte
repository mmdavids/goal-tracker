<script lang="ts">
  import { CheckSquare, X } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { Goal } from '$lib/api/client';
  import { terminology } from '$lib/stores/terminology';

  // Callback props
  export let onSubmit: ((detail: {
    id?: number;
    title: string;
    description?: string;
    goal_id?: number;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
  }) => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;

  export let show: boolean;
  export let goalId: number | null = null;
  export let goals: Goal[] = [];
  export let isEditing: boolean = false;
  export let editTodoId: number | null = null;
  export let initialTitle: string = '';
  export let initialDescription: string = '';
  export let initialPriority: 'low' | 'medium' | 'high' = 'medium';
  export let initialDueDate: string = '';

  let title = '';
  let description = '';
  let selectedGoalId: number | null = goalId;
  let priority: 'low' | 'medium' | 'high' = 'medium';
  let dueDate = '';

  let titleInput: HTMLInputElement;

  $: if (show) {
    // Reset or populate form when opened
    if (isEditing) {
      title = initialTitle;
      description = initialDescription;
      priority = initialPriority;
      dueDate = initialDueDate;
      selectedGoalId = goalId;
    } else {
      title = '';
      description = '';
      selectedGoalId = goalId;
      priority = 'medium';
      dueDate = '';
    }
  }

  onMount(() => {
    if (show) {
      titleInput?.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }

  function handleCancel() {
    show = false;
    onCancel?.();
  }

  function handleSubmit() {
    if (!title.trim()) return;

    if (isEditing && editTodoId !== null) {
      onSubmit?.({
        id: editTodoId,
        title: title.trim(),
        description: description.trim() || undefined,
        goal_id: selectedGoalId || undefined,
        priority,
        due_date: dueDate || undefined,
      });
    } else {
      onSubmit?.({
        title: title.trim(),
        description: description.trim() || undefined,
        goal_id: selectedGoalId || undefined,
        priority,
        due_date: dueDate || undefined,
      });
    }

    // Reset form
    title = '';
    description = '';
    selectedGoalId = goalId;
    priority = 'medium';
    dueDate = '';
    show = false;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
    <div class="modal-content" role="dialog" aria-labelledby="modal-title">
      <button class="close-button" on:click={handleCancel} aria-label="Close modal">
        <X size={20} />
      </button>

      <div class="modal-icon">
        <CheckSquare size={48} />
      </div>

      <h2 id="modal-title">{isEditing ? 'Edit To-Do' : 'Add To-Do'}</h2>
      <p class="modal-description">{isEditing ? 'Update your task details' : 'Create a new task to track your work'}</p>

      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="todo-title">Title *</label>
          <input
            type="text"
            id="todo-title"
            bind:this={titleInput}
            bind:value={title}
            placeholder="What needs to be done?"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="todo-description">Description (optional)</label>
          <textarea
            id="todo-description"
            bind:value={description}
            placeholder="Add more details..."
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="todo-priority">Priority</label>
            <select id="todo-priority" bind:value={priority} class="form-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="form-group">
            <label for="todo-due-date">Due Date (optional)</label>
            <input
              type="date"
              id="todo-due-date"
              bind:value={dueDate}
              class="form-input"
            />
          </div>
        </div>

        {#if goals.length > 0}
          <div class="form-group">
            <label for="todo-goal">Link to {$terminology.goal.singular} (optional)</label>
            <select id="todo-goal" bind:value={selectedGoalId} class="form-select">
              <option value={null}>No {$terminology.goal.singular.toLowerCase()}</option>
              {#each goals as goal}
                <option value={goal.id}>
                  {goal.goal_type_icon || '🎯'} {goal.title}
                </option>
              {/each}
            </select>
          </div>
        {/if}

        <div class="modal-actions">
          <button type="button" class="btn-secondary" on:click={handleCancel}>
            Cancel
          </button>
          <button type="submit" class="btn-primary" disabled={!title.trim()}>
            {isEditing ? 'Save Changes' : 'Add To-Do'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    position: relative;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .modal-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    background: #dbeafe;
    color: #3b82f6;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
  }

  .modal-description {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .form-input,
  .form-textarea,
  .form-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.2s;
  }

  .form-input:focus,
  .form-textarea:focus,
  .form-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: stretch;
    margin-top: 0.5rem;
  }

  .btn-secondary,
  .btn-primary {
    flex: 1;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Compact Mode */
  :global([data-compact="true"]) .modal-content {
    padding: 1.5rem;
  }

  :global([data-compact="true"]) .modal-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 1rem;
  }

  :global([data-compact="true"]) .modal-icon :global(svg) {
    width: 36px;
    height: 36px;
  }

  :global([data-compact="true"]) h2 {
    margin: 0 0 0.375rem 0;
    font-size: 1.125rem;
  }

  :global([data-compact="true"]) .modal-description {
    margin: 0 0 1rem 0;
    font-size: 0.8125rem;
  }

  :global([data-compact="true"]) form {
    gap: 0.75rem;
  }

  :global([data-compact="true"]) .form-input,
  :global([data-compact="true"]) .form-textarea,
  :global([data-compact="true"]) .form-select {
    padding: 0.625rem;
    font-size: 0.875rem;
  }

  :global([data-compact="true"]) .form-textarea {
    min-height: 60px;
  }

  :global([data-compact="true"]) .modal-actions {
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  :global([data-compact="true"]) .modal-actions button {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
