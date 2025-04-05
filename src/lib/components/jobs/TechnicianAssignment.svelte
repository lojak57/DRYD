<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getTechnicians } from '$lib/services/users';
  import type { User } from '$lib/types/User';
  import type { Job } from '$lib/types/Job';
  import { isOffice } from '$lib/types/User';
  import { currentUser } from '$lib/stores/authStore';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher();
  let technicians: User[] = [];
  let selectedTechIds: string[] = [];
  let isLoading = true;
  let error = '';
  let searchQuery = '';
  
  // Initialize the selected technicians based on the job
  $: if (job && job.assignedUserIds) {
    selectedTechIds = [...job.assignedUserIds];
  }
  
  // Filter technicians based on search query
  $: filteredTechnicians = technicians.filter(tech => {
    if (!searchQuery.trim()) return true;
    
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  
  // Load technicians on mount
  onMount(async () => {
    try {
      technicians = await getTechnicians();
      isLoading = false;
    } catch (err) {
      console.error('Error loading technicians:', err);
      error = 'Failed to load technicians';
      isLoading = false;
    }
  });
  
  // Function to toggle selection of a technician
  function toggleTechnician(techId: string) {
    if (selectedTechIds.includes(techId)) {
      selectedTechIds = selectedTechIds.filter(id => id !== techId);
    } else {
      selectedTechIds = [...selectedTechIds, techId];
    }
  }
  
  // Function to save technician assignments
  function saveAssignments() {
    dispatch('save', { assignedUserIds: selectedTechIds });
  }
</script>

<div class="bg-gray-100 rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
  <h2 class="text-lg font-medium text-gray-900 mb-4">Assign Technicians</h2>
  
  {#if isLoading}
    <div class="flex justify-center items-center py-4">
      <svg class="animate-spin h-5 w-5 text-dryd-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else if error}
    <div class="text-red-500 mb-4">{error}</div>
  {:else if technicians.length === 0}
    <p class="text-gray-500 mb-4">No technicians available.</p>
  {:else}
    <!-- Search field -->
    <div class="mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input 
          type="search" 
          bind:value={searchQuery}
          class="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
          placeholder="Search technicians..." 
        />
      </div>
    </div>
  
    <!-- Selected count display -->
    <div class="mb-3 text-sm text-gray-500">
      {selectedTechIds.length} technician{selectedTechIds.length !== 1 ? 's' : ''} selected
    </div>
    
    <div class="space-y-2 mb-4 max-h-60 overflow-y-auto">
      {#each filteredTechnicians as tech}
        <div class="flex items-center p-2 hover:bg-gray-50 rounded">
          <input 
            type="checkbox" 
            id="tech-{tech.id}" 
            class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
            checked={selectedTechIds.includes(tech.id)}
            on:change={() => toggleTechnician(tech.id)}
          >
          <label for="tech-{tech.id}" class="ml-2 block text-sm text-gray-900">
            {tech.firstName} {tech.lastName}
          </label>
        </div>
      {/each}
      
      {#if filteredTechnicians.length === 0}
        <div class="text-gray-500 italic p-2">No technicians match your search.</div>
      {/if}
    </div>
    
    <div class="flex justify-end">
      <button 
        type="button" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        on:click={saveAssignments}
      >
        Save Assignments
      </button>
    </div>
  {/if}
</div> 