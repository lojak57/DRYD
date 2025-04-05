<script lang="ts">
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let open: boolean = false;
  export let icon: string = "";
  export let headerClass: string = "bg-gray-100";
  export let contentClass: string = "";
  export let count: number | undefined = undefined;
  
  const dispatch = createEventDispatcher<{
    toggle: boolean;
  }>();
  
  function toggle() {
    open = !open;
    dispatch('toggle', open);
  }
</script>

<div class="overflow-hidden rounded-lg shadow border border-gray-200">
  <!-- Header -->
  <button 
    type="button"
    class="w-full flex items-center justify-between p-4 {headerClass} transition-colors duration-200"
    on:click={toggle}
  >
    <div class="flex items-center">
      {#if icon}
        <div class="mr-3">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon} />
          </svg>
        </div>
      {/if}
      <h2 class="font-bold text-xl">{title}</h2>
      {#if count !== undefined}
        <span class="ml-2 px-2 py-1 text-sm rounded-full bg-white/20">
          {count}
        </span>
      {/if}
    </div>
    
    <div class="flex items-center">
      <svg 
        class="w-5 h-5 transition-transform duration-200 {open ? 'rotate-180' : ''}" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>
  
  <!-- Content -->
  {#if open}
    <div transition:slide={{ duration: 300 }} class="p-6 {contentClass}">
      <slot />
    </div>
  {/if}
</div> 