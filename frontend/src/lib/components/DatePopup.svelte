<script lang="ts">
  import { formatTime, formatFullDate } from '$lib/utils/date';

  export let show: boolean = false;
  export let type: 'start' | 'end' | null = null;
  export let startDate: string | undefined = undefined;
  export let endDate: string | undefined = undefined;

  function handleClose() {
    show = false;
  }

  function handleOverlayClick() {
    handleClose();
  }

  function handlePopupClick(e: MouseEvent) {
    e.stopPropagation();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }

  $: dateString = type === 'start' ? startDate : endDate;
</script>

{#if show && type && dateString}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="popup-overlay" on:click={handleOverlayClick} on:keydown={handleKeyDown} role="button" tabindex="-1"></div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="date-popup" on:click={handlePopupClick} on:keydown={handleKeyDown} role="dialog" tabindex="0" aria-modal="true" aria-labelledby="popup-title">
    <div class="popup-header">
      <h3 id="popup-title">📅 {type === 'start' ? 'Start Date' : 'Target Date'}</h3>
      <button class="close-btn" on:click={handleClose}>×</button>
    </div>
    <div class="popup-content">
      <div class="date-item">
        <div class="date-label">
          <span class="icon">{type === 'start' ? '🚀' : '🎯'}</span>
          <span>{type === 'start' ? 'Created' : 'Target'}</span>
        </div>
        <div class="date-value">
          {formatFullDate(dateString)}
        </div>
        <div class="date-short">
          {formatTime(dateString)}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .date-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    min-width: 350px;
    max-width: 90vw;
    animation: popupSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popupSlideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -45%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-primary);
  }

  .popup-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transform: rotate(90deg);
  }

  .popup-content {
    padding: 1.5rem;
  }

  .date-item {
    padding: 1.25rem;
    border-radius: 12px;
    background: var(--bg-secondary);
    border-left: 4px solid var(--color-primary);
    transition: all 0.2s ease;
  }

  .date-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .date-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .date-label .icon {
    font-size: 1.125rem;
  }

  .date-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.375rem;
  }

  .date-short {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .date-popup {
      min-width: unset;
      width: 90vw;
    }

    .popup-header {
      padding: 1rem;
    }

    .popup-content {
      padding: 1rem;
    }
  }

  /* Compact Mode */
  :global([data-compact="true"]) .date-popup {
    min-width: 320px;
  }

  :global([data-compact="true"]) .popup-header {
    padding: 1rem 1.25rem;
  }

  :global([data-compact="true"]) .popup-header h3 {
    font-size: 1rem;
    gap: 0.375rem;
  }

  :global([data-compact="true"]) .popup-content {
    padding: 1rem;
  }

  :global([data-compact="true"]) .date-item {
    padding: 1rem;
  }

  :global([data-compact="true"]) .date-label {
    gap: 0.375rem;
    margin-bottom: 0.5rem;
  }

  :global([data-compact="true"]) .date-value {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  :global([data-compact="true"]) .date-short {
    font-size: 0.8125rem;
  }

  :global([data-compact="true"]) .close-btn {
    width: 28px;
    height: 28px;
    font-size: 1.75rem;
  }
</style>
