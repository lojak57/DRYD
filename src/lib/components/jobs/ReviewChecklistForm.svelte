<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { LogEntry } from '$lib/types/LogEntry';
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { MoistureReadingData, PhotoData } from '$lib/types/LogEntry';
  
  export let job: Job;
  export let logEntries: LogEntry[] = [];
  
  console.log('ReviewChecklistForm - logEntries received:', logEntries);
  
  const dispatch = createEventDispatcher<{
    submit: { approved: boolean; reviewNotes: string };
    cancel: void;
  }>();
  
  // Form state
  let reviewNotes = '';
  let readingsReviewed = false;
  let photosReviewed = false;
  
  // Filter log entries by type
  $: moistureReadings = logEntries
    .filter((entry) => entry.type === 'MOISTURE_READING')
    .map((entry) => {
      const content = entry.content as MoistureReadingData;
      return {
        location: content.location,
        material: content.material,
        value: content.value,
        timestamp: entry.timestamp
      };
    });
    
  console.log('ReviewChecklistForm - moistureReadings:', moistureReadings);

  $: photos = logEntries
    .filter((entry) => entry.type === 'PHOTO')
    .filter((entry) => (entry.content as PhotoData)?.tags?.includes('after'))
    .map((entry) => {
      const content = entry.content as PhotoData;
      return {
        url: content.url,
        caption: content.caption,
        tags: content.tags
      };
    });
    
  console.log('ReviewChecklistForm - photos:', photos);
  
  // Check if all sections are reviewed
  $: allReviewed = readingsReviewed && photosReviewed;
  
  function handleSubmit() {
    dispatch('submit', {
      approved: true,
      reviewNotes
    });
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-3">Review Technician Checklist</h3>
    <p class="text-gray-500 mb-4">Please review the technician's work to ensure all required tasks have been completed properly.</p>
    
    <!-- Moisture Readings Section -->
    <div class="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">
          <input 
            id="readings-checkbox" 
            type="checkbox" 
            bind:checked={readingsReviewed}
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
          />
        </div>
        <div class="ml-3 w-full">
          <label for="readings-checkbox" class="block text-sm font-medium text-gray-700">Moisture Readings</label>
          <p class="text-xs text-gray-500 mt-1">Review final moisture readings to ensure they're within acceptable levels</p>
          
          <!-- Summary of readings -->
          <div class="mt-3 text-sm bg-white rounded p-2 border border-gray-200">
            {#if moistureReadings.length > 0}
              <p class="font-medium">{moistureReadings.length} moisture reading{moistureReadings.length === 1 ? '' : 's'} recorded</p>
              <ul class="list-disc list-inside mt-1 space-y-1">
                {#each moistureReadings.slice(0, 3) as entry}
                  <li class="text-gray-600">{entry.location}: {entry.value}%</li>
                {/each}
                {#if moistureReadings.length > 3}
                  <li class="text-gray-500 italic">...and {moistureReadings.length - 3} more</li>
                {/if}
              </ul>
            {:else}
              <p class="text-red-500">No moisture readings recorded!</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Photos Section -->
    <div class="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div class="flex items-start">
        <div class="flex-shrink-0 mt-0.5">
          <input 
            id="photos-checkbox" 
            type="checkbox"
            bind:checked={photosReviewed} 
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
          />
        </div>
        <div class="ml-3 w-full">
          <label for="photos-checkbox" class="block text-sm font-medium text-gray-700">"After" Photos</label>
          <p class="text-xs text-gray-500 mt-1">Verify that "after" photos were taken to document the completed work</p>
          
          <!-- Summary of photos -->
          <div class="mt-3 text-sm bg-white rounded p-2 border border-gray-200">
            {#if photos.length > 0}
              <p class="font-medium">{photos.length} photo{photos.length === 1 ? '' : 's'} uploaded</p>
              <div class="mt-2 flex flex-wrap gap-2">
                {#each photos.slice(0, 3) as entry}
                  {#if entry.caption}
                    <div class="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                      {entry.caption}
                    </div>
                  {/if}
                {/each}
              </div>
            {:else}
              <p class="text-red-500">No photos uploaded!</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Review Notes -->
    <div class="mt-6">
      <label for="reviewNotes" class="block text-sm font-medium text-gray-700">Review Notes</label>
      <div class="mt-1">
        <textarea
          id="reviewNotes"
          rows="3"
          bind:value={reviewNotes}
          class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Enter any notes about your review"
        ></textarea>
      </div>
    </div>
  </div>
  
  <!-- Form Actions -->
  <div class="pt-5 border-t border-gray-200 mt-8 flex justify-end space-x-3">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      Cancel
    </button>
    
    <button
      on:click={handleSubmit}
      disabled={!allReviewed}
      class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
      class:bg-blue-600={allReviewed}
      class:hover:bg-blue-700={allReviewed}
      class:text-white={allReviewed}
      class:bg-gray-300={!allReviewed}
      class:text-gray-500={!allReviewed}
      class:cursor-not-allowed={!allReviewed}
    >
      Approve Checklist
    </button>
  </div>
</div> 