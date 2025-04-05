<script lang="ts">
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/userStore';
  import { createJob } from '$lib/services/jobs';
  import { loadJobs } from '$lib/stores/jobStore';
  import MultiStepJobForm from '$lib/components/jobs/MultiStepJobForm.svelte';
  import { Role } from '$lib/types/User';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import type { Job } from '$lib/types/Job';
  
  // Job creation loading state
  let isCreating = false;
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $userStore?.role === Role.ADMIN || $userStore?.role === Role.OFFICE;
  
  // Handle form submission
  async function handleSubmit(formData: Omit<Job, 'id' | 'createdAt' | 'status' | 'equipmentIds'>) {
    isCreating = true;
    
    try {
      const newJob = await createJob(formData);
      
      // Ensure job store is refreshed with the newest data
      await loadJobs();
      
      // Navigate to the new job
      goto(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      // Handle error (can add toast/notification here)
    } finally {
      isCreating = false;
    }
  }
</script>

<PageHeader title="Create New Job" back="/dashboard" />

<div class="container mx-auto px-4 py-6 max-w-4xl">
  {#if !isAuthorized}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
      <p class="flex items-center font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Access Denied
      </p>
      <p class="mt-1">Only Admin and Office staff can create new jobs.</p>
    </div>
  {:else}
    <MultiStepJobForm 
      onSubmit={handleSubmit}
      isLoading={isCreating}
    />
  {/if}
</div> 