<script lang="ts">
  import type { CompletionTasks } from '$lib/types/Job';
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let tasks: CompletionTasks | undefined;
  export let jobId: string;
  
  const dispatch = createEventDispatcher<{
    taskClicked: { key: keyof CompletionTasks, action: string }
  }>();
  
  // Define the list of tasks with their keys, labels, and associated actions
  const taskList = [
    { key: 'finalReadingsLogged' as keyof CompletionTasks, label: 'Log Final Moisture Readings', action: 'reading' },
    { key: 'afterPhotosTaken' as keyof CompletionTasks, label: 'Upload "After" Photos', action: 'photo' },
    { key: 'mark_ready_for_review' as keyof CompletionTasks, label: 'Submit for Office Review', action: 'review' }
  ];
  
  // Handle clicking on a task
  function handleTaskClick(task: typeof taskList[0]) {
    console.log('Clicked task:', task.action, jobId);
    console.log('Current task status:', tasks);
    
    // For the "Submit for Office Review" task, check prerequisites
    if (task.key === 'mark_ready_for_review') {
      // Check if all prerequisite tasks are complete
      const prerequisitesMet = tasks ? 
        tasks.finalReadingsLogged === true && 
        tasks.afterPhotosTaken === true : false;
        
      console.log('Prerequisites met for mark_ready_for_review:', prerequisitesMet, tasks);
        
      if (!prerequisitesMet) {
        alert('Please complete all prerequisite tasks before submitting for review.');
        return;
      }
    }
    
    dispatch('taskClicked', { key: task.key, action: task.action });
  }

  // Also handle keyboard events for accessibility
  function handleKeyDown(event: KeyboardEvent, task: typeof taskList[0]) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTaskClick(task);
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
  <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    Pre-Completion Checklist
  </h3>
  
  <p class="text-sm text-gray-600 mb-4">
    Please complete the following tasks before marking this job as ready for completion.
  </p>
  
  <ul class="space-y-3">
    {#each taskList as task}
      <li>
        <button 
          type="button"
          class="w-full flex items-center p-3 border rounded-md transition-all duration-150 text-left {
            task.key === 'mark_ready_for_review' 
              ? (tasks?.finalReadingsLogged && tasks?.afterPhotosTaken 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed')
              : (tasks?.[task.key] 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-blue-200 bg-blue-50 hover:bg-blue-100')
          }"
          on:click={() => handleTaskClick(task)}
          on:keydown={(e) => handleKeyDown(e, task)}
          aria-pressed={tasks?.[task.key] || false}
          disabled={task.key === 'mark_ready_for_review' && 
                    !(tasks?.finalReadingsLogged && tasks?.afterPhotosTaken)}
        >
          {#if task.key === 'mark_ready_for_review'}
            {#if tasks?.finalReadingsLogged && tasks?.afterPhotosTaken}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {/if}
          {:else}
            {#if tasks && tasks[task.key]}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            {/if}
          {/if}
          <span class="{
            task.key === 'mark_ready_for_review'
              ? (tasks?.finalReadingsLogged && tasks?.afterPhotosTaken
                  ? 'text-green-800'
                  : 'text-gray-500')
              : (tasks?.[task.key]
                  ? 'text-green-800'
                  : 'text-blue-700')
          } font-medium">
            {task.label}
          </span>
          <!-- Render the completion status -->
          <div class="ml-auto text-sm font-medium {
            tasks && tasks[task.key] 
            ? 'text-green-600'
            : 'text-gray-400'
          }">
            {tasks && tasks[task.key] ? 'Complete' : 'Incomplete'}
          </div>
        </button>

        <!-- Show status for the "Submit for Office Review" button -->
        {#if task.key === 'mark_ready_for_review'}
          <div class="ml-2 text-xs {
            tasks 
            ? (tasks?.finalReadingsLogged && tasks?.afterPhotosTaken
              ? 'text-green-500'
              : 'text-amber-500')
            : 'text-gray-400'
          }">
            {tasks 
              ? (tasks?.finalReadingsLogged && tasks?.afterPhotosTaken
                ? '✓ Prerequisites met'
                : '! Complete prerequisites first')
              : 'Loading status...'}
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <!-- Conditional rendering for showing completion status -->
  {#if tasks?.finalReadingsLogged && tasks?.afterPhotosTaken}
    <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
      <p class="text-green-700 text-sm">
        <span class="font-semibold">✓ All tasks complete!</span> 
        You can now submit this job for office review.
      </p>
    </div>
  {/if}

  <button 
    class="mt-4 w-full py-2 px-4 rounded font-semibold text-white transition duration-150 ease-in-out {
      tasks 
      ? (tasks?.finalReadingsLogged && tasks?.afterPhotosTaken
        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        : 'bg-gray-400 cursor-not-allowed')
      : 'bg-gray-400 cursor-not-allowed'
    }"
  >
    Submit for Office Review
  </button>
</div> 