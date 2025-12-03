<script lang="ts">
  import { AlertTriangle, X } from 'lucide-svelte';

  export let title: string;
  export let message: string;
  export let confirmText: string = 'Delete';
  export let cancelText: string = 'Cancel';
  export let onConfirm: () => void;
  export let onCancel: () => void;
  export let danger: boolean = true;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
  <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-message">
    <button class="close-button" on:click={onCancel} aria-label="Close modal">
      <X size={20} />
    </button>

    <div class="modal-icon" class:danger>
      <AlertTriangle size={48} />
    </div>

    <h2 id="modal-title">{title}</h2>
    <p id="modal-message">{message}</p>

    <div class="modal-actions">
      <button class="btn-secondary" on:click={onCancel}>
        {cancelText}
      </button>
      <button class="btn-danger" on:click={onConfirm} class:danger>
        {confirmText}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    position: relative;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .modal-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    background: #fef3c7;
    color: #f59e0b;
  }

  .modal-icon.danger {
    background: #fee2e2;
    color: #dc2626;
  }

  h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
  }

  p {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
    text-align: center;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: stretch;
  }

  .btn-secondary,
  .btn-danger {
    flex: 1;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
  }

  .btn-secondary:hover {
    background: var(--bg-secondary);
  }

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover {
    background: #b91c1c;
  }

  .btn-danger:not(.danger) {
    background: var(--color-primary);
  }

  .btn-danger:not(.danger):hover {
    background: #2563eb;
  }
</style>
