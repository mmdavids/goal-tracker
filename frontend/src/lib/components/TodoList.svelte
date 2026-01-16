<script lang="ts">
  import { Check, X, Edit2, Trash2, ArrowLeft, Search, ChevronDown } from 'lucide-svelte';
  import type { Todo } from '$lib/api/client';
  import TodoForm from './TodoForm.svelte';

  export let todos: Todo[] = [];
  export let showConvertButton = false;

  // Callback props
  export let onToggleComplete: ((detail: { id: number }) => void) | undefined = undefined;
  export let onEdit: ((detail: { id?: number; title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) => void) | undefined = undefined;
  export let onDelete: ((detail: { id: number }) => void) | undefined = undefined;
  export let onConvert: ((detail: { todo: Todo }) => void) | undefined = undefined;

  let searchQuery = '';
  let sortBy: 'created' | 'updated' | 'due' = 'due';
  let sortOrder: 'asc' | 'desc' = 'asc';
  let showEditModal = false;
  let editingTodo: Todo | null = null;

  $: filteredAndSortedTodos = filterAndSortTodos(todos, searchQuery, sortBy, sortOrder);

  // Clean up when modal closes
  $: if (!showEditModal) {
    editingTodo = null;
  }

  function filterAndSortTodos(
    todoList: Todo[],
    query: string,
    sort: 'created' | 'updated' | 'due',
    order: 'asc' | 'desc'
  ): Todo[] {
    // Filter
    let filtered = todoList;
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = todoList.filter(
        (todo) =>
          todo.title.toLowerCase().includes(lowerQuery) ||
          todo.description?.toLowerCase().includes(lowerQuery) ||
          todo.goal_title?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'due':
          const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  function toggleSort(newSortBy: typeof sortBy) {
    if (sortBy === newSortBy) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = newSortBy;
      sortOrder = newSortBy === 'due' ? 'asc' : 'desc';
    }
  }

  function handleToggleComplete(todo: Todo) {
    onToggleComplete?.({ id: todo.id });
  }

  function startEdit(todo: Todo) {
    editingTodo = todo;
    showEditModal = true;
  }

  function cancelEdit() {
    showEditModal = false;
    editingTodo = null;
  }

  function handleEditSubmit(detail: { id?: number; title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) {
    onEdit?.(detail);
    // TodoForm handles closing the modal via show binding
  }

  function handleDelete(todo: Todo) {
    onDelete?.({ id: todo.id });
  }

  function handleConvert(todo: Todo) {
    onConvert?.({ todo });
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'var(--color-danger)';
      case 'medium':
        return 'var(--color-warning)';
      case 'low':
        return 'var(--text-tertiary)';
      default:
        return 'var(--text-secondary)';
    }
  }

  function getPriorityLabel(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showEditModal) {
      cancelEdit();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="todo-list-container">
  <div class="todo-controls">
    <div class="search-bar">
      <Search size={18} />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search todos..."
        class="search-input"
      />
      {#if searchQuery}
        <button class="clear-search" on:click={() => (searchQuery = '')}>
          <X size={16} />
        </button>
      {/if}
    </div>

    <div class="sort-controls">
      <span class="sort-label">Sort by:</span>
      <button
        class="sort-btn"
        class:active={sortBy === 'created'}
        on:click={() => toggleSort('created')}
      >
        Created
        {#if sortBy === 'created'}
          <span class:rotated={sortOrder === 'asc'}>
            <ChevronDown size={14} />
          </span>
        {/if}
      </button>
      <button
        class="sort-btn"
        class:active={sortBy === 'updated'}
        on:click={() => toggleSort('updated')}
      >
        Updated
        {#if sortBy === 'updated'}
          <span class:rotated={sortOrder === 'asc'}>
            <ChevronDown size={14} />
          </span>
        {/if}
      </button>
      <button
        class="sort-btn"
        class:active={sortBy === 'due'}
        on:click={() => toggleSort('due')}
      >
        Due Date
        {#if sortBy === 'due'}
          <span class:rotated={sortOrder === 'asc'}>
            <ChevronDown size={14} />
          </span>
        {/if}
      </button>
    </div>
  </div>

  {#if filteredAndSortedTodos.length === 0}
    <div class="empty-state">
      {#if searchQuery}
        <p>No todos match your search.</p>
      {:else}
        <p>No todos yet.</p>
      {/if}
    </div>
  {:else}
    <div class="todos-list">
      {#each filteredAndSortedTodos as todo (todo.id)}
        <div class="todo-item" class:completed={todo.status === 'completed'}>
          <div class="todo-content">
              <button
                class="complete-checkbox"
                class:checked={todo.status === 'completed'}
                on:click={() => handleToggleComplete(todo)}
                aria-label={todo.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
              >
                {#if todo.status === 'completed'}
                  <Check size={16} />
                {/if}
              </button>

              <div class="todo-main">
                <div class="todo-header">
                  <h4 class="todo-title">{todo.title}</h4>
                  <span
                    class="todo-priority"
                    style="color: {getPriorityColor(todo.priority)}"
                  >
                    {getPriorityLabel(todo.priority)}
                  </span>
                </div>

                {#if todo.description && todo.status !== 'completed'}
                  <p class="todo-description">{todo.description}</p>
                {/if}

                <div class="todo-meta">
                  {#if todo.goal_title}
                    <span class="todo-goal">
                      {todo.goal_icon || '🎯'} {todo.goal_title}
                    </span>
                  {/if}
                  {#if todo.due_date}
                    <span class="todo-due-date">
                      Due: {formatDate(todo.due_date)}
                    </span>
                  {/if}
                  <span class="todo-date">
                    Created: {formatDate(todo.created_at)}
                  </span>
                </div>
              </div>

              <div class="todo-actions">
                {#if showConvertButton}
                  <button
                    class="icon-btn icon-btn-primary"
                    on:click={() => handleConvert(todo)}
                    title="Convert to progress update"
                  >
                    <ArrowLeft size={16} />
                  </button>
                {/if}
                <button
                  class="icon-btn icon-btn-secondary"
                  on:click={() => startEdit(todo)}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  class="icon-btn icon-btn-danger"
                  on:click={() => handleDelete(todo)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showEditModal && editingTodo}
  <TodoForm
    bind:show={showEditModal}
    goalId={editingTodo.goal_id}
    goals={[]}
    isEditing={true}
    editTodoId={editingTodo.id}
    initialTitle={editingTodo.title}
    initialDescription={editingTodo.description || ''}
    initialPriority={editingTodo.priority}
    initialDueDate={editingTodo.due_date || ''}
    onSubmit={handleEditSubmit}
    onCancel={cancelEdit}
  />
{/if}

<style>
  .todo-list-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .todo-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-primary);
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    color: var(--text-tertiary);
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 0.875rem;
    outline: none;
  }

  .clear-search {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .clear-search:hover {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .sort-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.625rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .sort-btn:hover {
    background: var(--bg-tertiary);
    border-color: var(--color-primary);
    color: var(--text-primary);
  }

  .sort-btn.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .sort-btn .rotated {
    display: inline-flex;
    transform: rotate(180deg);
  }

  .empty-state {
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  .todos-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .todo-item {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
  }

  .todo-item:hover {
    border-color: var(--border-secondary);
    box-shadow: 0 2px 4px var(--shadow);
  }

  .todo-item.completed {
    opacity: 0.7;
  }

  .todo-item.completed .todo-title {
    text-decoration: line-through;
    color: var(--text-tertiary);
  }

  .todo-content {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .complete-checkbox {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-secondary);
    border-radius: 4px;
    background: var(--bg-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s;
    margin-top: 0.125rem;
  }

  .complete-checkbox:hover {
    border-color: var(--color-primary);
  }

  .complete-checkbox.checked {
    background: var(--color-success);
    border-color: var(--color-success);
  }

  .todo-main {
    flex: 1;
    min-width: 0;
  }

  .todo-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .todo-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
    word-break: break-word;
  }

  .todo-priority {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .todo-description {
    margin: 0.5rem 0 0 0;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.5;
    word-break: break-word;
  }

  .todo-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .todo-goal {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background: var(--bg-secondary);
    border-radius: 4px;
    font-weight: 500;
  }

  .todo-due-date {
    font-weight: 500;
    color: var(--color-warning);
  }

  .todo-actions {
    display: flex;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    padding: 0;
  }

  .icon-btn:hover {
    background: var(--bg-tertiary);
  }

  .icon-btn-primary {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .icon-btn-primary:hover {
    background: var(--color-primary);
    color: white;
  }

  .icon-btn-secondary {
    color: var(--text-secondary);
  }

  .icon-btn-secondary:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .icon-btn-danger {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .icon-btn-danger:hover {
    background: var(--color-danger);
    color: white;
  }

  .icon-btn-success {
    color: var(--color-success);
    border-color: var(--color-success);
  }

  .icon-btn-success:hover {
    background: var(--color-success);
    color: white;
  }

  /* Compact Mode */
  :global([data-compact="true"]) .todo-controls {
    padding: 0.75rem;
  }

  :global([data-compact="true"]) .search-bar {
    padding: 0.5rem 0.625rem;
  }

  :global([data-compact="true"]) .search-input {
    font-size: 0.8125rem;
  }

  :global([data-compact="true"]) .sort-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }

  :global([data-compact="true"]) .todo-item {
    padding: 0.75rem;
  }

  :global([data-compact="true"]) .todo-title {
    font-size: 0.875rem;
  }

  :global([data-compact="true"]) .todo-description {
    font-size: 0.75rem;
  }

  :global([data-compact="true"]) .todo-meta {
    font-size: 0.6875rem;
    gap: 0.5rem;
  }

  :global([data-compact="true"]) .icon-btn {
    width: 28px;
    height: 28px;
  }

  :global([data-compact="true"]) .todos-list {
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    .sort-controls {
      flex-direction: column;
      align-items: flex-start;
    }

    .todo-actions {
      flex-direction: column;
    }
  }
</style>
