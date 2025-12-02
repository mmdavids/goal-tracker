<script lang="ts">
  import { onMount } from 'svelte';

  export let onComplete: () => void;

  let visible = true;

  onMount(() => {
    // Auto-hide after animation completes
    setTimeout(() => {
      visible = false;
      onComplete();
    }, 800);
  });
</script>

{#if visible}
  <div class="ninja-slice-container">
    <div class="slash-line"></div>
    <div class="slash-line slash-line-2"></div>
    <div class="particles">
      {#each Array(12) as _, i}
        <div class="particle" style="--delay: {i * 0.05}s; --angle: {i * 30}deg"></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .ninja-slice-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }

  .slash-line {
    position: absolute;
    width: 150%;
    height: 3px;
    background: linear-gradient(90deg,
      transparent 0%,
      #ff0000 20%,
      #ffffff 50%,
      #ff0000 80%,
      transparent 100%
    );
    top: 50%;
    left: -25%;
    transform: rotate(-45deg) translateY(-50%);
    animation: slash 0.3s ease-out;
    box-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
  }

  .slash-line-2 {
    animation-delay: 0.15s;
    transform: rotate(-35deg) translateY(-50%);
    opacity: 0.6;
  }

  @keyframes slash {
    0% {
      transform: rotate(-45deg) translateY(-50%) translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: rotate(-45deg) translateY(-50%) translateX(100%);
      opacity: 0;
    }
  }

  .particles {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #ff4444;
    border-radius: 50%;
    animation: particle-burst 0.6s ease-out forwards;
    animation-delay: var(--delay);
    transform-origin: center;
  }

  @keyframes particle-burst {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform:
        translate(
          calc(cos(var(--angle)) * 150px),
          calc(sin(var(--angle)) * 150px)
        )
        scale(0);
      opacity: 0;
    }
  }

  /* Flash effect */
  .ninja-slice-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    animation: flash 0.2s ease-out;
  }

  @keyframes flash {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
    }
  }
</style>
