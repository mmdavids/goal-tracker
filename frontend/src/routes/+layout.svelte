<script lang="ts">
  import CelebrationAnimation from '$lib/components/CelebrationAnimation.svelte';
  import { Archive, Trash2, Moon, Sun, Settings, Home } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';
  import '../app.css';
</script>

<div class="app">
  <nav class="navbar">
    <div class="nav-content">
      <a href="/" class="logo">
        <span class="logo-emoji">🎯</span>
        <span class="logo-text">Goal Tracker</span>
      </a>
      <div class="nav-links">
        <a href="/" class="nav-link">
          <Home size={18} />
          Dashboard
        </a>
        <a href="/archived" class="nav-link">
          <Archive size={18} />
          Archived
        </a>
        <a href="/trash" class="nav-link">
          <Trash2 size={18} />
          Trash
        </a>
        <a href="/settings" class="nav-link">
          <Settings size={18} />
          Settings
        </a>
        <button class="theme-toggle" on:click={() => theme.toggle()} aria-label="Toggle theme">
          {#if $theme === 'dark'}
            <Sun size={18} />
          {:else}
            <Moon size={18} />
          {/if}
        </button>
      </div>
    </div>
  </nav>

  <main class="main-content">
    <slot />
  </main>
</div>

<CelebrationAnimation />

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      sans-serif;
  }

  .app {
    min-height: 100vh;
  }

  .navbar {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-primary);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.25rem;
    transition: color 0.2s;
  }

  .logo-emoji {
    font-size: 1.75rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: var(--color-primary);
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .theme-toggle:hover {
    background: var(--bg-tertiary);
    color: var(--color-primary);
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
</style>
