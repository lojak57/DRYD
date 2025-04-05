<script lang="ts">
  export let title: string;
  export let backUrl: string | null = null;
</script>

<div class="flex items-center mb-4">
  {#if backUrl}
    <a href={backUrl} class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
  {/if}
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
</div> 