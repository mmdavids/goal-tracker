<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { goalsAPI, progressAPI, imagesAPI, type Goal, type ProgressUpdate } from '$lib/api/client';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import ProgressUpdateComponent from '$lib/components/ProgressUpdate.svelte';
  import ImageUpload from '$lib/components/ImageUpload.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import InputModal from '$lib/components/InputModal.svelte';
  import GoalForm from '$lib/components/GoalForm.svelte';
  import PadlockAnimation from '$lib/components/PadlockAnimation.svelte';
  import { celebrateProgress } from '$lib/stores/celebrations';
  import { ArrowLeft, Plus, X, Trash2, Pencil, Archive, Save } from 'lucide-svelte';

  let goal: Goal | null = null;
  let updates: ProgressUpdate[] = [];
  let loading = true;
  let error = '';
  let showUpdateForm = false;
  let showDeleteModal = false;
  let showArchiveModal = false;
  let showQuickWinModal = false;
  let isEditingGoal = false;
  let showPadlockAnimation = false;

  // Form fields
  let updateTitle = '';
  let updateNotes = '';
  let progressDelta = 10;
  let uploadFiles: File[] = [];
  let isReflection = false;

  const goalId = parseInt($page.params.id);

  onMount(async () => {
    await loadGoalData();
  });

  async function loadGoalData() {
    try {
      loading = true;
      [goal, updates] = await Promise.all([
        goalsAPI.getOne(goalId),
        progressAPI.getAll(goalId),
      ]);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load goal';
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
      error = err instanceof Error ? err.message : 'Failed to delete goal';
      showDeleteModal = false;
    }
  }

  async function handleEditGoal(event: CustomEvent) {
    if (!goal) return;

    try {
      error = '';
      await goalsAPI.update(goal.id, event.detail);
      await loadGoalData();
      isEditingGoal = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update goal';
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
      error = err instanceof Error ? err.message : 'Failed to archive/unarchive goal';
      showArchiveModal = false;
    }
  }

  async function onPadlockAnimationComplete() {
    if (!goal) return;

    try {
      await goalsAPI.archive(goal.id);
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to archive goal';
      showPadlockAnimation = false;
    }
  }
</script>

<svelte:head>
  <title>{goal?.title || 'Goal'} - Goal Tracker</title>
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
  <div class="goal-detail">
    <div class="header">
      <a href="/" class="back-link">
        <ArrowLeft size={20} />
        Back
      </a>
      <div class="header-actions">
        {#if isEditingGoal}
          <button class="btn-secondary" on:click={() => isEditingGoal = false}>
            <X size={18} />
            Cancel Edit
          </button>
        {:else}
          <button class="btn-edit" on:click={() => isEditingGoal = true} disabled={goal.status === 'completed'}>
            <Pencil size={18} />
            Edit Goal
          </button>
          <button class="btn-archive" on:click={confirmArchiveGoal}>
            <Archive size={18} />
            {goal.status === 'completed' ? 'Unarchive' : 'Archive'}
          </button>
          <button class="delete-goal-btn" on:click={confirmDeleteGoal}>
            <Trash2 size={18} />
            Delete Goal
          </button>
        {/if}
      </div>
    </div>

    {#if isEditingGoal}
      <div class="edit-goal-form">
        <h2>Edit Goal</h2>
        <GoalForm
          title={goal.title}
          description={goal.description || ''}
          targetDate={goal.target_date ? goal.target_date.split('T')[0] : ''}
          quarter={goal.quarter}
          year={goal.year}
          goalTypeId={goal.goal_type_id}
          isEditing={true}
          submitText="Save Changes"
          on:submit={handleEditGoal}
        />
      </div>
    {:else}
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
      <button class="btn-secondary" on:click={handleQuickWin}>⚡ Quick Win (+10%)</button>
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
            rows="3"
          />
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
          <label>Images (optional)</label>
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
                  <div class="interstitial-text">[{daysDiff} {daysDiff === 1 ? 'day' : 'days'} later]</div>
                  <div class="interstitial-line"></div>
                </div>
              {/if}
            {/if}
            <div class="timeline-item">
              <div class="timeline-number" class:is-comment={update.progress_delta === 0}>
                <span class="number-text">{updates.length - index}</span>
                {#if update.progress_delta === 0}
                  <span class="comment-emoji">💬</span>
                {:else}
                  <span class="timeline-dot"></span>
                {/if}
              </div>
              <div class="timeline-content">
                <ProgressUpdateComponent {update} on:updated={loadGoalData} on:deleted={loadGoalData} on:moved={loadGoalData} />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if showDeleteModal && goal}
  <ConfirmModal
    title="Delete Goal"
    message='Are you sure you want to delete "{goal.title}"? This will move it to the trash bin where you can restore or permanently delete it.'
    confirmText="Delete Goal"
    cancelText="Cancel"
    onConfirm={handleDeleteGoal}
    onCancel={() => showDeleteModal = false}
  />
{/if}

{#if showArchiveModal && goal}
  <ConfirmModal
    title={goal.status === 'completed' ? 'Unarchive Goal' : 'Archive Goal'}
    message={goal.status === 'completed'
      ? `Are you sure you want to unarchive "${goal.title}"? This will set the goal back to active status.`
      : `Are you sure you want to mark "${goal.title}" as completed? This will archive the goal and set its status to completed.`}
    confirmText={goal.status === 'completed' ? 'Unarchive Goal' : 'Archive Goal'}
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

<style>
  .loading,
  .error-page {
    text-align: center;
    padding: 3rem;
  }

  .goal-detail {
    max-width: 800px;
    margin: 0 auto;
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

  .edit-goal-form {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .edit-goal-form h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
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
</style>
