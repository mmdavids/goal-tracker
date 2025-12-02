<script lang="ts">
  import { onMount } from 'svelte';
  import { configAPI } from '$lib/api/client';
  import { X, Folder, File, ChevronUp, Home } from 'lucide-svelte';

  export let onSelect: (path: string) => void;
  export let onCancel: () => void;
  export let initialPath: string = '';
  export let selectMode: 'file' | 'directory' = 'directory';

  let currentPath = '';
  let parentPath: string | null = null;
  let entries: Array<{ name: string; path: string; isDirectory: boolean; isFile: boolean }> = [];
  let loading = true;
  let error = '';
  let filename = 'database.sqlite';

  onMount(async () => {
    // Extract filename from initialPath if it's there
    const fullPath = initialPath || '';
    if (fullPath.includes('.sqlite') || fullPath.match(/\.[^/\\]+$/)) {
      const lastSep = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'));
      if (lastSep > 0) {
        filename = fullPath.substring(lastSep + 1);
        await loadDirectory(fullPath.substring(0, lastSep));
        return;
      }
    }

    await loadDirectory(initialPath);
  });

  async function loadDirectory(path?: string) {
    try {
      loading = true;
      error = '';
      const result = await configAPI.browseDirectory(path);

      if (result.error) {
        error = result.error;
      } else {
        currentPath = result.currentPath;
        parentPath = result.parentPath;
        entries = result.entries;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load directory';
    } finally {
      loading = false;
    }
  }

  function handleEntryClick(entry: typeof entries[0]) {
    if (entry.isDirectory) {
      loadDirectory(entry.path);
    } else if (selectMode === 'file') {
      filename = entry.name;
    }
  }

  function handleSelect() {
    if (selectMode === 'directory') {
      onSelect(currentPath);
    } else {
      const fullPath = `${currentPath}/${filename}`;
      onSelect(fullPath);
    }
  }

  function goToParent() {
    if (parentPath) {
      loadDirectory(parentPath);
    }
  }

  function goToHome() {
    loadDirectory();
  }
</script>

<div class="modal-overlay" on:click={onCancel}>
  <div class="modal" on:click|stopPropagation>
    <div class="modal-header">
      <h2>Select {selectMode === 'directory' ? 'Folder' : 'Location'}</h2>
      <button class="close-btn" on:click={onCancel}>
        <X size={24} />
      </button>
    </div>

    <div class="modal-body">
      <div class="path-bar">
        <button class="icon-btn" on:click={goToHome} title="Home">
          <Home size={18} />
        </button>
        {#if parentPath}
          <button class="icon-btn" on:click={goToParent} title="Up">
            <ChevronUp size={18} />
          </button>
        {/if}
        <div class="current-path">{currentPath}</div>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      {#if loading}
        <div class="loading">Loading...</div>
      {:else}
        <div class="entries-list">
          {#each entries as entry (entry.path)}
            <button
              class="entry-item"
              class:directory={entry.isDirectory}
              on:click={() => handleEntryClick(entry)}
            >
              {#if entry.isDirectory}
                <Folder size={18} />
              {:else}
                <File size={18} />
              {/if}
              <span class="entry-name">{entry.name}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if selectMode === 'file'}
        <div class="filename-input">
          <label for="filename">Filename:</label>
          <input
            type="text"
            id="filename"
            bind:value={filename}
            placeholder="database.sqlite"
          />
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" on:click={onCancel}>Cancel</button>
      <button class="btn-primary" on:click={handleSelect}>
        Select {selectMode === 'directory' ? 'Folder' : 'This Location'}
      </button>
    </div>
  </div>
</div>

<style>
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
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .path-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .icon-btn {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .current-path {
    flex: 1;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .error-message {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .entry-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    width: 100%;
  }

  .entry-item:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .entry-item.directory {
    font-weight: 500;
  }

  .entry-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filename-input {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filename-input label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .filename-input input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  .filename-input input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  button {
    padding: 0.625rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }
</style>
