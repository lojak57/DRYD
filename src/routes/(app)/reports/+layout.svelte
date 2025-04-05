<script lang="ts">
  import { page } from '$app/stores';
  
  // Report menu items
  const reportMenuItems = [
    { path: '/reports', label: 'Dashboard', icon: 'chart-bar' },
    { path: '/reports/financial', label: 'Financial', icon: 'cash' },
    // More report types can be added later
  ];
  
  // Check if a menu item is active
  function isActive(path: string): boolean {
    return $page.url.pathname === path;
  }
</script>

<!-- Report section submenu -->
<div class="bg-white border-b shadow-sm mb-6">
  <div class="container mx-auto px-4">
    <div class="flex overflow-x-auto py-2 space-x-4">
      {#each reportMenuItems as item}
        <a 
          href={item.path}
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors {isActive(item.path) ? 'bg-dryd-blue text-white' : 'text-gray-600 hover:bg-gray-100'}"
        >
          {#if item.icon === 'chart-bar'}
            <!-- Chart bar icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          {:else if item.icon === 'cash'}
            <!-- Cash/money icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          {/if}
          {item.label}
        </a>
      {/each}
    </div>
  </div>
</div>

<slot /> 