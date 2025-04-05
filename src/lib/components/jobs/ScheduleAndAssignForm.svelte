<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '$lib/types/User';
  import type { Job } from '$lib/types/Job';
  import { getTechnicians } from '$lib/services/users';
  import { getFullName } from '$lib/types/User';
  
  export let job: Job;
  
  // Form state
  let step = 1; // 1: Select Technicians, 2: Schedule Date
  let technicians: User[] = [];
  let selectedTechnicians: string[] = [];
  let startDate = job.scheduledStartDate ? new Date(job.scheduledStartDate).toISOString().split('T')[0] : '';
  let estimatedCompletionDate = job.estimatedCompletionDate ? new Date(job.estimatedCompletionDate).toISOString().split('T')[0] : '';
  
  // UI state
  let isLoading = true;
  let error = '';
  let searchQuery = '';
  
  // Get today's date formatted for min attribute
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }
  
  // Get tomorrow's date for default scheduling
  function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Get default completion date (2 weeks from tomorrow)
  function getDefaultCompletionDate() {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  }
  
  // Set default dates if needed
  function setDefaultDates() {
    if (!startDate) {
      startDate = getTomorrow();
    }
    
    if (!estimatedCompletionDate) {
      estimatedCompletionDate = getDefaultCompletionDate();
    }
  }
  
  // Filter technicians based on search query
  $: filteredTechnicians = technicians.filter(tech => {
    if (!searchQuery.trim()) return true;
    
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  
  // Load technicians on mount
  async function loadTechnicians() {
    try {
      technicians = await getTechnicians();
      isLoading = false;
      
      // Initialize selected technicians if job already has them
      if (job && job.assignedUserIds && job.assignedUserIds.length > 0) {
        selectedTechnicians = [...job.assignedUserIds];
      }
    } catch (err) {
      console.error('Error loading technicians:', err);
      error = 'Failed to load technicians';
      isLoading = false;
    }
  }
  
  // Initialize component
  loadTechnicians();
  setDefaultDates();
  
  // Function to toggle selection of a technician
  function toggleTechnician(techId: string) {
    if (selectedTechnicians.includes(techId)) {
      selectedTechnicians = selectedTechnicians.filter(id => id !== techId);
    } else {
      selectedTechnicians = [...selectedTechnicians, techId];
    }
  }
  
  // Validate current step
  function validateCurrentStep(): boolean {
    if (step === 1) {
      // Validate technician selection
      if (selectedTechnicians.length === 0) {
        error = 'Please select at least one technician';
        return false;
      }
      return true;
    } else if (step === 2) {
      // Validate scheduling
      if (!startDate) {
        error = 'Please select a start date';
        return false;
      }
      
      // Validate date sequence if both dates are provided
      if (startDate && estimatedCompletionDate) {
        const start = new Date(startDate);
        const end = new Date(estimatedCompletionDate);
        
        if (start > end) {
          error = 'Estimated completion date must be after start date';
          return false;
        }
      }
      
      return true;
    }
    
    return false; // Shouldn't reach here
  }
  
  // Move to next step
  function nextStep() {
    if (validateCurrentStep()) {
      error = '';
      step++;
    }
  }
  
  // Go back to previous step
  function prevStep() {
    error = '';
    step--;
  }
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: { assignedUserIds: string[], scheduledStartDate: string, estimatedCompletionDate?: string };
    cancel: void;
  }>();
  
  // Submit form data
  function handleSubmit() {
    if (!validateCurrentStep()) {
      return;
    }
    
    // Dispatch data to parent
    dispatch('submit', {
      assignedUserIds: selectedTechnicians,
      scheduledStartDate: startDate,
      estimatedCompletionDate: estimatedCompletionDate || undefined
    });
  }
  
  // Cancel form
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
  <h2 class="text-xl font-semibold mb-4">
    {step === 1 ? 'Step 1: Assign Technicians' : 'Step 2: Schedule Job'}
  </h2>

  {#if error}
    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {error}
    </div>
  {/if}
  
  {#if isLoading}
    <div class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <!-- Step 1: Technician Selection -->
    {#if step === 1}
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
            class="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search technicians..." 
          />
        </div>
      </div>

      <!-- Selected count display -->
      <div class="mb-3 text-sm text-gray-500">
        {selectedTechnicians.length} technician{selectedTechnicians.length !== 1 ? 's' : ''} selected
      </div>
      
      <!-- Technician list -->
      <div class="border border-gray-200 rounded-md mb-6">
        <div class="max-h-60 overflow-y-auto p-2 space-y-1">
          {#if technicians.length === 0}
            <div class="p-4 text-gray-500 text-center">No technicians available</div>
          {:else if filteredTechnicians.length === 0}
            <div class="p-4 text-gray-500 text-center">No technicians match your search</div>
          {:else}
            {#each filteredTechnicians as tech}
              <!-- Make entire row clickable with increased hit area -->
              <div 
                class="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer {selectedTechnicians.includes(tech.id) ? 'bg-blue-50' : ''}"
                on:click={() => toggleTechnician(tech.id)}
                on:keydown={(e) => e.key === 'Enter' && toggleTechnician(tech.id)}
                tabindex="0"
                role="button"
              >
                <div class="flex items-center w-full">
                  <input 
                    type="checkbox" 
                    id="tech-{tech.id}" 
                    class="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    checked={selectedTechnicians.includes(tech.id)}
                    on:click|stopPropagation={(e) => {
                      toggleTechnician(tech.id);
                      e.preventDefault();
                    }}
                  />
                  <span class="ml-3 block text-sm font-medium text-gray-900 flex-1">
                    {tech.firstName} {tech.lastName}
                  </span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    
    <!-- Step 2: Scheduling -->
    {:else if step === 2}
      <div class="space-y-4">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            id="startDate"
            bind:value={startDate}
            min={getToday()}
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <p class="mt-1 text-xs text-gray-500">When will work begin?</p>
        </div>
        
        <div>
          <label for="estimatedCompletionDate" class="block text-sm font-medium text-gray-700 mb-1">Estimated Completion Date</label>
          <input 
            type="date" 
            id="estimatedCompletionDate"
            bind:value={estimatedCompletionDate}
            min={startDate || getToday()}
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <p class="mt-1 text-xs text-gray-500">When do you expect the job to be completed?</p>
        </div>
      </div>
    {/if}
  {/if}
  
  <!-- Navigation buttons -->
  <div class="mt-6 flex justify-between">
    {#if step === 1}
      <button 
        type="button" 
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        on:click={handleCancel}
      >
        Cancel
      </button>
      
      <button 
        type="button" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={nextStep}
        disabled={selectedTechnicians.length === 0}
      >
        Next: Schedule Job
      </button>
    {:else if step === 2}
      <button 
        type="button" 
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        on:click={prevStep}
      >
        Back
      </button>
      
      <button 
        type="button" 
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={handleSubmit}
        disabled={!startDate}
      >
        Complete Scheduling
      </button>
    {/if}
  </div>
</div> 