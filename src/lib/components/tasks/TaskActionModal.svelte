<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { WorkflowTask } from '$lib/config/workflowConfig';
  import type { LogEntry } from '$lib/types/LogEntry';
  import ReviewChecklistForm from '../jobs/ReviewChecklistForm.svelte';
  // ... existing imports ...
  
  export let job: Job;
  export let task: WorkflowTask;
  export let onComplete: (task: string, data?: any) => void;
  export let logEntries: LogEntry[] = [];
  
  console.log('TaskActionModal - logEntries received:', logEntries);
  console.log('TaskActionModal - task:', task);
  
  const dispatch = createEventDispatcher();
  let currentStep: string = 'confirmation';
  
  // ... existing code ...
  
  function handleCompleteChecklist() {
    // ... existing code ...
    onComplete(task.id);
    dispatch('close');
  }
  
  // ... existing code ...
</script>

{#if currentStep === 'review_checklist'}
  <ReviewChecklistForm 
    {job} 
    {logEntries}
    on:submit={handleCompleteChecklist} 
    on:cancel={() => currentStep = 'confirmation'} 
  />
{/if}

{#if formFields && formFields.length > 0}
  <form on:submit|preventDefault={handleFormSubmit} class="space-y-4">
    <!-- Form fields -->
    {#each formFields as field}
      <!-- ... existing form field rendering ... -->
    {/each}
    
    <!-- Form buttons -->
    <div class="flex justify-end space-x-3 mt-6">
      <button
        type="button"
        on:click={closeModal}
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Cancel
      </button>
      
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Complete Task
      </button>
    </div>
  </form>
{:else if formContent.component === 'InvoicePreview'}
  <InvoicePreview
    job={job}
    on:approve={() => completeTask()}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'TechnicianPicker'}
  <AssignTechnicianForm
    jobId={job.id}
    userId={userInfo?.id || 'unknown-user'}
    on:submit={e => completeTask(e.detail)}
  />
{:else if formContent.component === 'ReadingForm'}
  <ReadingForm 
    job={job}
    on:submit={handleReadingSubmit}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'PhotoUpload'}
  <PhotoUpload
    job={job}
    on:submit={handlePhotoSubmit}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'JobSubmissionForm'}
  <JobSubmissionForm
    job={job}
    on:submit={e => completeTask(e.detail)}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'ReviewChecklistForm'}
  <ReviewChecklistForm
    job={job}
    logEntries={logEntries}
    on:submit={handleReviewChecklistSubmit}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'LaborEntryForm'}
  <LaborEntryForm
    job={job}
    on:submit={handleLaborEntrySubmit}
    on:cancel={closeModal}
  />
{:else if formContent.component === 'JobFinalizeForm'}
  <JobFinalizeForm
    job={job}
    on:submit={handleJobFinalizeSubmit}
    on:cancel={closeModal}
  />
{:else}
  <p class="text-gray-500">No additional information is required for this task.</p>
{/if}