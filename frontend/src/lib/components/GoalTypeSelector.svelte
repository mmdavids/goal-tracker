<script lang="ts">
  import { onMount } from 'svelte';
  import { goalTypesAPI, type GoalType } from '$lib/api/client';

  export let selected: number | undefined = undefined;

  let goalTypes: GoalType[] = [];
  let loading = true;

  onMount(async () => {
    try {
      goalTypes = await goalTypesAPI.getAll();
    } catch (error) {
      console.error('Failed to load goal types:', error);
    } finally {
      loading = false;
    }
  });

  function selectType(id: number | undefined) {
    selected = id;
  }
</script>

<div class="goal-type-selector">
  {#if loading}
    <div class="loading">Loading types...</div>
  {:else}
    <div class="type-grid">
      <button
        type="button"
        class="type-option"
        class:selected={selected === undefined}
        on:click={() => selectType(undefined)}
      >
        <span class="icon">🎯</span>
        <span class="name">None</span>
      </button>
      {#each goalTypes as type}
        <button
          type="button"
          class="type-option"
          class:selected={selected === type.id}
          on:click={() => selectType(type.id)}
          style="--type-color: {type.color}"
        >
          <span class="icon">{type.icon}</span>
          <span class="name">{type.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .goal-type-selector {
    width: 100%;
  }

  .loading {
    text-align: center;
    padding: 1rem;
    color: var(--text-secondary);
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .type-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.75rem;
    border: 2px solid var(--border-primary);
    border-radius: 12px;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .type-option:hover {
    border-color: var(--type-color, #3b82f6);
    background: rgba(var(--type-color-rgb, 59, 130, 246), 0.05);
    transform: translateY(-2px);
  }

  .type-option.selected {
    border-color: var(--type-color, #3b82f6);
    background: rgba(var(--type-color-rgb, 59, 130, 246), 0.1);
    box-shadow: 0 0 0 3px rgba(var(--type-color-rgb, 59, 130, 246), 0.2);
  }

  .icon {
    font-size: 2rem;
  }

  .name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
  }
</style>
