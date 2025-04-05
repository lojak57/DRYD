<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { onMount } from 'svelte';
  import { getUserById } from '$lib/services/users';
  import { formatCurrency } from '$lib/utils/formatters';
  import { getFullName } from '$lib/types/User';
  
  export let job: Job;
  export let onComplete: (laborData: { userId: string, hours: number }[]) => Promise<void>;
  export let onCancel: () => void;
  
  // State
  let laborHours: { [userId: string]: number } = {};
  let techDetails: { id: string, name: string }[] = [];
  let isLoading = false;
  let error = '';
  
  // Load technician details
  onMount(async () => {
    if (job.assignedUserIds && job.assignedUserIds.length > 0) {
      try {
        // Fetch details for each technician
        const techPromises = job.assignedUserIds.map(async (techId: string) => {
          const user = await getUserById(techId);
          return user ? { id: user.id, name: getFullName(user) || `Tech ${user.id}` } : null;
        });
        
        const results = await Promise.all(techPromises);
        techDetails = results.filter((tech): tech is { id: string, name: string } => tech !== null);
        
        // Initialize labor hours for each tech
        techDetails.forEach(tech => {
          laborHours[tech.id] = 0;
        });
      } catch (err) {
        console.error('Error loading technician details:', err);
        error = 'Failed to load technician details. Please try again.';
      }
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    isLoading = true;
    error = '';
    
    try {
      // Create array of labor data entries
      const laborData = Object.entries(laborHours)
        .map(([userId, hours]) => ({ userId, hours }))
        .filter(entry => entry.hours > 0);
      
      if (laborData.length === 0) {
        if (!confirm('No labor hours entered. Continue with job completion?')) {
          isLoading = false;
          return;
        }
      }
      
      // Call the completion handler
      await onComplete(laborData);
    } catch (err) {
      console.error('Error completing job:', err);
      error = 'Failed to complete job. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- Modal overlay -->
<div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
  <!-- Modal container -->
  <div class="bg-gray-100 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
    <!-- Modal header -->
    <div class="bg-dryd-gradient text-white px-6 py-4">
      <h2 class="text-xl font-bold">Finalize Job: {job.jobNumber}</h2>
    </div>
    
    <!-- Modal body -->
    <div class="p-6">
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      {/if}
      
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enter Labor Hours
        </h3>
        
        {#if techDetails.length === 0}
          <p class="text-gray-600 italic">No technicians assigned to this job.</p>
        {:else}
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="grid grid-cols-1 gap-4">
              {#each techDetails as tech}
                <div class="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200">
                  <div>
                    <p class="font-medium text-gray-800">{tech.name}</p>
                    <p class="text-sm text-gray-500">Tech ID: {tech.id}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <label for="hours-{tech.id}" class="text-sm font-medium text-gray-700">Hours:</label>
                    <input 
                      id="hours-{tech.id}"
                      type="number" 
                      min="0" 
                      step="0.5" 
                      bind:value={laborHours[tech.id]} 
                      class="w-20 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
                    />
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Equipment summary (optional) -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Equipment Summary
        </h3>
        
        {#if job.equipmentIds && job.equipmentIds.length > 0}
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-gray-800">{job.equipmentIds.length} piece{job.equipmentIds.length !== 1 ? 's' : ''} of equipment</p>
          </div>
        {:else}
          <p class="text-gray-600 italic">No equipment assigned to this job.</p>
        {/if}
      </div>
    </div>
    
    <!-- Modal footer -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
      <button 
        type="button" 
        on:click={onCancel}
        disabled={isLoading}
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Cancel
      </button>
      <button 
        type="button" 
        on:click={handleSubmit}
        disabled={isLoading}
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {#if isLoading}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        {:else}
          Confirm Completion & Submit Labor
        {/if}
      </button>
    </div>
  </div>
</div> 