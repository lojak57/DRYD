<script lang="ts">
  import type { LogEntry } from '$lib/types/LogEntry';
  import LogEntryCard from './LogEntryCard.svelte';
  import { fade } from 'svelte/transition';
  import AssignTechnicianForm from './AssignTechnicianForm.svelte';
  import { loadJobById } from '$lib/stores/jobStore';
  
  export let logEntries: LogEntry[] = [];
  export let isLoading: boolean = false;
  export let jobId: string;
  export let userId: string;
  
  let showAssignTechnician = false;
  
  async function handleTechnicianAssignment(event: CustomEvent) {
    const { assignedUserIds } = event.detail;
    console.log('Technicians assigned:', assignedUserIds);
    
    // Reload the job data to refresh the UI
    try {
      await loadJobById(jobId);
      // Add a success message or notification here if desired
    } catch (error) {
      console.error('Error reloading job data:', error);
    }
    
    showAssignTechnician = false;
  }
</script>

<style>
  .card-container {
    position: relative;
    will-change: opacity, transform;
  }
  
  .log-entries {
    position: relative;
    min-height: 50px; /* Provides space when list is empty but transitioning */
  }
</style>

<div class="activity-log-feed">
  <!-- Action buttons -->
  <div class="mb-4 flex flex-wrap gap-2">
    <button
      on:click={() => showAssignTechnician = true}
      class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Assign Technician
    </button>
  </div>
  
  {#if showAssignTechnician}
    <div class="mb-4" in:fade={{ duration: 200 }}>
      <AssignTechnicianForm
        {jobId}
        {userId}
        on:submit={handleTechnicianAssignment}
      />
    </div>
  {/if}
  
  {#if isLoading}
    <div class="py-10 flex justify-center">
      <div class="animate-pulse flex space-x-4 w-full max-w-lg">
        <div class="flex-1 space-y-6 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div class="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  {:else if logEntries.length === 0}
    <div class="py-10 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="flex flex-col items-center max-w-md mx-auto p-6">
        <div class="w-16 h-16 rounded-full bg-dryd-blue-light/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">No activities yet</h3>
        <p class="text-gray-500 text-sm">This job doesn't have any logged activities. Add notes, photos, readings, or equipment logs to track progress.</p>
        <div class="mt-6 text-sm text-dryd-blue">
          Click any of the buttons above to add your first activity log
        </div>
      </div>
    </div>
  {:else}
    <div class="log-entries space-y-3">
      {#each logEntries as entry (entry.id)}
        <div class="card-container" in:fade={{ duration: 300, delay: 50 }} out:fade={{ duration: 200 }}>
          <LogEntryCard logEntry={entry} />
        </div>
      {/each}
    </div>
  {/if}
</div> 