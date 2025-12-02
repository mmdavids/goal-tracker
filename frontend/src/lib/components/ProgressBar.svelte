<script lang="ts">
  export let progress: number = 0;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: displayProgress = Math.max(progress, 0);
  $: barWidth = Math.min(displayProgress, 100); // Cap visual width at 100%
  $: colorClass =
    progress >= 100
      ? 'bg-purple-500'
      : progress >= 75
        ? 'bg-green-500'
        : progress >= 50
          ? 'bg-yellow-500'
          : progress >= 25
            ? 'bg-blue-500'
            : 'bg-gray-400';

  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
</script>

<div class="w-full bg-gray-200 rounded-full overflow-hidden {heightMap[size]}">
  <div
    class="h-full transition-all duration-500 ease-out {colorClass}"
    style="width: {barWidth}%"
  />
</div>

<style>
  /* Tailwind-like styles inline for simplicity */
</style>
