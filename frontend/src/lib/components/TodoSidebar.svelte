<script lang="ts">
  import TodoList from './TodoList.svelte';
  import type { Todo } from '$lib/api/client';

  export let todos: Todo[] = [];
  export let completedTodos: Todo[] = [];
  export let loading: boolean = false;
  export let showConvertButton: boolean = false;

  // Callback props for events
  export let onToggleComplete: ((detail: { id: number }) => void) | undefined = undefined;
  export let onEdit: ((detail: { id?: number; title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) => void) | undefined = undefined;
  export let onDelete: ((detail: { id: number }) => void) | undefined = undefined;
  export let onConvert: ((detail: { todo: Todo }) => void) | undefined = undefined;
  export let onCreateNew: (() => void) | undefined = undefined;

  function handleToggleComplete(detail: { id: number }) {
    onToggleComplete?.(detail);
  }

  function handleEdit(detail: { id?: number; title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) {
    onEdit?.(detail);
  }

  function handleDelete(detail: { id: number }) {
    onDelete?.(detail);
  }

  function handleConvert(detail: { todo: Todo }) {
    onConvert?.(detail);
  }
</script>

<aside class="todos-sidebar">
  <div class="todos-sidebar-tab">
    <div class="tab-arrow">←</div>
    <div class="tab-content">
      <span class="tab-label">To-Dos</span>
      <span class="tab-count">{todos.length}</span>
    </div>
  </div>
  <div class="todos-sidebar-content">
    <div class="todos-sidebar-header">
      <h3>To-Dos</h3>
      <div class="header-actions">
        <span class="todo-count">{todos.length}</span>
        <button class="add-todo-btn" on:click={() => onCreateNew?.()} aria-label="Add new to-do">
          +
        </button>
      </div>
    </div>
    {#if !loading}
      <TodoList
        {todos}
        {showConvertButton}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConvert={handleConvert}
      />

      {#if completedTodos.length > 0}
        <div class="completed-todos-section">
          <h4 class="completed-header">Completed ({completedTodos.length})</h4>
          <TodoList
            todos={completedTodos}
            {showConvertButton}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
          />
        </div>
      {/if}
    {:else}
      <div class="loading-todos">Loading...</div>
    {/if}
  </div>
</aside>

<style>
  /* Collapsible Todos Sidebar */
  .todos-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background: var(--bg-primary);
    border-left: 2px solid var(--border-primary);
    transform: translateX(calc(100% - 50px));
    transition: transform 0.3s ease;
    z-index: 100;
    overflow: hidden;
  }

  .todos-sidebar:hover {
    transform: translateX(0);
    box-shadow: -4px 0 12px var(--shadow);
  }

  .todos-sidebar-tab {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    background: var(--color-primary);
    border-radius: 8px 0 0 8px;
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .tab-arrow {
    font-size: 1.5rem;
    color: white;
    font-weight: bold;
    animation: pulse-arrow 2s ease-in-out infinite;
  }

  @keyframes pulse-arrow {
    0%, 100% {
      transform: translateX(0);
      opacity: 1;
    }
    50% {
      transform: translateX(-4px);
      opacity: 0.7;
    }
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .tab-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: white;
    font-weight: 700;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
  }

  .tab-count {
    background: white;
    color: var(--color-primary);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .todos-sidebar-content {
    margin-left: 50px;
    height: 100%;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .todos-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-primary);
  }

  .todos-sidebar-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .todo-count {
    background: var(--color-primary);
    color: white;
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .add-todo-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    line-height: 1;
  }

  .add-todo-btn:hover {
    background: #2563eb;
    transform: scale(1.1);
  }

  .add-todo-btn:active {
    transform: scale(0.95);
  }

  .loading-todos {
    padding: 2rem;
    text-align: center;
    color: var(--text-secondary);
  }

  .completed-todos-section {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid var(--border-primary);
  }

  .completed-header {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 1200px) {
    .todos-sidebar {
      width: 320px;
    }
  }

  @media (max-width: 768px) {
    .todos-sidebar {
      display: none;
    }
  }

  /* Compact Mode */
  :global([data-compact="true"]) .todos-sidebar-content {
    padding: 1rem;
  }

  :global([data-compact="true"]) .todos-sidebar-header h3 {
    font-size: 1.125rem;
  }
</style>
