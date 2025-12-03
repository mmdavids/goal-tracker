<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files: File[] = [];
  let fileInput: HTMLInputElement;

  const dispatch = createEventDispatcher();

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      files = [...files, ...Array.from(target.files)];
      dispatch('change', files);
    }
  }

  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
    dispatch('change', files);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files) {
      files = [...files, ...Array.from(e.dataTransfer.files)];
      dispatch('change', files);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }
</script>

<div class="image-upload">
  <div
    class="drop-zone"
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:click={() => fileInput.click()}
  >
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <p>Drag & drop images or click to browse</p>
    <input
      type="file"
      bind:this={fileInput}
      on:change={handleFileSelect}
      accept="image/*"
      multiple
      hidden
    />
  </div>

  {#if files.length > 0}
    <div class="preview-grid">
      {#each files as file, i}
        <div class="preview-item">
          <img src={URL.createObjectURL(file)} alt={file.name} />
          <button type="button" class="remove-btn" on:click={() => removeFile(i)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .drop-zone {
    border: 2px dashed var(--border-secondary);
    border-radius: 12px;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);
  }

  .drop-zone:hover {
    border-color: var(--color-primary);
    background: rgba(59, 130, 246, 0.1);
    color: var(--color-primary);
  }

  .drop-zone p {
    margin: 0;
    font-size: 0.875rem;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .preview-item {
    position: relative;
    aspect-ratio: 1;
  }

  .preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border-primary);
  }

  .remove-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 9999px;
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .remove-btn:hover {
    background: rgba(0, 0, 0, 0.9);
  }
</style>
