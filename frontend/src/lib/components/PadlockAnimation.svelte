<script lang="ts">
  import { onMount } from 'svelte';

  export let onComplete: () => void;

  let visible = true;

  onMount(() => {
    // Auto-hide after animation completes
    setTimeout(() => {
      visible = false;
      onComplete();
    }, 1200);
  });
</script>

{#if visible}
  <div class="padlock-container">
    <div class="padlock">
      <div class="shackle"></div>
      <div class="body">
        <div class="keyhole"></div>
      </div>
    </div>
    <div class="sparkles">
      {#each Array(8) as _, i}
        <div class="sparkle" style="--delay: {i * 0.1}s; --angle: {i * 45}deg"></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .padlock-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    animation: fade-in 0.2s ease-out, fade-out 0.3s ease-out 0.9s forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .padlock {
    position: relative;
    width: 120px;
    height: 140px;
    animation: lock-appear 0.4s ease-out, lock-bounce 0.3s ease-out 0.4s;
  }

  @keyframes lock-appear {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes lock-bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .shackle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 50px;
    border: 12px solid #fbbf24;
    border-bottom: none;
    border-radius: 30px 30px 0 0;
    animation: shackle-close 0.3s ease-out 0.7s forwards;
    transform-origin: bottom center;
  }

  @keyframes shackle-close {
    0% {
      transform: translateX(-50%) translateY(-10px);
    }
    100% {
      transform: translateX(-50%) translateY(0);
    }
  }

  .body {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 90px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 12px;
    box-shadow:
      0 4px 20px rgba(251, 191, 36, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .keyhole {
    width: 12px;
    height: 12px;
    background: #92400e;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .keyhole::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 16px;
    background: #92400e;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }

  .sparkles {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .sparkle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fbbf24;
    border-radius: 50%;
    animation: sparkle-burst 0.8s ease-out forwards;
    animation-delay: var(--delay);
    box-shadow: 0 0 8px #fbbf24;
  }

  @keyframes sparkle-burst {
    0% {
      transform: translate(0, 0) scale(0);
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * 100px),
          calc(sin(var(--angle)) * 100px)
        )
        scale(1);
      opacity: 0;
    }
  }

  /* Glow pulse effect */
  .padlock::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 180px;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
    animation: glow-pulse 0.8s ease-out 0.4s;
    border-radius: 50%;
    z-index: -1;
  }

  @keyframes glow-pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
</style>
