<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { goalsAPI, progressAPI, imagesAPI, progressUpdateTypesAPI, todosAPI, type Goal, type ProgressUpdate, type ProgressUpdateType, type Todo } from '$lib/api/client';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import ProgressUpdateComponent from '$lib/components/ProgressUpdate.svelte';
  import ImageUpload from '$lib/components/ImageUpload.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import InputModal from '$lib/components/InputModal.svelte';
  import GoalForm from '$lib/components/GoalForm.svelte';
  import TodoForm from '$lib/components/TodoForm.svelte';
  import TodoSidebar from '$lib/components/TodoSidebar.svelte';
  import PadlockAnimation from '$lib/components/PadlockAnimation.svelte';
  import DateHover from '$lib/components/DateHover.svelte';
  import { celebrateProgress } from '$lib/stores/celebrations';
  import { calculateTimeProgress, formatDate, getDayOfMonth } from '$lib/utils/date';
  import { ArrowLeft, Plus, X, Trash2, Pencil, Archive, Save, MessageSquare, ListTodo } from 'lucide-svelte';
  import { terminology } from '$lib/stores/terminology';

  let goal: Goal | null = null;
  let updates: ProgressUpdate[] = [];
  let progressUpdateTypes: ProgressUpdateType[] = [];
  let loading = true;
  let error = '';
  let showUpdateForm = false;
  let showDeleteModal = false;
  let showArchiveModal = false;
  let showQuickWinModal = false;
  let showAddNoteModal = false;
  let showEditGoalModal = false;
  let showPadlockAnimation = false;
  let showTodoForm = false;
  let todos: Todo[] = [];
  let completedTodos: Todo[] = [];
  let loadingTodos = true;

  // Form fields
  let updateTitle = '';
  let updateNotes = '';
  let progressDelta = 10;
  let uploadFiles: File[] = [];
  let isReflection = false;
  let selectedProgressUpdateTypeId: number | null = null;

  const goalId = parseInt($page.params.id);

  $: timeProgress = goal?.target_date ? calculateTimeProgress(goal.created_at, goal.target_date) : null;

  onMount(async () => {
    await Promise.all([
      loadGoalData(),
      loadProgressUpdateTypes(),
      loadTodos()
    ]);
  });

  async function loadTodos() {
    try {
      loadingTodos = true;
      const allTodos = await todosAPI.getAll({ goalId });
      todos = allTodos.filter((todo: Todo) => todo.status !== 'completed');
      completedTodos = allTodos.filter((todo: Todo) => todo.status === 'completed');
    } catch (err) {
      console.error('Failed to load todos:', err);
    } finally {
      loadingTodos = false;
    }
  }

  async function loadProgressUpdateTypes() {
    try {
      progressUpdateTypes = await progressUpdateTypesAPI.getAll();
    } catch (err) {
      console.error('Failed to load progress update types:', err);
    }
  }

  async function loadGoalData() {
    try {
      loading = true;
      [goal, updates] = await Promise.all([
        goalsAPI.getOne(goalId),
        progressAPI.getAll(goalId),
      ]);
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to load ${$terminology.goal.singular.toLowerCase()}`;
    } finally {
      loading = false;
    }
  }

  async function handleAddUpdate() {
    if (!updateTitle.trim()) return;

    try {
      error = '';
      // Create progress update
      const update = await progressAPI.create(goalId, {
        title: updateTitle,
        notes: updateNotes || undefined,
        progress_delta: progressDelta,
        progress_update_type_id: selectedProgressUpdateTypeId || undefined,
      });

      // Upload images if any
      if (uploadFiles.length > 0) {
        await imagesAPI.upload(update.id, uploadFiles);
      }

      // Reload data
      await loadGoalData();

      // Check for celebration
      if (goal) {
        celebrateProgress(goal.progress);
      }

      // Reset form
      showUpdateForm = false;
      updateTitle = '';
      updateNotes = '';
      progressDelta = 10;
      uploadFiles = [];
      isReflection = false;
      selectedProgressUpdateTypeId = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add update';
    }
  }

  function handleQuickWin() {
    showQuickWinModal = true;
  }

  async function confirmQuickWin(title: string) {
    showQuickWinModal = false;

    try {
      error = '';
      await progressAPI.create(goalId, {
        title,
        progress_delta: 10,
      });

      await loadGoalData();

      if (goal) {
        celebrateProgress(goal.progress);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add quick win';
    }
  }

  function handleAddNote() {
    showAddNoteModal = true;
  }

  async function confirmAddNote(title: string) {
    showAddNoteModal = false;

    try {
      error = '';
      await progressAPI.create(goalId, {
        title,
        progress_delta: 0,
      });

      await loadGoalData();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add note';
    }
  }

  function confirmDeleteGoal() {
    showDeleteModal = true;
  }

  async function handleDeleteGoal() {
    if (!goal) return;

    try {
      await goalsAPI.delete(goal.id);
      showDeleteModal = false;
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to delete ${$terminology.goal.singular.toLowerCase()}`;
      showDeleteModal = false;
    }
  }

  async function handleEditGoal(event: CustomEvent) {
    if (!goal) return;

    try {
      error = '';
      await goalsAPI.update(goal.id, event.detail);
      await loadGoalData();
      showEditGoalModal = false;
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to update ${$terminology.goal.singular.toLowerCase()}`;
    }
  }

  function confirmArchiveGoal() {
    showArchiveModal = true;
  }

  async function handleArchiveGoal() {
    if (!goal) return;

    try {
      showArchiveModal = false;

      // Check if we're archiving or unarchiving
      if (goal.status === 'completed') {
        // Unarchive
        await goalsAPI.unarchive(goal.id);
        await loadGoalData();
      } else {
        // Archive with animation
        showPadlockAnimation = true;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to archive/unarchive ${$terminology.goal.singular.toLowerCase()}`;
      showArchiveModal = false;
    }
  }

  async function onPadlockAnimationComplete() {
    if (!goal) return;

    try {
      await goalsAPI.archive(goal.id);
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : `Failed to archive ${$terminology.goal.singular.toLowerCase()}`;
      showPadlockAnimation = false;
    }
  }

  async function handleCreateTodo(detail: { title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) {
    try {
      error = '';
      await todosAPI.create(detail);
      showTodoForm = false;
      await loadTodos();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create todo';
    }
  }

  async function handleToggleTodo(detail: { id: number }) {
    try {
      await todosAPI.toggleComplete(detail.id);
      await loadTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  }

  async function handleEditTodo(detail: { id?: number; title: string; description?: string; goal_id?: number; priority: 'low' | 'medium' | 'high'; due_date?: string }) {
    try {
      if (!detail.id) return;
      await todosAPI.update(detail.id, {
        title: detail.title,
        description: detail.description,
        goal_id: detail.goal_id,
        priority: detail.priority,
        due_date: detail.due_date,
      });
      await loadTodos();
    } catch (err) {
      console.error('Failed to edit todo:', err);
    }
  }

  async function handleDeleteTodo(detail: { id: number }) {
    try {
      await todosAPI.delete(detail.id);
      await loadTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  }

  async function handleConvertTodo(detail: { todo: Todo }) {
    const todo = detail.todo;
    try {
      // Create progress update from todo
      await progressAPI.create(goalId, {
        title: todo.title,
        notes: todo.description,
        progress_delta: 0, // Start with 0, user can adjust
      });

      // Delete the todo
      await todosAPI.delete(todo.id);

      // Reload both lists
      await Promise.all([loadGoalData(), loadTodos()]);

      error = 'Todo converted to progress update';
      setTimeout(() => error = '', 3000);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to convert todo';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showEditGoalModal) {
      showEditGoalModal = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>{goal?.title || $terminology.goal.singular} - {$terminology.appName}</title>
</svelte:head>

{#if loading}
  <div class="loading">Loading...</div>
{:else if error && !goal}
  <div class="error-page">
    <h2>Error</h2>
    <p>{error}</p>
    <a href="/" class="btn-primary">Back to Dashboard</a>
  </div>
{:else if goal}
  <div class="page-wrapper">
    <div class="goal-detail">
    <div class="header">
      <a href="/" class="back-link">
        <ArrowLeft size={20} />
        Back
      </a>
      <div class="header-actions">
        <button class="btn-edit" on:click={() => showEditGoalModal = true} disabled={goal.status === 'completed'}>
          <Pencil size={18} />
          Edit {$terminology.goal.singular}
        </button>
        <button class="btn-archive" on:click={confirmArchiveGoal}>
          <Archive size={18} />
          {goal.status === 'completed' ? 'Unarchive' : 'Archive'}
        </button>
        <button class="delete-goal-btn" on:click={confirmDeleteGoal}>
          <Trash2 size={18} />
          Delete {$terminology.goal.singular}
        </button>
      </div>
    </div>

    <div class="goal-header">
        <div class="goal-title">
          {#if goal.goal_type_icon}
            <span class="icon" style="color: {goal.goal_type_color}">{goal.goal_type_icon}</span>
          {:else}
            <span class="icon">🎯</span>
          {/if}
          <h1>{goal.title}</h1>
        </div>
        <div class="progress-display">
          <span class="progress-number">{goal.progress}%</span>
        </div>
      </div>

      {#if goal.description}
        <p class="description">{goal.description}</p>
      {/if}

      <ProgressBar progress={goal.progress} size="lg" />

      {#if timeProgress !== null}
        <div class="time-progress">
          <div class="time-progress-label">
            <span class="label-text">Time elapsed</span>
            <span class="progress-percent">{timeProgress}%</span>
          </div>
          <div class="time-progress-bar">
            <div class="time-progress-fill" style="width: {timeProgress}%"></div>
            <div class="time-marker-wrapper time-marker-start">
              <DateHover date={goal.created_at}>
                <div class="time-marker" role="button" tabindex="0" aria-label="View start date"></div>
              </DateHover>
            </div>
            {#if goal.target_date}
              <div class="time-marker-wrapper time-marker-end">
                <DateHover date={goal.target_date}>
                  <div class="time-marker" role="button" tabindex="0" aria-label="View target date"></div>
                </DateHover>
              </div>
            {/if}
          </div>
        </div>
      {/if}

    {#if error}
      <div class="error-banner">{error}</div>
    {/if}

    <div class="actions">
      <button class="btn-primary" on:click={() => (showUpdateForm = !showUpdateForm)}>
        {#if showUpdateForm}
          <X size={20} />
          Cancel
        {:else}
          <Plus size={20} />
          Add Update
        {/if}
      </button>
      <button class="btn-secondary" on:click={handleAddNote}>
        <MessageSquare size={20} />
        Add Note
      </button>
      <button class="btn-secondary" on:click={handleQuickWin}>⚡ Quick Win (+10%)</button>
      <button class="btn-secondary" on:click={() => showTodoForm = true}>
        <ListTodo size={20} />
        Add To-Do
      </button>
    </div>

    {#if showUpdateForm}
      <div class="update-form">
        <h3>Add Progress Update</h3>

        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            bind:value={updateTitle}
            placeholder="What did you accomplish?"
          />
        </div>

        <div class="form-group">
          <label for="notes">Notes (optional)</label>
          <textarea
            id="notes"
            bind:value={updateNotes}
            placeholder="Add details about your progress..."
            rows="10"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="typeSelect">Type (optional)</label>
          <select
            id="typeSelect"
            bind:value={selectedProgressUpdateTypeId}
          >
            <option value={null}>No type</option>
            {#each progressUpdateTypes as type}
              <option value={type.id}>
                {type.emoji} {type.name}
              </option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              id="isReflectionNew"
              type="checkbox"
              checked={isReflection}
              on:change={(e) => {
                isReflection = e.currentTarget.checked;
                if (isReflection) {
                  progressDelta = 0;
                }
              }}
            />
            <span>Status reflection/comment (no progress)</span>
          </label>
        </div>

        <div class="form-group">
          <label for="delta">Progress Increase: {progressDelta}%</label>
          <input
            type="range"
            id="delta"
            bind:value={progressDelta}
            on:input={(e) => {
              const val = parseInt(e.currentTarget.value);
              if (val === 0) {
                isReflection = true;
              } else if (isReflection) {
                isReflection = false;
              }
            }}
            min="0"
            max="50"
            step="5"
          />
        </div>

        <div class="form-group">
          <label for="imageUploadNew">Images (optional)</label>
          <ImageUpload bind:files={uploadFiles} />
        </div>

        <button class="btn-primary" on:click={handleAddUpdate} disabled={!updateTitle.trim()}>
          <Save size={20} />
          Save Update
        </button>
      </div>
    {/if}

    <div class="updates-section">
      <h2>Progress Timeline</h2>

      {#if updates.length === 0}
        <div class="empty-updates">
          <p>No updates yet. Add your first progress update above!</p>
        </div>
      {:else}
        <div class="updates-list">
          {#each updates as update, index (update.id)}
            {#if index > 0}
              {@const currentDate = new Date(update.date_achieved || update.created_at)}
              {@const previousDate = new Date(updates[index - 1].date_achieved || updates[index - 1].created_at)}
              {@const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())}
              {@const previousDay = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate())}
              {@const daysDiff = Math.round((previousDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24))}
              {#if daysDiff >= 1}
                <div class="timeline-interstitial">
                  <div class="interstitial-line"></div>
                  <div class="interstitial-text">[{daysDiff} day gap]</div>
                  <div class="interstitial-line"></div>
                </div>
              {/if}
            {/if}
            <div class="timeline-item">
              <DateHover date={update.date_achieved || update.created_at}>
                <div class="timeline-number" class:is-comment={update.progress_delta === 0} class:has-type-emoji={update.progress_update_type_emoji}>
                  <span class="number-text">{getDayOfMonth(update.date_achieved || update.created_at)}</span>
                  {#if update.progress_update_type_emoji}
                    <span class="type-emoji">{update.progress_update_type_emoji}</span>
                  {:else if update.progress_delta === 0}
                    <span class="comment-emoji">💬</span>
                  {:else}
                    <span class="timeline-dot"></span>
                  {/if}
                </div>
              </DateHover>
              <div class="timeline-content">
                <ProgressUpdateComponent {update} onUpdated={loadGoalData} onDeleted={loadGoalData} onMoved={loadGoalData} />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    </div>

    <!-- Collapsible Todo Sidebar -->
    <TodoSidebar
      {todos}
      {completedTodos}
      loading={loadingTodos}
      showConvertButton={true}
      onToggleComplete={handleToggleTodo}
      onEdit={handleEditTodo}
      onDelete={handleDeleteTodo}
      onConvert={handleConvertTodo}
      onCreateNew={() => showTodoForm = true}
    />
  </div>
{/if}

{#if showDeleteModal && goal}
  <ConfirmModal
    title="Delete {$terminology.goal.singular}"
    message='Are you sure you want to delete "{goal.title}"? This will move it to the trash bin where you can restore or permanently delete it.'
    confirmText="Delete {$terminology.goal.singular}"
    cancelText="Cancel"
    onConfirm={handleDeleteGoal}
    onCancel={() => showDeleteModal = false}
  />
{/if}

{#if showArchiveModal && goal}
  <ConfirmModal
    title={goal.status === 'completed' ? `Unarchive ${$terminology.goal.singular}` : `Archive ${$terminology.goal.singular}`}
    message={goal.status === 'completed'
      ? `Are you sure you want to unarchive "${goal.title}"? This will set the ${$terminology.goal.singular.toLowerCase()} back to active status.`
      : `Are you sure you want to mark "${goal.title}" as completed? This will archive the ${$terminology.goal.singular.toLowerCase()} and set its status to completed.`}
    confirmText={goal.status === 'completed' ? `Unarchive ${$terminology.goal.singular}` : `Archive ${$terminology.goal.singular}`}
    cancelText="Cancel"
    onConfirm={handleArchiveGoal}
    onCancel={() => showArchiveModal = false}
  />
{/if}

{#if showPadlockAnimation}
  <PadlockAnimation onComplete={onPadlockAnimationComplete} />
{/if}

{#if showQuickWinModal}
  <InputModal
    title="Quick Win"
    message="What did you accomplish?"
    placeholder="Enter progress update title"
    defaultValue="Quick Win"
    confirmText="Add"
    cancelText="Cancel"
    onConfirm={confirmQuickWin}
    onCancel={() => showQuickWinModal = false}
  />
{/if}

{#if showAddNoteModal}
  <InputModal
    title="Add Note"
    message="What do you want to note?"
    placeholder="Enter note title"
    defaultValue=""
    confirmText="Add"
    cancelText="Cancel"
    onConfirm={confirmAddNote}
    onCancel={() => showAddNoteModal = false}
  />
{/if}

<TodoForm
  bind:show={showTodoForm}
  goalId={goalId}
  goals={[]}
  onSubmit={handleCreateTodo}
  onCancel={() => showTodoForm = false}
/>

{#if showEditGoalModal && goal}
  <div class="modal-backdrop" on:click={(e) => e.target === e.currentTarget && (showEditGoalModal = false)} role="presentation">
    <div class="modal-content edit-goal-modal">
      <button class="modal-close-button" on:click={() => showEditGoalModal = false} aria-label="Close">
        <X size={24} />
      </button>
      <h2 class="modal-title">Edit {$terminology.goal.singular}</h2>
      <GoalForm
        title={goal.title}
        description={goal.description || ''}
        targetDate={goal.target_date ? goal.target_date.split('T')[0] : ''}
        quarter={goal.quarter}
        year={goal.year}
        goalTypeId={goal.goal_type_id}
        isEditing={true}
        submitText="Save Changes"
        onSubmit={handleEditGoal}
      />
    </div>
  </div>
{/if}

<style>
  .loading,
  .error-page {
    text-align: center;
    padding: 3rem;
  }

  .page-wrapper {
    display: flex;
    position: relative;
    width: 100%;
  }

  .goal-detail {
    max-width: 800px;
    margin: 0 auto;
    flex: 1;
    min-width: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--color-primary);
  }

  .delete-goal-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-goal-btn:hover {
    background: var(--color-danger);
    color: white;
  }

  .btn-edit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-edit:hover:not(:disabled) {
    background: var(--color-primary);
    color: white;
  }

  .btn-edit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-archive {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    color: var(--color-success);
    border: 1px solid var(--color-success);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-archive:hover:not(:disabled) {
    background: var(--color-success);
    color: white;
  }

  .btn-archive:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .goal-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon {
    font-size: 3rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .progress-display {
    background: var(--bg-tertiary);
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
  }

  .progress-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .description {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
    white-space: pre-line;
  }

  .time-progress {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  .time-progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .progress-percent {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .time-progress-bar {
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: 999px;
    overflow: visible;
    position: relative;
  }

  .time-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .time-marker-wrapper {
    position: absolute;
    top: 50%;
    z-index: 2;
  }

  .time-marker-wrapper.time-marker-start {
    left: 0;
    transform: translate(-50%, -50%);
  }

  .time-marker-wrapper.time-marker-end {
    right: 0;
    transform: translate(50%, -50%);
  }

  .time-marker {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .time-marker:hover {
    width: 18px;
    height: 18px;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
  }

  .btn-primary,
  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
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

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: var(--border-primary);
  }

  .update-form {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .update-form h3 {
    margin: 0 0 1.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  input[type='text'],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  input[type='text']:focus,
  textarea:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  input[type='range'] {
    width: 100%;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input[type='checkbox'] {
    width: auto;
    cursor: pointer;
  }

  .checkbox-label span {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .updates-section {
    margin-top: 3rem;
  }

  .updates-section h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-updates {
    text-align: center;
    padding: 3rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    color: var(--text-secondary);
  }

  .updates-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .timeline-item {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 1rem;
    position: relative;
    margin-bottom: 1rem;
  }

  .timeline-number {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 1rem;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
  }

  .number-text {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-tertiary);
  }

  .timeline-dot {
    width: 16px;
    height: 16px;
    background: var(--color-primary);
    border: 3px solid var(--bg-secondary);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .comment-emoji {
    font-size: 2rem;
    line-height: 1;
  }

  .type-emoji {
    font-size: 2rem;
    line-height: 1;
  }

  .timeline-content {
    width: 100%;
  }

  .timeline-interstitial {
    display: grid;
    grid-template-columns: 60px auto 1fr;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0;
    padding: 0.5rem 0;
  }

  .interstitial-text {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    font-style: italic;
    white-space: nowrap;
  }

  .interstitial-line {
    height: 1px;
    background: var(--border-primary);
    opacity: 0.5;
  }

  /* Compact Mode */
  :global([data-compact="true"]) .btn-primary,
  :global([data-compact="true"]) .btn-secondary {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  :global([data-compact="true"]) .actions {
    gap: 0.5rem;
    margin: 1.25rem 0;
  }

  :global([data-compact="true"]) .update-form {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  :global([data-compact="true"]) .update-form h3 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  :global([data-compact="true"]) .delete-goal-btn,
  :global([data-compact="true"]) .btn-edit,
  :global([data-compact="true"]) .btn-archive {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  :global([data-compact="true"]) .header {
    margin-bottom: 1.25rem;
  }

  :global([data-compact="true"]) .header-actions {
    gap: 0.5rem;
  }

  :global([data-compact="true"]) .time-progress {
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
  }

  :global([data-compact="true"]) .time-progress-label {
    margin-bottom: 0.375rem;
  }

  :global([data-compact="true"]) .time-progress-bar {
    height: 8px;
  }

  /* Edit Goal Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
  }

  .edit-goal-modal {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 2rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 8px 32px var(--shadow);
  }

  .modal-close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .modal-close-button:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-secondary);
  }

  .modal-title {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    padding-right: 3rem;
  }

  @media (max-width: 640px) {
    .edit-goal-modal {
      padding: 1.5rem;
      max-height: 95vh;
    }

    .modal-title {
      font-size: 1.25rem;
    }
  }
</style>
