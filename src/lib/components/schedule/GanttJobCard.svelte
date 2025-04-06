<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  
  export let job: Job;
  export let small: boolean = false;
  
  // Navigate to job details on click
  function viewJob() {
    goto(`/jobs/${job.id}`);
  }
  
  // Get color based on job status
  function getStatusColor(status: JobStatus): string {
    switch(status) {
      case JobStatus.NEW:
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case JobStatus.SCHEDULED:
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case JobStatus.IN_PROGRESS:
        return 'bg-green-100 border-green-300 text-green-800';
      case JobStatus.ON_HOLD:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case JobStatus.PENDING_COMPLETION:
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case JobStatus.COMPLETED:
        return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case JobStatus.INVOICE_APPROVAL:
      case JobStatus.INVOICED:
        return 'bg-pink-100 border-pink-300 text-pink-800';
      case JobStatus.PAID:
        return 'bg-teal-100 border-teal-300 text-teal-800';
      case JobStatus.CANCELLED:
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  }
  
  // Get truncated title based on small prop
  $: truncatedTitle = small 
    ? job.title?.length > 8 
      ? job.title.substring(0, 6) + '...' 
      : job.title || 'Job'
    : job.title?.length > 18 
      ? job.title.substring(0, 16) + '...' 
      : job.title || 'Job';
  
  // Get the color for this job
  $: cardColor = getStatusColor(job.status);
</script>

<div 
  on:click={viewJob}
  class="job-card {cardColor} rounded border {small ? 'p-1' : 'p-2'} cursor-pointer hover:shadow-md transition-shadow"
  role="button"
  tabindex="0"
  on:keydown={e => e.key === 'Enter' && viewJob()}
>
  <!-- Job Title -->
  <div class="font-medium {small ? 'text-[0.65rem] leading-[0.8rem]' : 'text-sm'}" title={job.title || 'Job'}>
    {truncatedTitle}
  </div>
  
  <!-- Only show additional info if not small -->
  {#if !small}
    <!-- Job Type or Job Number -->
    {#if job.jobNumber}
      <div class="text-xs truncate opacity-80">
        #{job.jobNumber}
      </div>
    {:else if job.type}
      <div class="text-xs truncate opacity-80">
        {job.type}
      </div>
    {/if}
  {/if}
</div>