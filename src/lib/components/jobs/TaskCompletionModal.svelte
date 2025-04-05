<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AddNoteForm from '$lib/components/field/AddNoteForm.svelte';
  import AddPhotoForm from '$lib/components/field/AddPhotoForm.svelte';
  import AddReadingForm from '$lib/components/field/AddReadingForm.svelte';
  import AddEquipmentLogForm from '$lib/components/field/AddEquipmentLogForm.svelte';
  import AssignTechnicianForm from '$lib/components/field/AssignTechnicianForm.svelte';
  
  // Props
  export let jobId: string;
  export let userId: string;
  export let action: 'note' | 'photo' | 'reading' | 'equipment' | 'schedule_job' | 'assign_technician';
  export let taskKey: string;
  export let isOpen = false;
  
  // Debug props
  $: console.log('TaskCompletionModal - Props:', { jobId, userId, action, taskKey, isOpen });
  
  // State
  let isLoading = false;
  let error = '';
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    close: void;
    complete: { taskKey: string, completed: boolean, scheduledStartDate?: string };
  }>();
  
  // Helper function to get title based on action
  function getTitle(): string {
    console.log('TaskCompletionModal - Getting title for action:', action);
    switch (action) {
      case 'reading':
        return 'Log Final Moisture Readings';
      case 'photo':
        return 'Upload "After" Photos';
      case 'assign_technician':
        return 'Assign Technicians';
      case 'note':
      default:
        return 'Add Note';
    }
  }
  
  // Handle form submission
  function handleFormSubmit(event: CustomEvent) {
    const logEntry = event.detail;
    console.log('TaskCompletionModal - Form submitted:', logEntry, 'taskKey:', taskKey);
    
    if (action === 'schedule_job') {
      // Special handling for schedule_job task
      const scheduledStartDate = logEntry.content?.scheduledStartDate;
      if (scheduledStartDate) {
        console.log('Schedule job task completed with date:', scheduledStartDate);
        dispatch('complete', { 
          taskKey, 
          completed: true,
          scheduledStartDate
        });
      }
    } else if (action === 'assign_technician') {
      // Special handling for assign_technician task
      const { assignedUserIds } = logEntry;
      console.log('Assign technician task with techs:', assignedUserIds);
      
      if (assignedUserIds && assignedUserIds.length > 0) {
        console.log('Assign technician task completed with technicians:', assignedUserIds);
        
        // For technician assignment, we need to make sure the task is marked as completed
        // and also update the UI to reflect the changes
        setTimeout(() => {
          dispatch('complete', { taskKey, completed: true });
        }, 500); // Add a slight delay to ensure data is updated
      }
    } else {
      // Normal task completion
      console.log('TaskCompletionModal - Completing task:', taskKey);
      dispatch('complete', { taskKey, completed: true });
    }
    
    // Close the modal
    dispatch('close');
  }
  
  // Close modal
  function closeModal() {
    console.log('TaskCompletionModal - Closing modal');
    dispatch('close');
  }
</script>

<!-- Modal overlay -->
{#if isOpen}
  <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <!-- Modal container -->
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
      <!-- Modal header -->
      <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-bold">{getTitle()}</h2>
        <button 
          on:click={closeModal}
          class="text-white hover:text-gray-200 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal body -->
      <div class="p-6">
        {#if error}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        {/if}
        
        <div class="mb-4">
          <p class="text-gray-600 mb-4">
            Complete this task to mark it as done on your checklist. This will be logged in the activity feed.
          </p>
          
          {#if action === 'reading'}
            <AddReadingForm 
              jobId={jobId} 
              userId={userId} 
              on:submit={handleFormSubmit}
            />
          {:else if action === 'photo'}
            <AddPhotoForm 
              jobId={jobId} 
              userId={userId}
              on:newLogEntry={handleFormSubmit}
            />
          {:else if action === 'assign_technician'}
            <AssignTechnicianForm 
              jobId={jobId} 
              userId={userId}
              on:submit={handleFormSubmit}
            />
          {:else}
            <AddNoteForm 
              jobId={jobId} 
              userId={userId}
              on:newLogEntry={handleFormSubmit}
            />
          {/if}
        </div>
        
        <!-- Modal footer -->
        <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
          <button
            on:click={closeModal}
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if} 