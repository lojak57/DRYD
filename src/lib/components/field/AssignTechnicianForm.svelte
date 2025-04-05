<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '$lib/types/User';
  import { getTechnicians } from '$lib/services/users';
  import { updateJob } from '$lib/services/jobs';
  import { LogEntryType } from '$lib/types/LogEntry';
  import { addLogEntry } from '$lib/services/logEntries';
  import { getFullName } from '$lib/types/User';
  
  export let jobId: string;
  export let userId: string;
  
  let technicians: User[] = [];
  let selectedTechnicians: string[] = [];
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let isLoading = true;
  
  // Load technicians on mount
  async function loadTechnicians() {
    try {
      // Use the dedicated technician loading function
      technicians = await getTechnicians();
      console.log('Loaded technicians:', technicians);
    } catch (err) {
      console.error('Error loading technicians:', err);
      errorMessage = 'Failed to load technicians. Please try again.';
    } finally {
      isLoading = false;
    }
  }
  
  // Initialize on mount
  loadTechnicians();
  
  const dispatch = createEventDispatcher<{
    submit: { assignedUserIds: string[] };
  }>();
  
  async function handleSubmit() {
    if (selectedTechnicians.length === 0) {
      errorMessage = 'Please select at least one technician';
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';
    
    console.log("AssignTechnicianForm - handleSubmit - jobId:", jobId);
    
    try {
      // Update the job with new assigned technicians
      const updatedJob = await updateJob(jobId, {
        assignedUserIds: selectedTechnicians
      });
      
      if (!updatedJob) {
        throw new Error('Failed to update job with technician assignments');
      }
      
      console.log('Updated job with technicians:', updatedJob);
      
      // Create a log entry for the assignment
      const logEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: LogEntryType.NOTE,
        content: {
          notes: `Assigned technicians: ${selectedTechnicians.map(id => 
            getFullName(technicians.find(t => t.id === id) as User) || id
          ).join(', ')}`
        }
      });
      
      console.log('Created log entry for technician assignment:', logEntry);
      
      // Show success message
      successMessage = 'Technicians successfully assigned to this job';
      
      // Dispatch the assignment to the parent component only once
      dispatch('submit', { assignedUserIds: selectedTechnicians });
      
      // Clear selection after success (but keep it visible)
      setTimeout(() => {
        selectedTechnicians = [];
      }, 2000);
    } catch (err) {
      console.error('Error assigning technicians:', err);
      errorMessage = 'Failed to assign technicians. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Assign Technicians</h3>
  
  {#if isLoading}
    <div class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
    </div>
  {:else if errorMessage}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {errorMessage}
    </div>
  {:else if successMessage}
    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
      {successMessage}
    </div>
  {:else if technicians.length === 0}
    <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
      No active technicians found. Please make sure technicians are properly set up in the system.
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Technicians</label>
        <div class="space-y-2">
          {#each technicians as tech}
            <label class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
              <input
                type="checkbox"
                value={tech.id}
                bind:group={selectedTechnicians}
                class="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                disabled={isSubmitting}
              >
              <span class="text-gray-700">{getFullName(tech)}</span>
            </label>
          {/each}
        </div>
      </div>
      
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || selectedTechnicians.length === 0}
          class="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isSubmitting}
            <span class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Assigning...
            </span>
          {:else}
            Assign Technicians
          {/if}
        </button>
      </div>
    </form>
  {/if}
</div> 