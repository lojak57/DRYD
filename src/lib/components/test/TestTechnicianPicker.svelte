<script lang="ts">
  // No imports to avoid any dependency issues
  import { createEventDispatcher } from 'svelte';
  
  // Define technician interface
  interface Technician {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  
  // Define hardcoded test data
  const TECH_DATA: Technician[] = [
    {
      id: "tech-01",
      firstName: "Taylor",
      lastName: "Smith",
      email: "taylor@dryadrestoration.com"
    },
    {
      id: "tech-02",
      firstName: "Jordan",
      lastName: "Chen",
      email: "jordan@dryadrestoration.com"
    },
    {
      id: "tech-03",
      firstName: "Casey",
      lastName: "Johnson",
      email: "casey@dryadrestoration.com"
    }
  ];
  
  export let selectedIds: string[] = [];
  
  // Basic event dispatch
  const dispatch = createEventDispatcher<{
    change: string[]
  }>();
  
  function toggleSelection(id: string): void {
    console.log('Toggle selection for:', id);
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
    console.log('Selected IDs:', selectedIds);
    dispatch('change', selectedIds);
  }
</script>

<div class="technician-picker p-4 border rounded-lg">
  <h2 class="text-lg font-bold mb-3">Test Technician Picker</h2>
  
  <div class="mb-3">
    <p class="text-sm text-gray-500">This is a test component to debug technician selection.</p>
  </div>
  
  <div class="space-y-2 max-h-64 overflow-y-auto">
    {#each TECH_DATA as tech}
      <div 
        class="flex items-center p-3 rounded-md border
              {selectedIds.includes(tech.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'} 
              cursor-pointer hover:bg-blue-50 transition-colors"
        on:click={() => toggleSelection(tech.id)}
        on:keydown={(e) => e.key === 'Enter' && toggleSelection(tech.id)}
        role="checkbox"
        aria-checked={selectedIds.includes(tech.id)}
        tabindex="0"
      >
        <div class="flex-shrink-0 mr-3">
          <div class="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-lg font-semibold">
            {tech.firstName.charAt(0)}{tech.lastName.charAt(0)}
          </div>
        </div>
        <div class="flex-1">
          <div class="font-medium">{tech.firstName} {tech.lastName}</div>
          <div class="text-sm text-gray-500">{tech.email}</div>
        </div>
        <div class="flex-shrink-0 ml-2">
          {#if selectedIds.includes(tech.id)}
            <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          {:else}
            <div class="h-5 w-5 border-2 border-gray-300 rounded-sm"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="mt-4 text-sm text-gray-600">
    <p>Selected: {selectedIds.length} technicians</p>
  </div>
</div> 