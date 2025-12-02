<script lang="ts">
  import { onMount } from 'svelte';
  import { goalTypesAPI, type GoalType } from '$lib/api/client';
  import { Plus, Trash2, Edit2, X, Calendar } from 'lucide-svelte';

  let goalTypes: GoalType[] = [];
  let loading = true;
  let error = '';
  let showForm = false;

  // Fiscal year settings - store the start month of the fiscal year (Q1)
  let fiscalYearStartMonth = 9;  // September by default

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Form fields
  let editingId: number | null = null;
  let formName = '';
  let formDescription = '';
  let formColor = '#3b82f6';
  let formIcon = '🎯';

  const icons = ['🎯', '💼', '🌱', '❤️', '📚', '💰', '🚀', '🏆', '⚡', '🎨', '🔥', '💪'];
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4'];

  onMount(async () => {
    await loadGoalTypes();
    loadQuarterSettings();
  });

  function loadQuarterSettings() {
    const saved = localStorage.getItem('fiscalYearStart');
    if (saved) {
      try {
        fiscalYearStartMonth = parseInt(saved, 10);
      } catch (e) {
        console.error('Failed to load fiscal year settings:', e);
      }
    }
  }

  function saveQuarterSettings() {
    localStorage.setItem('fiscalYearStart', fiscalYearStartMonth.toString());
    error = '';
  }

  async function loadGoalTypes() {
    try {
      loading = true;
      goalTypes = await goalTypesAPI.getAll();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load goal types';
    } finally {
      loading = false;
    }
  }

  function openForm(goalType?: GoalType) {
    if (goalType) {
      editingId = goalType.id;
      formName = goalType.name;
      formDescription = goalType.description || '';
      formColor = goalType.color;
      formIcon = goalType.icon;
    } else {
      editingId = null;
      formName = '';
      formDescription = '';
      formColor = '#3b82f6';
      formIcon = '🎯';
    }
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  async function handleSubmit() {
    try {
      error = '';
      if (editingId) {
        await goalTypesAPI.update(editingId, {
          name: formName,
          description: formDescription || undefined,
          color: formColor,
          icon: formIcon,
        });
      } else {
        await goalTypesAPI.create({
          name: formName,
          description: formDescription || undefined,
          color: formColor,
          icon: formIcon,
        });
      }
      await loadGoalTypes();
      closeForm();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save goal type';
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this goal type?')) {
      return;
    }

    try {
      error = '';
      await goalTypesAPI.delete(id);
      await loadGoalTypes();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete goal type';
    }
  }
</script>

<svelte:head>
  <title>Settings - Goal Tracker</title>
</svelte:head>

<div class="settings-page">
  <div class="header">
    <h1>Settings</h1>
    <a href="/" class="back-link">Back to Dashboard</a>
  </div>

  <section class="settings-section">
    <div class="section-header">
      <h2>Goal Types</h2>
      <button class="btn-primary" on:click={() => openForm()}>
        <Plus size={20} />
        New Type
      </button>
    </div>

    {#if error}
      <div class="error-banner">{error}</div>
    {/if}

    {#if loading}
      <div class="loading">Loading...</div>
    {:else if goalTypes.length === 0}
      <div class="empty-state">
        <p>No custom goal types yet. Create one to get started!</p>
      </div>
    {:else}
      <div class="types-list">
        {#each goalTypes as type}
          <div class="type-card">
            <div class="type-info">
              <div class="type-icon-display" style="background-color: {type.color}20">
                <span class="icon">{type.icon}</span>
              </div>
              <div class="type-details">
                <h3>{type.name}</h3>
                {#if type.description}
                  <p>{type.description}</p>
                {/if}
                <span class="usage">{type.goal_count || 0} goals</span>
              </div>
            </div>
            <div class="type-actions">
              <button class="icon-btn" on:click={() => openForm(type)} title="Edit">
                <Edit2 size={18} />
              </button>
              <button
                class="icon-btn danger"
                on:click={() => handleDelete(type.id)}
                title="Delete"
                disabled={type.goal_count && type.goal_count > 0}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="settings-section">
    <div class="section-header">
      <div class="header-with-icon">
        <Calendar size={24} />
        <h2>Fiscal Year Configuration</h2>
      </div>
    </div>

    <p class="section-description">
      Configure when your fiscal year starts (Q1). All quarters will be calculated automatically (Q2 = Q1+3 months, Q3 = Q1+6 months, Q4 = Q1+9 months).
    </p>

    <div class="quarter-settings">
      <div class="quarter-setting">
        <label for="fiscal-start">Fiscal Year Starts:</label>
        <select id="fiscal-start" bind:value={fiscalYearStartMonth}>
          {#each months as month}
            <option value={month.value}>{month.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="section-actions">
      <button class="btn-primary" on:click={saveQuarterSettings}>
        Save Fiscal Year Settings
      </button>
    </div>
  </section>
</div>

{#if showForm}
  <div class="modal-overlay" on:click={closeForm}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{editingId ? 'Edit' : 'New'} Goal Type</h2>
        <button class="close-btn" on:click={closeForm}>
          <X size={24} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="modal-form">
        <div class="form-group">
          <label for="icon">Icon</label>
          <div class="icon-picker">
            {#each icons as i}
              <button
                type="button"
                class="icon-option"
                class:selected={formIcon === i}
                on:click={() => (formIcon = i)}
              >
                {i}
              </button>
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label for="color">Color</label>
          <div class="color-picker">
            {#each colors as c}
              <button
                type="button"
                class="color-option"
                class:selected={formColor === c}
                style="background-color: {c}"
                on:click={() => (formColor = c)}
              />
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label for="name">Name *</label>
          <input type="text" id="name" bind:value={formName} placeholder="e.g., Career" required />
        </div>

        <div class="form-group">
          <label for="description">Description (optional)</label>
          <textarea
            id="description"
            bind:value={formDescription}
            placeholder="Brief description of this goal type..."
            rows="2"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeForm}>Cancel</button>
          <button type="submit" class="btn-primary" disabled={!formName.trim()}>Save</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .settings-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }

  .back-link {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
  }

  .back-link:hover {
    color: #3b82f6;
  }

  .settings-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
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

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .types-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .type-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .type-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .type-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .type-icon-display {
    width: 3rem;
    height: 3rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .type-icon-display .icon {
    font-size: 1.5rem;
  }

  .type-details h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .type-details p {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .usage {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .type-actions {
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    padding: 0.5rem;
    background: #f3f4f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;
  }

  .icon-btn:hover:not(:disabled) {
    background: #e5e7eb;
    color: #1f2937;
  }

  .icon-btn.danger {
    color: #ef4444;
  }

  .icon-btn.danger:hover:not(:disabled) {
    background: #fee2e2;
  }

  .icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .close-btn {
    padding: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
  }

  .close-btn:hover {
    color: #1f2937;
  }

  .modal-form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
  }

  .icon-picker,
  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .icon-option {
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .icon-option:hover {
    border-color: #3b82f6;
  }

  .icon-option.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .color-option {
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.selected {
    border-color: #1f2937;
    box-shadow: 0 0 0 2px white, 0 0 0 4px currentColor;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  /* Quarter Settings */
  .header-with-icon {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #1f2937;
  }

  .section-description {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.6;
  }

  .quarter-settings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .quarter-setting {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quarter-setting label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .quarter-setting select {
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: inherit;
    background: white;
    cursor: pointer;
  }

  .quarter-setting select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .section-actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
