<script lang="ts">
  import type { ProgressUpdate, Goal } from '$lib/api/client';
  import { imagesAPI, progressAPI, goalsAPI } from '$lib/api/client';
  import { formatDateTime, toDateTimeLocalString } from '$lib/utils/date';
  import ImageModal from './ImageModal.svelte';
  import ImageUpload from './ImageUpload.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import NinjaSliceAnimation from './NinjaSliceAnimation.svelte';
  import { Pencil, Check, X, Trash2, ImagePlus, Save, MessageCircle } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { animationPreferences } from '$lib/stores/animations';

  export let update: ProgressUpdate;

  const dispatch = createEventDispatcher();

  let isEditing = false;
  let editTitle = update.title;
  let editNotes = update.notes || '';
  let editProgressDelta = update.progress_delta;
  // Use date_achieved if available, otherwise fall back to created_at
  // Convert UTC to local time for datetime-local input
  let editDateAchieved = toDateTimeLocalString(update.date_achieved || update.created_at);
  let newImages: File[] = [];
  let isReflection = update.progress_delta === 0;
  let selectedImage: { url: string; caption: string | null } | null = null;
  let isSaving = false;
  let showDeleteUpdateModal = false;
  let showDeleteImageModal = false;
  let showNinjaSlice = false;
  let showImageUpload = false;
  let ninjaSliceAction: 'image' | 'update' | null = null;
  let imageToDelete: number | null = null;
  let fileInput: HTMLInputElement;
  let availableGoals: Goal[] = [];
  let selectedGoalId = update.goal_id;

  function openImage(filename: string, caption: string | null) {
    selectedImage = {
      url: imagesAPI.getUrl(filename, false),
      caption
    };
  }

  function closeModal() {
    selectedImage = null;
  }

  async function startEditing() {
    isEditing = true;
    editTitle = update.title;
    editNotes = update.notes || '';
    editProgressDelta = update.progress_delta;
    editDateAchieved = toDateTimeLocalString(update.date_achieved || update.created_at);
    selectedGoalId = update.goal_id;
    newImages = [];
    isReflection = update.progress_delta === 0;

    // Load available goals
    try {
      availableGoals = await goalsAPI.getAll('active');
    } catch (error) {
      console.error('Failed to load goals:', error);
      availableGoals = [];
    }
  }

  function cancelEditing() {
    isEditing = false;
    newImages = [];
  }

  async function saveUpdate() {
    if (!editTitle.trim()) return;

    isSaving = true;
    try {
      // Convert datetime-local format to ISO string
      const isoDateTime = new Date(editDateAchieved).toISOString();

      // Update the progress update
      const updated = await progressAPI.update(update.id, {
        title: editTitle,
        notes: editNotes || undefined,
        progress_delta: editProgressDelta,
        date_achieved: isoDateTime
      });

      // Upload new images if any
      if (newImages.length > 0) {
        await imagesAPI.upload(update.id, newImages);
      }

      // Move to different goal if changed
      if (selectedGoalId !== update.goal_id) {
        await progressAPI.move(update.id, selectedGoalId);
        // If moved to a different goal, we should notify that it was moved
        dispatch('moved', { newGoalId: selectedGoalId });
      }

      // Dispatch event to refresh the update
      dispatch('updated');
      isEditing = false;
    } catch (error) {
      console.error('Failed to save update:', error);
      alert('Failed to save changes');
    } finally {
      isSaving = false;
    }
  }

  function confirmDeleteImage(imageId: number) {
    imageToDelete = imageId;
    showDeleteImageModal = true;
  }

  async function deleteImage() {
    if (imageToDelete === null) return;

    try {
      showDeleteImageModal = false;
      ninjaSliceAction = 'image';

      if ($animationPreferences.deleteAnimation) {
        showNinjaSlice = true;
      } else {
        await onNinjaSliceComplete();
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  }

  function confirmDeleteUpdate() {
    showDeleteUpdateModal = true;
  }

  async function deleteUpdate() {
    try {
      showDeleteUpdateModal = false;
      ninjaSliceAction = 'update';

      if ($animationPreferences.deleteAnimation) {
        showNinjaSlice = true;
      } else {
        await onNinjaSliceComplete();
      }
    } catch (error) {
      console.error('Failed to delete update:', error);
      alert('Failed to delete update');
      showDeleteUpdateModal = false;
    }
  }

  async function onNinjaSliceComplete() {
    try {
      if (ninjaSliceAction === 'image' && imageToDelete !== null) {
        await imagesAPI.delete(imageToDelete);
        dispatch('updated');
        imageToDelete = null;
      } else if (ninjaSliceAction === 'update') {
        await progressAPI.delete(update.id);
        dispatch('deleted');
      }
      ninjaSliceAction = null;
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  }

  function triggerImageUpload() {
    fileInput?.click();
  }

  async function handleQuickImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    try {
      isSaving = true;
      await imagesAPI.upload(update.id, Array.from(files));
      dispatch('updated');
      target.value = ''; // Reset file input
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="progress-update" class:status-update={update.progress_delta === 0}>
  {#if isEditing}
    <!-- Edit Mode -->
    <div class="edit-form">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          type="text"
          bind:value={editTitle}
          placeholder="Update title"
        />
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          bind:value={editNotes}
          placeholder="Add notes..."
          rows="7"
        />
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input
            id="isReflection"
            type="checkbox"
            checked={isReflection}
            on:change={(e) => {
              isReflection = e.currentTarget.checked;
              if (isReflection) {
                editProgressDelta = 0;
              }
            }}
          />
          <span>Status reflection/comment (no progress)</span>
        </label>
      </div>

      <div class="form-group">
        <label for="delta">Progress Change (%)</label>
        <input
          id="delta"
          type="number"
          bind:value={editProgressDelta}
          on:input={(e) => {
            const val = parseInt(e.currentTarget.value);
            if (val === 0) {
              isReflection = true;
            } else if (isReflection) {
              isReflection = false;
            }
          }}
          min="0"
        />
      </div>

      <div class="form-group">
        <label for="datetime">Date Achieved</label>
        <input
          id="datetime"
          type="datetime-local"
          bind:value={editDateAchieved}
        />
      </div>

      <div class="form-group">
        <label for="goalSelect">Move to Goal</label>
        <select
          id="goalSelect"
          bind:value={selectedGoalId}
          class="goal-select"
        >
          {#each availableGoals as goal (goal.id)}
            <option value={goal.id}>
              {goal.title}
              {#if goal.id === update.goal_id}(Current){/if}
            </option>
          {/each}
        </select>
        {#if selectedGoalId !== update.goal_id}
          <p class="move-warning">This progress update will be moved to the selected goal when you save.</p>
        {/if}
      </div>

      {#if update.images && update.images.length > 0}
        <div class="existing-images">
          <h5>Existing Images</h5>
          <div class="images">
            {#each update.images as image}
              <div class="image-container">
                <img src={imagesAPI.getUrl(image.filename, true)} alt={image.caption || 'Evidence'} />
                <button
                  type="button"
                  class="delete-image-btn"
                  on:click={() => confirmDeleteImage(image.id)}
                  aria-label="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="form-group">
        <label>Add More Images</label>
        <ImageUpload bind:files={newImages} />
      </div>

      <div class="edit-actions">
        <button type="button" class="btn-secondary" on:click={cancelEditing} disabled={isSaving}>
          <X size={18} />
          Cancel
        </button>
        <button type="button" class="btn-primary" on:click={saveUpdate} disabled={isSaving || !editTitle.trim()}>
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  {:else}
    <!-- View Mode -->
    <div class="update-header">
      <div class="title-container">
        {#if update.progress_delta === 0}
          <MessageCircle size={16} class="status-icon" />
        {/if}
        <h4>{update.title}</h4>
      </div>
      <div class="header-actions">
        {#if update.progress_delta > 0}
          <span class="delta">+{update.progress_delta}%</span>
        {/if}
        <button class="icon-btn upload-btn" on:click={triggerImageUpload} aria-label="Add images" disabled={isSaving}>
          <ImagePlus size={16} />
        </button>
        <button class="icon-btn" on:click={startEditing} aria-label="Edit update">
          <Pencil size={16} />
        </button>
        <button class="icon-btn delete-btn" on:click={confirmDeleteUpdate} aria-label="Delete update">
          <Trash2 size={16} />
        </button>
      </div>
    </div>

    <!-- Hidden file input for quick image upload -->
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleQuickImageUpload}
      accept="image/*"
      multiple
      style="display: none;"
    />

    {#if update.notes}
      <p class="notes">{update.notes}</p>
    {/if}

    {#if update.images && update.images.length > 0}
      <div class="images">
        {#each update.images as image}
          <div class="image-container">
            <button
              class="image-button"
              on:click={() => openImage(image.filename, image.caption || null)}
              aria-label="View full size image"
            >
              <img src={imagesAPI.getUrl(image.filename, true)} alt={image.caption || 'Evidence'} />
            </button>
            {#if image.caption}
              <p class="caption">{image.caption}</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div class="update-footer">
      <span class="time" title={new Date(update.date_achieved || update.created_at).toLocaleString()}>{formatDateTime(update.date_achieved || update.created_at)}</span>
    </div>
  {/if}
</div>

{#if selectedImage}
  <ImageModal
    imageUrl={selectedImage.url}
    caption={selectedImage.caption}
    onClose={closeModal}
  />
{/if}

{#if showDeleteUpdateModal}
  <ConfirmModal
    title="Delete Progress Update"
    message="Are you sure you want to delete this progress update? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={deleteUpdate}
    onCancel={() => showDeleteUpdateModal = false}
  />
{/if}

{#if showDeleteImageModal}
  <ConfirmModal
    title="Delete Image"
    message="Are you sure you want to delete this image? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={deleteImage}
    onCancel={() => { showDeleteImageModal = false; imageToDelete = null; }}
  />
{/if}

{#if showNinjaSlice}
  <NinjaSliceAnimation onComplete={onNinjaSliceComplete} />
{/if}

<style>
  .progress-update {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .progress-update.status-update {
    background: var(--bg-secondary);
    border: 1px dashed var(--border-secondary);
    opacity: 0.85;
  }

  .update-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .title-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title-container :global(.status-icon) {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .status-update h4 {
    font-weight: 500;
    font-style: italic;
  }

  .delta {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .notes {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0 0 0.75rem 0;
    line-height: 1.6;
    white-space: pre-line;
  }

  .images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    margin: 0.75rem 0;
  }

  .image-container {
    position: relative;
  }

  .image-button {
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;
    display: block;
    width: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
  }

  .image-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);
    transition: background 0.2s;
    pointer-events: none;
  }

  .image-button:hover::after {
    background: rgba(0, 0, 0, 0.1);
  }

  .image-container img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    display: block;
    transition: transform 0.2s;
  }

  .image-button:hover img {
    transform: scale(1.05);
  }

  .caption {
    margin: 0.25rem 0 0 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .update-footer {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bg-tertiary);
  }

  .time {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }

  /* Edit Mode Styles */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.625rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .goal-select {
    width: 100%;
    cursor: pointer;
  }

  .move-warning {
    margin: 0.5rem 0 0 0;
    font-size: 0.813rem;
    color: #f59e0b;
    font-weight: 500;
  }

  .existing-images h5 {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  .delete-image-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 9999px;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .delete-image-btn:hover {
    background: rgba(220, 38, 38, 1);
  }

  .edit-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.375rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: var(--bg-tertiary);
    color: #3b82f6;
  }

  .icon-btn.upload-btn {
    opacity: 0;
    transition: all 0.2s;
  }

  .progress-update:hover .icon-btn.upload-btn {
    opacity: 1;
  }

  .icon-btn.upload-btn:hover {
    background: #dbeafe;
    color: #2563eb;
  }

  .icon-btn.upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-btn.delete-btn:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.625rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    border: none;
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
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-secondary);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-secondary);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
    user-select: none;
    padding: 0;
  }

  .checkbox-label input[type='checkbox'] {
    width: auto;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  .checkbox-label span {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
</style>
