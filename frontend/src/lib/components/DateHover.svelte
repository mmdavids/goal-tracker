<script lang="ts">
  import { formatFullDate } from '$lib/utils/date';

  export let date: string;

  let showTooltip = false;

  function handleMouseEnter() {
    showTooltip = true;
  }

  function handleMouseLeave() {
    showTooltip = false;
  }
</script>

<div
  class="date-hover-wrapper"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  role="tooltip"
>
  <slot />
  {#if showTooltip}
    <div class="tooltip">
      <div class="tooltip-content">
        {formatFullDate(date)}
      </div>
    </div>
  {/if}
</div>

<style>
  .date-hover-wrapper {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    z-index: 1000;
    pointer-events: none;
    animation: tooltipFadeIn 0.15s ease;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .tooltip-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  /* Compact Mode */
  :global([data-compact="true"]) .tooltip-content {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
</style>
