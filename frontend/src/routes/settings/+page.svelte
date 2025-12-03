<script lang="ts">
  import { onMount } from 'svelte';
  import { goalTypesAPI, configAPI, type GoalType } from '$lib/api/client';
  import { Plus, Trash2, Edit2, X, Calendar, Database, FolderOpen, Wrench, Save } from 'lucide-svelte';
  import PathBrowser from '$lib/components/PathBrowser.svelte';

  let goalTypes: GoalType[] = [];
  let loading = true;
  let error = '';
  let showForm = false;

  // Fiscal year settings - store the start month of the fiscal year (Q1)
  let fiscalYearStartMonth = 9;  // September by default

  // Database settings
  let currentDatabasePath = '';
  let configuredDatabasePath = '';
  let defaultDatabasePath = '';
  let databasePathInput = '';
  let databaseMessage = '';
  let showPathBrowser = false;

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
    await loadDatabasePath();
  });

  async function loadDatabasePath() {
    try {
      const result = await configAPI.getDatabasePath();
      currentDatabasePath = result.current;
      configuredDatabasePath = result.configured;
      defaultDatabasePath = result.default;
      databasePathInput = result.configured || '';
    } catch (err) {
      console.error('Failed to load database path:', err);
    }
  }

  async function saveDatabasePath() {
    try {
      databaseMessage = '';
      error = '';
      const result = await configAPI.updateDatabasePath(databasePathInput);
      databaseMessage = result.message;
      await loadDatabasePath();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update database path';
    }
  }

  function useDefaultPath() {
    databasePathInput = '';
  }

  function openPathBrowser() {
    showPathBrowser = true;
  }

  function handlePathSelect(path: string) {
    databasePathInput = path;
    showPathBrowser = false;
  }

  function handlePathBrowserCancel() {
    showPathBrowser = false;
  }

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
        <Save size={18} />
        Save Fiscal Year Settings
      </button>
    </div>
  </section>

  <section class="settings-section">
    <div class="section-header">
      <div class="header-with-icon">
        <Database size={24} />
        <h2>Database Configuration</h2>
      </div>
    </div>

    <p class="section-description">
      Configure where your goal tracker database is stored. Leave empty to use the default location in your home directory.
    </p>

    <div class="database-info">
      <div class="info-item">
        <strong>Currently Using:</strong>
        <code>{currentDatabasePath || 'Loading...'}</code>
      </div>
      <div class="info-item">
        <strong>Default Location:</strong>
        <code>{defaultDatabasePath || 'Loading...'}</code>
      </div>
    </div>

    <div class="database-path-input">
      <label for="database-path">Custom Database Path (optional):</label>
      <div class="path-input-row">
        <input
          type="text"
          id="database-path"
          bind:value={databasePathInput}
          placeholder="Leave empty for default location"
        />
        <button class="btn-browse" on:click={openPathBrowser}>
          <FolderOpen size={18} />
          Browse
        </button>
      </div>
      <button class="btn-default-path" on:click={useDefaultPath}>
        <Wrench size={16} />
        Use Default Location
      </button>
    </div>

    {#if databaseMessage}
      <div class="info-banner">
        {databaseMessage}
      </div>
    {/if}

    <div class="section-actions">
      <button class="btn-primary" on:click={saveDatabasePath}>
        <Save size={18} />
        Save Database Path
      </button>
    </div>
  </section>
</div>

{#if showPathBrowser}
  <PathBrowser
    onSelect={handlePathSelect}
    onCancel={handlePathBrowserCancel}
    initialPath={databasePathInput || currentDatabasePath}
    selectMode="file"
  />
{/if}

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
          <button type="submit" class="btn-primary" disabled={!formName.trim()}>
            <Save size={18} />
            Save
          </button>
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
    color: var(--text-primary);
  }

  .back-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
  }

  .back-link:hover {
    color: var(--color-primary);
  }

  .settings-section {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
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
    color: var(--text-primary);
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
    color: var(--text-secondary);
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
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .type-card:hover {
    box-shadow: 0 2px 8px var(--shadow);
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
    color: var(--text-primary);
  }

  .type-details p {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .usage {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .type-actions {
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    padding: 0.5rem;
    background: var(--bg-tertiary);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .icon-btn:hover:not(:disabled) {
    background: var(--border-primary);
    color: var(--text-primary);
  }

  .icon-btn.danger {
    color: var(--color-danger);
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
    background: var(--bg-primary);
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
    border-bottom: 1px solid var(--border-primary);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .close-btn {
    padding: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .close-btn:hover {
    color: var(--text-primary);
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
    color: var(--text-primary);
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
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
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    background: var(--bg-primary);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .icon-option:hover {
    border-color: var(--color-primary);
  }

  .icon-option.selected {
    border-color: var(--color-primary);
    background: #eff6ff;
  }

  .color-option {
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid var(--border-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .color-option:hover {
    transform: scale(1.1);
  }

  .color-option.selected {
    border-color: var(--text-primary);
    box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px currentColor;
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
    color: var(--text-primary);
  }

  .section-description {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
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
    color: var(--text-primary);
  }

  .quarter-setting select {
    padding: 0.625rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
  }

  .quarter-setting select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .section-actions {
    display: flex;
    justify-content: flex-end;
  }

  .database-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item strong {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .info-item code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-primary);
    word-break: break-all;
  }

  .database-path-input {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .database-path-input label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .path-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .database-path-input input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .database-path-input input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .btn-browse {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .btn-browse:hover {
    background: #2563eb;
  }

  .btn-secondary {
    padding: 0.625rem 1rem;
    background: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }

  .btn-default-path {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: fit-content;
  }

  .btn-default-path:hover {
    background: var(--border-primary);
    border-color: var(--text-tertiary);
  }

  .info-banner {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.875rem;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
</style>
