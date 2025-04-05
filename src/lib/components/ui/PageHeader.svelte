<script lang="ts">
  import { goto } from '$app/navigation';
  
  export let title: string;
  export let subtitle: string | undefined = undefined;
  export let back: string | undefined = undefined;
  
  function goBack() {
    if (back) {
      goto(back);
    }
  }
</script>

<div class="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-gray-100">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div class="flex items-center">
      {#if back}
        <button
          on:click={goBack}
          class="mr-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      {/if}
      
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
        {#if subtitle}
          <p class="mt-1 text-sm text-gray-500">{subtitle}</p>
        {/if}
      </div>
    </div>
    
    <div class="mt-4 sm:mt-0">
      <slot name="actions" />
    </div>
  </div>
</div> 