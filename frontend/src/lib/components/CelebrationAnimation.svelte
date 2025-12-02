<script lang="ts">
  import { onMount } from 'svelte';
  import { celebration } from '$lib/stores/celebrations';
  import confetti from 'canvas-confetti';

  $: if ($celebration) {
    if ($celebration.type === '100') {
      // Big confetti for completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      // Smaller celebration
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  }
</script>

{#if $celebration}
  <div class="celebration-overlay">
    <div class="celebration-content">
      <div class="emoji">{$celebration.emoji}</div>
      <h2>{$celebration.message}</h2>
    </div>
  </div>
{/if}

<style>
  .celebration-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 9999;
  }

  .celebration-content {
    background: white;
    padding: 2rem 3rem;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    animation: celebrationPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .emoji {
    font-size: 4rem;
    margin-bottom: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  @keyframes celebrationPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
