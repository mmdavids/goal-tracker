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
  import { celebrateProgress } from '$lib/stores/celebrations';
  import { ArrowLeft, Plus, X, Trash2, Pencil, Archive } from 'lucide-svelte';

  let goal: Goal | null = null;
  let updates: ProgressUpdate[] = [];
  let loading = true;
  let error = '';
  let showUpdateForm = false;
  let showDeleteModal = false;
  let showArchiveModal = false;
  let showQuickWinModal = false;
  let isEditingGoal = false;

  // Form fields
  let updateTitle = '';
  let updateNotes = '';
  let progressDelta = 10;
  let uploadFiles: File[] = [];

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
      await goalsAPI.archive(goal.id);
      showArchiveModal = false;
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to archive goal';
      showArchiveModal = false;
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
          <button class="btn-archive" on:click={confirmArchiveGoal} disabled={goal.status === 'completed'}>
            <Archive size={18} />
            {goal.status === 'completed' ? 'Archived' : 'Archive'}
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
          <label for="delta">Progress Increase: {progressDelta}%</label>
          <input type="range" id="delta" bind:value={progressDelta} min="0" max="50" step="5" />
        </div>

        <div class="form-group">
          <label>Images (optional)</label>
          <ImageUpload bind:files={uploadFiles} />
        </div>

        <button class="btn-primary" on:click={handleAddUpdate} disabled={!updateTitle.trim()}>
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
          {#each updates as update (update.id)}
            <ProgressUpdateComponent {update} on:updated={loadGoalData} on:deleted={loadGoalData} />
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
    title="Archive Goal"
    message='Are you sure you want to mark "{goal.title}" as completed? This will archive the goal and set its status to completed.'
    confirmText="Archive Goal"
    cancelText="Cancel"
    onConfirm={handleArchiveGoal}
    onCancel={() => showArchiveModal = false}
  />
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
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #3b82f6;
  }

  .delete-goal-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    color: #dc2626;
    border: 1px solid #dc2626;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .delete-goal-btn:hover {
    background: #dc2626;
    color: white;
  }

  .btn-edit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-edit:hover:not(:disabled) {
    background: #3b82f6;
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
    color: #059669;
    border: 1px solid #059669;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-archive:hover:not(:disabled) {
    background: #059669;
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
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: #f9fafb;
  }

  .edit-goal-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .edit-goal-form h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
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
    color: #1f2937;
  }

  .progress-display {
    background: #f3f4f6;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
  }

  .progress-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .description {
    color: #6b7280;
    font-size: 1.125rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
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
    background: #3b82f6;
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
    background: #f3f4f6;
    color: #1f2937;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .update-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .update-form h3 {
    margin: 0 0 1.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  input[type='text'],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
  }

  input[type='range'] {
    width: 100%;
  }

  .updates-section {
    margin-top: 3rem;
  }

  .updates-section h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .empty-updates {
    text-align: center;
    padding: 3rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #6b7280;
  }

  .updates-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
