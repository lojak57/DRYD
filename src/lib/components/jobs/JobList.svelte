<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import JobCard from './JobCard.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  
  export let jobs: Job[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
  export let filterStatus: string = 'ALL';
  export let emptyStateMessage: string = 'No jobs found.';
  
  // Filter jobs based on status and the current user's role
  $: filteredJobs = jobs.filter(job => {
    // Status filtering
    if (filterStatus !== 'ALL' && job.status !== filterStatus) {
      return false;
    }
    
    // Technician role filtering - technicians should only see jobs assigned to them
    if ($currentUser && $currentUser.role === Role.TECH) {
      return job.assignedUserIds?.includes($currentUser.id);
    }
    
    return true;
  });
</script>

<div class="space-y-6">
  {#if loading}
    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div class="h-3 bg-gray-200 rounded mb-2.5"></div>
      <div class="h-3 bg-gray-200 rounded mb-2.5"></div>
      <div class="h-3 bg-gray-200 rounded"></div>
    </div>
  {:else if error}
    <div class="p-4 bg-red-50 rounded-lg border border-red-200">
      <p class="text-red-800">{error}</p>
    </div>
  {:else if filteredJobs.length === 0}
    <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
      <p class="text-gray-500">{emptyStateMessage}</p>
    </div>
  {:else}
    {#each filteredJobs as job (job.id)}
      <JobCard {job} />
    {/each}
  {/if}
</div> 