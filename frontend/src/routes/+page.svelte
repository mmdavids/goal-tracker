<script lang="ts">
  import { onMount } from 'svelte';
  import { goals } from '$lib/stores/goals';
  import { goalsAPI, type Goal } from '$lib/api/client';
  import GoalCard from '$lib/components/GoalCard.svelte';
  import GoalTable from '$lib/components/GoalTable.svelte';
  import GoalForm from '$lib/components/GoalForm.svelte';
  import { Plus, X, Archive, Calendar, FileText, FileArchive, Grid, List, Table } from 'lucide-svelte';

  let showForm = false;
  let loading = true;
  let loadingArchived = true;
  let error = '';
  let archivedGoals: Goal[] = [];
  let daysLeftInCurrentQuarter = 0;
  let daysLeftInYearEndQuarter = 0;
  let currentQuarterName = '';
  let yearEndQuarterName = '';
  let selectedGoalIds: Set<number> = new Set();
  let showExportButton = false;
  let viewMode: 'grid' | 'table' = 'grid';


  function getFiscalYearStart(): number {
    const saved = localStorage.getItem('fiscalYearStart');
    if (saved) {
      try {
        return parseInt(saved, 10);
      } catch (e) {
        console.error('Failed to load fiscal year settings:', e);
      }
    }
    return 9; // September default
  }

  function calculateCountdowns() {
    const fiscalYearStart = getFiscalYearStart();
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Determine current fiscal year start
    let fiscalYearStartYear = currentMonth >= fiscalYearStart ? currentYear : currentYear - 1;

    // Find current quarter (1-4)
    let currentQuarterNumber = 1;
    for (let q = 1; q <= 4; q++) {
      const quarterStartMonth = ((fiscalYearStart + (q - 1) * 3 - 1) % 12) + 1;
      const nextQuarterStartMonth = ((fiscalYearStart + q * 3 - 1) % 12) + 1;

      if (quarterStartMonth < nextQuarterStartMonth) {
        if (currentMonth >= quarterStartMonth && currentMonth < nextQuarterStartMonth) {
          currentQuarterNumber = q;
          break;
        }
      } else {
        // Quarter spans year boundary
        if (currentMonth >= quarterStartMonth || currentMonth < nextQuarterStartMonth) {
          currentQuarterNumber = q;
          break;
        }
      }
    }

    // Calculate current quarter end date
    const currentQuarterStartMonth = ((fiscalYearStart + (currentQuarterNumber - 1) * 3 - 1) % 12) + 1;
    const nextQuarterStartMonth = ((fiscalYearStart + currentQuarterNumber * 3 - 1) % 12) + 1;
    const currentQuarterEndMonth = nextQuarterStartMonth === 1 ? 12 : nextQuarterStartMonth - 1;

    // Determine the calendar year for the quarter end
    let currentQuarterEndYear = fiscalYearStartYear;

    // If the quarter start month is less than fiscal year start, it's in the next calendar year
    if (currentQuarterStartMonth < fiscalYearStart) {
      currentQuarterEndYear = fiscalYearStartYear + 1;
    }

    // If the quarter spans year boundary (start > end month), end is in next calendar year
    if (currentQuarterStartMonth > currentQuarterEndMonth) {
      currentQuarterEndYear = fiscalYearStartYear + 1;
    }

    const currentQuarterEndDay = new Date(currentQuarterEndYear, currentQuarterEndMonth, 0).getDate();
    const currentQuarterEndDate = new Date(currentQuarterEndYear, currentQuarterEndMonth - 1, currentQuarterEndDay, 23, 59, 59);

    daysLeftInCurrentQuarter = Math.ceil((currentQuarterEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    currentQuarterName = `Q${currentQuarterNumber} ${fiscalYearStartYear}/${fiscalYearStartYear+1}`;

    // Calculate Q4 end date
    const q4StartMonth = ((fiscalYearStart + 9 - 1) % 12) + 1; // Q4 is Q1 + 9 months
    const q4EndMonthCalc = ((fiscalYearStart + 12 - 1) % 12) + 1; // Next Q1
    const q4EndMonth = q4EndMonthCalc === 1 ? 12 : q4EndMonthCalc - 1;

    // Determine Q4 end year
    // If Q4 start month is less than fiscal year start, Q4 is in the next calendar year
    let q4EndYear = fiscalYearStartYear;
    if (q4StartMonth < fiscalYearStart) {
      q4EndYear = fiscalYearStartYear + 1;
    }
    // Also check if Q4 spans year boundary (start > end month)
    if (q4StartMonth > q4EndMonth) {
      q4EndYear = fiscalYearStartYear + 1;
    }

    const q4EndDay = new Date(q4EndYear, q4EndMonth, 0).getDate();
    const q4EndDate = new Date(q4EndYear, q4EndMonth - 1, q4EndDay, 23, 59, 59);

    daysLeftInYearEndQuarter = Math.ceil((q4EndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const nextFiscalYear = fiscalYearStartYear + 1;
    yearEndQuarterName = `Q4 ${fiscalYearStartYear}/${nextFiscalYear}`;
  }

  function toggleViewMode() {
    viewMode = viewMode === 'grid' ? 'table' : 'grid';
    localStorage.setItem('goalViewMode', viewMode);
  }

  onMount(async () => {
    const savedView = localStorage.getItem('goalViewMode');
    if (savedView === 'grid' || savedView === 'table') {
      viewMode = savedView;
    }

    calculateCountdowns();

    try {
      await goals.load('active');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load goals';
    } finally {
      loading = false;
    }

    // Load archived goals
    try {
      archivedGoals = await goalsAPI.getAll('completed');
    } catch (err) {
      console.error('Failed to load archived goals:', err);
    } finally {
      loadingArchived = false;
    }
  });

  async function handleCreateGoal(event: CustomEvent) {
    try {
      error = '';
      await goals.add(event.detail);
      showForm = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create goal';
    }
  }

  async function handleDeleteGoal() {
    await goals.load('active');
    // Reload archived goals as well
    try {
      archivedGoals = await goalsAPI.getAll('completed');
    } catch (err) {
      console.error('Failed to reload archived goals:', err);
    }
  }

  function toggleGoalSelection(goalId: number) {
    if (selectedGoalIds.has(goalId)) {
      selectedGoalIds.delete(goalId);
    } else {
      selectedGoalIds.add(goalId);
    }
    selectedGoalIds = selectedGoalIds; // Trigger reactivity
    showExportButton = selectedGoalIds.size > 0;
  }

  function selectAllGoals() {
    $goals.forEach(goal => selectedGoalIds.add(goal.id));
    selectedGoalIds = selectedGoalIds;
    showExportButton = true;
  }

  function clearSelection() {
    selectedGoalIds.clear();
    selectedGoalIds = selectedGoalIds;
    showExportButton = false;
  }

  async function exportSelectedGoals(format: 'markdown' | 'zip' | 'simple' = 'markdown') {
    if (selectedGoalIds.size === 0) return;

    try {
      let blob: Blob;
      let filename: string;

      if (format === 'zip') {
        blob = await goalsAPI.exportToZip(Array.from(selectedGoalIds));
        filename = 'goals-export';
      } else if (format === 'simple') {
        blob = await goalsAPI.exportToSimpleMarkdown(Array.from(selectedGoalIds));
        filename = 'goals-simple';
      } else {
        blob = await goalsAPI.exportToMarkdown(Array.from(selectedGoalIds));
        filename = 'goals-export';
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'zip' ? 'zip' : 'md';
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
      a.download = `${filename}-${timestamp}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      clearSelection();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to export goals';
    }
  }
</script>

<svelte:head>
  <title>Goal Tracker - Dashboard</title>
</svelte:head>

<div class="page-layout">
  <!-- Sidebar with countdowns -->
  <aside class="sidebar">
    <div class="countdown-card">
      <div class="countdown-header">
        <Calendar size={20} />
        <h3>Current Quarter</h3>
      </div>
      <div class="countdown-header">
        <h3>{currentQuarterName}</h3>
      </div>
      <div class="countdown-value">
        <span class="days">{daysLeftInCurrentQuarter}</span>
        <span class="label">days left</span>
      </div>
    </div>

    <div class="countdown-card year-end">
      <div class="countdown-header">
        <Calendar size={20} />
        <h3>Year End</h3>
      </div>
      <div class="countdown-value">
        <span class="days">{daysLeftInYearEndQuarter}</span>
        <span class="label">days left</span>
      </div>
    </div>
  </aside>

  <!-- Main content -->
  <div class="dashboard">
    <div class="header">
      <h1>My Goals</h1>
      <div class="header-actions">
        {#if showExportButton}
          <button class="btn-export" on:click={() => exportSelectedGoals('zip')}>
            <FileArchive size={18} />
            Export ZIP ({selectedGoalIds.size})
          </button>
          <button class="btn-export" on:click={() => exportSelectedGoals('markdown')}>
            <FileText size={18} />
            Export MD ({selectedGoalIds.size})
          </button>
          <button class="btn-export" on:click={() => exportSelectedGoals('simple')}>
            <Table size={18} />
            Simple ({selectedGoalIds.size})
          </button>
          <button class="btn-secondary" on:click={clearSelection}>
            Clear Selections
          </button>
        {:else}
          <button class="btn-secondary" on:click={selectAllGoals}>
            Select All
          </button>
        {/if}
        <button class="btn-primary" on:click={() => (showForm = !showForm)}>
          {#if showForm}
            <X size={20} />
          {:else}
            <Plus size={20} />
          {/if}
          {showForm ? 'Cancel' : 'New Goal'}
        </button>
      </div>
    </div>

    <div class="view-toggle-container">
      <button
        class="btn-view-toggle"
        on:click={toggleViewMode}
        title={viewMode === 'grid' ? 'Switch to Table View' : 'Switch to Grid View'}
      >
        {#if viewMode === 'grid'}
          <List size={18} />
          Table View
        {:else}
          <Grid size={18} />
          Grid View
        {/if}
      </button>
    </div>

  {#if error}
    <div class="error-banner">
      {error}
    </div>
  {/if}

  {#if showForm}
    <div class="form-container">
      <h2>Create New Goal</h2>
      <GoalForm on:submit={handleCreateGoal} />
    </div>
  {/if}

  {#if loading}
    <div class="loading">Loading goals...</div>
  {:else if $goals.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🎯</div>
      <h2>No goals yet</h2>
      <p>Start tracking your progress by creating your first goal!</p>
    </div>
  {:else if viewMode === 'table'}
    <GoalTable
      goals={$goals}
      {selectedGoalIds}
      on:toggle-selection={(e) => toggleGoalSelection(e.detail)}
    />
  {:else}
    <div class="goals-grid">
      {#each $goals as goal (goal.id)}
        <div class="goal-wrapper">
          <label class="goal-checkbox">
            <input
              type="checkbox"
              checked={selectedGoalIds.has(goal.id)}
              on:change={() => toggleGoalSelection(goal.id)}
            />
            <span class="checkmark"></span>
          </label>
          <GoalCard {goal} on:deleted={handleDeleteGoal} />
        </div>
      {/each}
    </div>
  {/if}

  <!-- Archived Goals Section -->
  {#if !loading && archivedGoals.length > 0}
    <div class="archived-section">
      <div class="archived-header">
        <div class="archived-title">
          <Archive size={24} />
          <h2>Archived Goals</h2>
        </div>
        <a href="/archived" class="view-all-link">View All →</a>
      </div>
      <div class="goals-grid">
        {#each archivedGoals as goal (goal.id)}
          <GoalCard {goal} on:deleted={handleDeleteGoal} />
        {/each}
      </div>
    </div>
  {/if}
  </div>
</div>

<style>
  .page-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    max-width: 100%;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 1rem;
    height: fit-content;
  }

  .countdown-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 1.5rem;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .countdown-card.year-end {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .countdown-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .countdown-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    opacity: 0.95;
  }

  .countdown-value {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .countdown-value .days {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .countdown-value .label {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 1024px) {
    .page-layout {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      flex-direction: row;
      order: -1;
    }

    .countdown-card {
      flex: 1;
      min-width: 0;
    }
  }

  @media (max-width: 640px) {
    .sidebar {
      flex-direction: column;
    }
  }

  .dashboard {
    max-width: 100%;
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

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .form-container {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .form-container h2 {
    margin: 0 0 1.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-state p {
    margin: 0 0 2rem 0;
    color: var(--text-secondary);
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .goals-grid {
      grid-template-columns: 1fr;
    }
  }

  .archived-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border-primary);
  }

  .archived-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .archived-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .archived-title h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .view-all-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .view-all-link:hover {
    color: #2563eb;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .view-toggle-container {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1.5rem;
  }

  .btn-view-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .btn-view-toggle:hover {
    background: var(--bg-secondary);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
    border-color: var(--text-tertiary);
  }

  .btn-export {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--color-success);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-export:hover {
    background: #059669;
  }

  .goal-wrapper {
    position: relative;
    display: flex;
    align-items: stretch;
  }

  .goal-wrapper :global(.goal-card) {
    width: 100%;
  }

  .goal-wrapper :global(.goal-header) {
    padding-left: 2.25rem;
  }

  .goal-checkbox {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    z-index: 10;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .goal-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  .checkmark {
    display: block;
    width: 24px;
    height: 24px;
    background: var(--bg-primary);
    border: 2px solid var(--border-secondary);
    border-radius: 6px;
    transition: all 0.2s;
    box-shadow: 0 1px 3px var(--shadow);
  }

  .goal-checkbox:hover .checkmark {
    border-color: var(--color-primary);
  }

  .goal-checkbox input[type="checkbox"]:checked ~ .checkmark {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .goal-checkbox input[type="checkbox"]:checked ~ .checkmark::after {
    content: '';
    position: absolute;
    left: 8px;
    top: 4px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  @media (max-width: 640px) {
    .header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .header-actions {
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary,
    .btn-export {
      flex: 1;
      justify-content: center;
      min-width: 120px;
    }
  }
</style>
