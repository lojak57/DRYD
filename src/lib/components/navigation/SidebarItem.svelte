<script lang="ts">
  import { page } from '$app/stores';
  
  export let href: string;
  export let icon: string;
  export let label: string;
  
  // Check if the item is active based on the current URL
  $: isActive = $page.url.pathname.startsWith(href);
  
  // Track if submenu is expanded (for those with child items)
  let expanded = isActive;
</script>

<div class="sidebar-item">
  <a 
    {href}
    class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 
    {isActive 
      ? 'bg-indigo-50 text-indigo-600' 
      : 'text-gray-700 hover:bg-gray-100'}"
  >
    {#if icon}
      <span class="mr-3 text-gray-500">
        <!-- Heroicon placeholder - you can replace with actual icons or import a library -->
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </span>
    {/if}
    <span>{label}</span>
    
    {#if $$slots.default}
      <button 
        class="ml-auto focus:outline-none" 
        on:click|preventDefault={() => expanded = !expanded}
      >
        <svg 
          class="h-4 w-4 transition-transform duration-150 {expanded ? 'transform rotate-90' : ''}" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}
  </a>
  
  {#if $$slots.default && expanded}
    <div class="ml-8 mt-1 space-y-1">
      <slot />
    </div>
  {/if}
</div> 