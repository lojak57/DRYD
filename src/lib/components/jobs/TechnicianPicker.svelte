<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { getTechnicians } from '$lib/services/users';
  import mockUsers from '$lib/mock/users.json'; // Direct import for troubleshooting
  
  export let job: Job;
  
  const dispatch = createEventDispatcher<{
    submit: { assignedUserIds: string[] };
    complete: { assignedUserIds: string[] };
    cancel: void;
  }>();
  
  let technicians: User[] = [];
  let selectedTechnicians: string[] = job.assignedUserIds ? [...job.assignedUserIds] : [];
  let isLoading = true;
  let loadError: string | null = null;
  
  // Toggle technician selection
  function toggleTechnician(techId: string) {
    console.log('Toggling technician selection:', techId);
    if (selectedTechnicians.includes(techId)) {
      selectedTechnicians = selectedTechnicians.filter(id => id !== techId);
    } else {
      selectedTechnicians = [...selectedTechnicians, techId];
    }
    console.log('Selected technicians now:', selectedTechnicians);
  }
  
  // Load technicians on component mount
  onMount(async () => {
    console.log('TechnicianPicker: Loading technicians...');
    isLoading = true;
    try {
      // Try loading from the service
      const techsFromService = await getTechnicians();
      
      if (techsFromService && techsFromService.length > 0) {
        technicians = techsFromService;
        console.log('Loaded technicians from service:', technicians);
      } else {
        console.log('No technicians returned from service, falling back to direct mock data');
        // If service fails, fall back to direct access
        technicians = mockUsers.filter(
          user => (user.role === 'TECH' || user.role === 'TECHNICIAN') && user.isActive
        ).map(tech => ({
          ...tech,
          createdAt: new Date(tech.createdAt)
        }));
        console.log('Loaded technicians from mock data:', technicians);
      }
    } catch (err) {
      console.error('Error loading technicians:', err);
      loadError = 'Failed to load technicians. Please try again.';
      
      // Final fallback - use hardcoded data
      technicians = [
        {
          id: "tech-01",
          firstName: "Taylor",
          lastName: "Smith",
          email: "taylor@dryadrestoration.com",
          role: "TECHNICIAN",
          isActive: true,
          phoneNumber: "503-555-2222",
          createdAt: new Date("2023-01-20T09:30:00Z")
        },
        {
          id: "tech-02",
          firstName: "Jordan",
          lastName: "Chen",
          email: "jordan@dryadrestoration.com",
          role: "TECHNICIAN",
          isActive: true,
          phoneNumber: "503-555-3333",
          createdAt: new Date("2023-02-10T10:15:00Z")
        },
        {
          id: "tech-03",
          firstName: "Casey",
          lastName: "Johnson",
          email: "casey@dryadrestoration.com",
          role: "TECHNICIAN",
          isActive: true,
          phoneNumber: "503-555-4444",
          createdAt: new Date("2023-03-05T11:45:00Z")
        }
      ];
      console.log('Loaded hardcoded technicians:', technicians);
    } finally {
      isLoading = false;
    }
  });
  
  // Handle form submission
  function handleSubmit() {
    console.log('TechnicianPicker - Completing task with selected technicians:', selectedTechnicians);
    
    // Dispatch both events for compatibility with different parent components
    const data = { assignedUserIds: selectedTechnicians };
    console.log('Dispatching complete event with data:', data);
    
    // First dispatch the 'submit' event (older style)
    dispatch('submit', data);
    
    // Then dispatch the 'complete' event (new style)
    dispatch('complete', data);
  }
  
  function handleCancel() {
    console.log('TechnicianPicker - Canceling');
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  {#if isLoading}
    <div class="py-4 flex justify-center">
      <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else if loadError}
    <div class="py-4 text-red-500 text-center">
      {loadError}
      <button class="block mx-auto mt-2 text-blue-500 underline" on:click={() => window.location.reload()}>
        Reload page
      </button>
    </div>
  {:else}
    <div class="py-2">
      <h3 class="font-medium text-gray-800 mb-3">Available Technicians ({technicians.length})</h3>
      {#if technicians.length === 0}
        <p class="text-gray-500 text-center py-2">No technicians available</p>
        <button class="block mx-auto mt-2 text-blue-500 underline" on:click={() => window.location.reload()}>
          Reload page
        </button>
      {:else}
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#each technicians as tech}
            <button 
              type="button"
              class="w-full flex items-center p-4 rounded-lg border-2 transition-all duration-150 ease-in-out {selectedTechnicians.includes(tech.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'}"
              on:click={() => toggleTechnician(tech.id)}
            >
              <!-- Tech Avatar -->
              <div class="flex-shrink-0 mr-4">
                <div class="h-12 w-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-lg font-semibold">
                  {tech.firstName.charAt(0)}{tech.lastName.charAt(0)}
                </div>
              </div>
              
              <!-- Tech Info -->
              <div class="flex-1">
                <div class="font-medium text-gray-900">{tech.firstName} {tech.lastName}</div>
                <div class="text-sm text-gray-500">{tech.email}</div>
              </div>
              
              <!-- Selection Indicator -->
              <div class="flex-shrink-0 ml-4">
                {#if selectedTechnicians.includes(tech.id)}
                  <div class="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                {:else}
                  <div class="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
        
        <div class="mt-4 text-sm text-gray-600">
          <p>Selected: {selectedTechnicians.length} technician{selectedTechnicians.length !== 1 ? 's' : ''}</p>
        </div>
      {/if}
    </div>
  {/if}
  
  <div class="mt-6 flex justify-end space-x-3">
    <button 
      type="button" 
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      on:click={handleCancel}
    >
      Cancel
    </button>
    
    <button 
      type="submit" 
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={isLoading || selectedTechnicians.length === 0}
    >
      {selectedTechnicians.length === 0 ? 'Select Technicians' : 'Complete Task'}
    </button>
  </div>
</form> 