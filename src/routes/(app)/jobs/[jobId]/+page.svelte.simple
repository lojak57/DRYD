<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { loadJobById, isLoading, error } from '$lib/stores/jobStore';
  import { JobStatus, JobType } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';

  let job: Job | undefined;
  let loading = true;
  
  // Job ID from URL
  const jobId = $page.params.jobId;
  
  // Status mapping for display
  const statusLabels: Record<JobStatus, string> = {
    [JobStatus.NEW]: 'New',
    [JobStatus.SCHEDULED]: 'Scheduled',
    [JobStatus.IN_PROGRESS]: 'In Progress',
    [JobStatus.ON_HOLD]: 'On Hold',
    [JobStatus.PENDING_COMPLETION]: 'Pending Completion',
    [JobStatus.COMPLETED]: 'Completed',
    [JobStatus.INVOICE_APPROVAL]: 'Invoice Approval',
    [JobStatus.INVOICED]: 'Invoiced',
    [JobStatus.PAID]: 'Paid',
    [JobStatus.CANCELLED]: 'Cancelled'
  };
  
  // Status colors for display
  const statusColors: Record<JobStatus, string> = {
    [JobStatus.NEW]: 'blue',
    [JobStatus.SCHEDULED]: 'cyan',
    [JobStatus.IN_PROGRESS]: 'green',
    [JobStatus.ON_HOLD]: 'orange',
    [JobStatus.PENDING_COMPLETION]: 'lime',
    [JobStatus.COMPLETED]: 'purple',
    [JobStatus.INVOICE_APPROVAL]: 'pink',
    [JobStatus.INVOICED]: 'amber',
    [JobStatus.PAID]: 'emerald',
    [JobStatus.CANCELLED]: 'red'
  };
  
  // Type mapping for display
  const typeLabels: Record<JobType, string> = {
    [JobType.WATER]: 'Water Damage',
    [JobType.FIRE]: 'Fire Damage', 
    [JobType.MOLD]: 'Mold Remediation',
    [JobType.SMOKE]: 'Smoke Damage',
    [JobType.STORM]: 'Storm Damage',
    [JobType.OTHER]: 'Other Services'
  };
  
  onMount(async () => {
    try {
      console.log(`Loading job with ID: ${jobId}`);
      job = await loadJobById(jobId);
      console.log('Job loaded:', job?.title);
    } catch (err) {
      console.error('Error loading job:', err);
    } finally {
      loading = false;
    }
  });
  
  function formatAddress(address) {
    if (!address) return 'Address not available';
    return `${address.street1}${address.street2 ? ', ' + address.street2 : ''}, ${address.city}, ${address.state} ${address.zip}`;
  }
  
  function formatDate(date) {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <!-- Back navigation -->
  <div class="mb-6">
    <a href="/jobs" class="inline-flex items-center text-blue-600 hover:text-blue-800">
      <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Jobs
    </a>
  </div>
  
  <!-- Loading State -->
  {#if $isLoading || loading}
    <div class="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p class="text-gray-500">Loading job details...</p>
      </div>
    </div>
  
  <!-- Error State -->
  {:else if $error}
    <div class="bg-red-50 p-8 text-center rounded-lg border border-red-200 shadow-md">
      <p class="text-red-600 font-medium">{$error}</p>
      <button 
        on:click={() => loadJobById(jobId)}
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  
  <!-- Job Not Found -->
  {:else if !job}
    <div class="bg-yellow-50 p-8 text-center rounded-lg border border-yellow-200 shadow-md">
      <h2 class="text-xl font-bold text-yellow-800 mb-2">Job Not Found</h2>
      <p class="text-yellow-700">We couldn't find a job with ID: {jobId}</p>
      <a 
        href="/jobs" 
        class="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
      >
        View All Jobs
      </a>
    </div>
  
  <!-- Job Details -->
  {:else}
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Header -->
      <div class="bg-gray-800 text-white p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold">{job.title}</h1>
            <div class="flex items-center mt-2">
              <span class="text-gray-300 mr-2">#{job.jobNumber}</span>
              <span class="bg-{statusColors[job.status]}-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                {statusLabels[job.status]}
              </span>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <a 
              href="/jobs/{job.id}/edit" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Edit Job
            </a>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <!-- Type & Priority -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Job Type</h3>
            <p class="font-medium">{typeLabels[job.type] || 'Unknown Damage'}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Priority</h3>
            <div class="flex items-center">
              {#each Array(5) as _, i}
                <svg class="w-5 h-5 {i < job.priority ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              {/each}
              <span class="ml-2">{job.priority}/5</span>
            </div>
          </div>
        </div>
        
        <!-- Location & Customer -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Job Location</h3>
            <p>{formatAddress(job.location)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Customer</h3>
            <p>ID: {job.customerId}</p>
          </div>
        </div>
        
        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Created Date</h3>
            <p>{formatDate(job.createdAt)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Scheduled Start</h3>
            <p>{formatDate(job.scheduledStartDate)}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Estimated Completion</h3>
            <p>{formatDate(job.estimatedCompletionDate)}</p>
          </div>
        </div>
        
        <!-- Description -->
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Description</h3>
          <p class="whitespace-pre-line">{job.description || 'No description available.'}</p>
        </div>
        
        <!-- Access Instructions -->
        {#if job.accessInstructions}
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Access Instructions</h3>
            <p class="whitespace-pre-line">{job.accessInstructions}</p>
          </div>
        {/if}
        
        <!-- Assigned Users -->
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Assigned Technicians</h3>
          {#if job.assignedUserIds && job.assignedUserIds.length > 0}
            <div class="flex flex-wrap gap-2">
              {#each job.assignedUserIds as userId}
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {userId}
                </span>
              {/each}
            </div>
          {:else}
            <p>No technicians assigned</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div> 