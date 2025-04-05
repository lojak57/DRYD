<!-- Schedule Job Modal -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import Modal from '$lib/components/common/Modal.svelte';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher<{
    close: void;
    submit: { startDate: Date };
  }>();
  
  let selectedDate = job.scheduledStartDate || new Date();
  let error = '';
  
  function handleSubmit() {
    if (!selectedDate) {
      error = 'Please select a valid date';
      return;
    }
    
    // Ensure the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      error = 'Please select a future date';
      return;
    }
    
    dispatch('submit', { startDate: selectedDate });
  }
  
  function handleClose() {
    dispatch('close');
  }
</script>

<Modal on:close={handleClose}>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">Schedule Job</h2>
    
    <div class="mb-6">
      <label for="schedule-date" class="block text-sm font-medium text-gray-700 mb-1">
        Start Date
      </label>
      <input
        type="date"
        id="schedule-date"
        bind:value={selectedDate}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
      />
      {#if error}
        <p class="mt-1 text-sm text-red-600">{error}</p>
      {/if}
    </div>
    
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
        on:click={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-white bg-dryd-blue border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
        on:click={handleSubmit}
      >
        Schedule Job
      </button>
    </div>
  </div>
</Modal> 