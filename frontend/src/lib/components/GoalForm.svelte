<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import GoalTypeSelector from './GoalTypeSelector.svelte';
  import { Calendar, Save, Plus } from 'lucide-svelte';
  import { terminology } from '$lib/stores/terminology';

  export let title = '';
  export let description = '';
  export let targetDate = '';
  export let quarter: string | undefined = undefined;
  export let year: number | undefined = undefined;
  export let goalTypeId: number | undefined = undefined;
  export let isEditing = false;
  export let submitText = '';

  const dispatch = createEventDispatcher();

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  interface QuarterButton {
    label: string;
    quarter: string;
    year: number;
    endDate: string;
  }

  let upcomingQuarters: QuarterButton[] = [];

  onMount(() => {
    calculateUpcomingQuarters();
  });

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

  function calculateUpcomingQuarters() {
    const fiscalYearStart = getFiscalYearStart();
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYearNum = now.getFullYear();

    upcomingQuarters = [];

    // Determine current fiscal year start
    let fiscalYearStartYear = currentMonth >= fiscalYearStart ? currentYearNum : currentYearNum - 1;

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

    // Generate next 4 quarters starting from the current one
    for (let i = 0; i < 4; i++) {
      // Calculate absolute quarter index (starting from current)
      const absoluteQuarterIndex = currentQuarterNumber - 1 + i;
      const quarterNumber = (absoluteQuarterIndex % 4) + 1;
      const fiscalYearsAhead = Math.floor(absoluteQuarterIndex / 4);
      const targetFiscalYear = fiscalYearStartYear + fiscalYearsAhead;

      // Calculate the start month of this quarter
      const quarterStartMonth = ((fiscalYearStart + (quarterNumber - 1) * 3 - 1) % 12) + 1;

      // Calculate the end month (one month before next quarter starts)
      const nextQuarterStartMonth = ((fiscalYearStart + quarterNumber * 3 - 1) % 12) + 1;
      const quarterEndMonth = nextQuarterStartMonth === 1 ? 12 : nextQuarterStartMonth - 1;

      // Determine the calendar year for the end date
      let endYear = targetFiscalYear;

      // If quarter start month is less than fiscal year start, it's in the next calendar year
      if (quarterStartMonth < fiscalYearStart) {
        endYear = targetFiscalYear + 1;
      }

      // If quarter spans year boundary (start > end month), end is in next calendar year
      if (quarterStartMonth > quarterEndMonth) {
        endYear = targetFiscalYear + 1;
      }

      // Get the last day of the end month
      const lastDay = new Date(endYear, quarterEndMonth, 0).getDate();
      const endDate = `${endYear}-${String(quarterEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      upcomingQuarters.push({
        label: `End Q${quarterNumber} ${endYear}`,
        quarter: `Q${quarterNumber}`,
        year: endYear,
        endDate,
      });
    }
  }

  function setQuarterDate(quarterButton: QuarterButton) {
    targetDate = quarterButton.endDate;
    quarter = quarterButton.quarter;
    year = quarterButton.year;
  }

  function handleSubmit() {
    dispatch('submit', {
      title,
      description,
      target_date: targetDate || null,
      quarter: quarter || null,
      year: year || null,
      goal_type_id: goalTypeId,
    });
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="goal-form">
  <div class="form-group">
    <label>{$terminology.goal.singular} Type (optional)</label>
    <GoalTypeSelector bind:selected={goalTypeId} />
  </div>

  <div class="form-group">
    <label for="title">{$terminology.goal.singular} Title *</label>
    <input
      type="text"
      id="title"
      bind:value={title}
      placeholder="e.g., Complete project documentation"
      required
    />
  </div>

  <div class="form-group">
    <label for="description">Description (optional)</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder="Add more details about your goal..."
      rows="15"
    />
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="quarter">Quarter (optional)</label>
      <select id="quarter" bind:value={quarter}>
        <option value={undefined}>Select Quarter</option>
        {#each quarters as q}
          <option value={q}>{q}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="year">Year (optional)</label>
      <select id="year" bind:value={year}>
        <option value={undefined}>Select Year</option>
        {#each years as y}
          <option value={y}>{y}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="targetDate">Target Date (optional)</label>
    {#if upcomingQuarters.length > 0}
      <div class="quarter-buttons">
        {#each upcomingQuarters as quarterButton}
          <button
            type="button"
            class="quarter-btn"
            on:click={() => setQuarterDate(quarterButton)}
          >
            <Calendar size={14} />
            {quarterButton.label}
          </button>
        {/each}
      </div>
    {/if}
    <input type="date" id="targetDate" bind:value={targetDate} />
  </div>

  <button type="submit" class="btn-primary" disabled={!title.trim()}>
    {#if isEditing}
      <Save size={20} />
    {:else}
      <Plus size={20} />
    {/if}
    {submitText || (isEditing ? 'Save Changes' : `Create ${$terminology.goal.singular}`)}
  </button>
</form>

<style>
  .goal-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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

  input,
  textarea,
  select {
    padding: 0.75rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .btn-primary {
    padding: 0.875rem 1.5rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quarter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .quarter-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quarter-btn:hover {
    background: var(--border-primary);
    border-color: var(--text-tertiary);
    color: var(--text-primary);
  }

  .quarter-btn:active {
    transform: scale(0.98);
  }
</style>
