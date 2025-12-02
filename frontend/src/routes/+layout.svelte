<script lang="ts">
  import CelebrationAnimation from '$lib/components/CelebrationAnimation.svelte';
  import { Archive, Trash2 } from 'lucide-svelte';
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
        <a href="/" class="nav-link">Dashboard</a>
        <a href="/archived" class="nav-link">
          <Archive size={18} />
          Archived
        </a>
        <a href="/trash" class="nav-link">
          <Trash2 size={18} />
          Trash
        </a>
        <a href="/settings" class="nav-link">Settings</a>
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
    background: #f9fafb;
  }

  .app {
    min-height: 100vh;
  }

  .navbar {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 100;
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
    color: #1f2937;
    font-weight: 700;
    font-size: 1.25rem;
  }

  .logo-emoji {
    font-size: 1.75rem;
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #3b82f6;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
</style>
