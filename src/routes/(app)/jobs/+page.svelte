<script lang="ts">
  import { onMount } from 'svelte';
  import { jobs, isLoading, error, loadJobs } from '$lib/stores/jobStore';
  import { JobStatus } from '$lib/types/Job';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import JobList from '$lib/components/jobs/JobList.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  
  let searchQuery = '';
  let statusFilter = 'ALL';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // Get the status from URL parameter (if any)
  $: if (browser && $page.url.searchParams.has('status')) {
    statusFilter = $page.url.searchParams.get('status') || 'ALL';
  }
  
  $: filteredJobs = filterJobs($jobs, searchQuery);
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  
  function filterJobs(jobs: any[], query: string) {
    if (!query.trim()) return jobs;
    
    const searchTerms = query.toLowerCase().split(' ');
    return jobs.filter(job => {
      const searchableText = [
        job.jobNumber,
        job.title || '',
        job.description || '',
        job.status,
        job.jobType || ''
      ].join(' ').toLowerCase();
      
      // Check if all search terms are found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  function handleSearch(e: Event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const target = e.target as HTMLInputElement;
      searchQuery = target.value;
    }, 300);
  }
  
  function createNewJob() {
    goto('/jobs/new');
  }

  function createNewQuote() {
    goto('/quotes/new');
  }
  
  function updateStatusFilter(newStatus: string) {
    statusFilter = statusFilter === newStatus ? 'ALL' : newStatus;
    // Update URL to reflect current filter
    if (browser) {
      const url = new URL(window.location.href);
      if (statusFilter === 'ALL') {
        url.searchParams.delete('status');
      } else {
        url.searchParams.set('status', statusFilter);
      }
      goto(url.toString(), { replaceState: true, noscroll: true });
    }
  }
  
  onMount(async () => {
    await loadJobs();
  });
</script>

<PageHeader title="Jobs">
  <svelte:fragment slot="actions">
    {#if isAuthorized}
      <Button color="secondary" on:click={createNewQuote} class="mr-2">
        Create Quote
      </Button>
      <Button color="primary" on:click={createNewJob}>
        Create Job
      </Button>
    {/if}
  </svelte:fragment>
</PageHeader>

<div class="container mx-auto p-4">
  <!-- Job Status Filter Cards -->
  <div class="mb-8">
    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
      <svg class="w-5 h-5 mr-2 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Job Filters
    </h3>
    
    <div class="flex flex-wrap gap-2">
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.NEW 
            ? 'bg-burgundy-gradient-1 border-burgundy-500 text-white shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.NEW)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Jobs
        </div>
      </button>
      
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.SCHEDULED 
            ? 'bg-burgundy-gradient-2 border-burgundy-500 text-white shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.SCHEDULED)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Scheduled
        </div>
      </button>
      
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.IN_PROGRESS 
            ? 'bg-burgundy-gradient-3 border-burgundy-500 text-white shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.IN_PROGRESS)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          In Progress
        </div>
      </button>
      
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.ON_HOLD 
            ? 'bg-amber-gradient border-amber-500 text-amber-900 shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.ON_HOLD)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          On Hold
        </div>
      </button>
      
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.PENDING_COMPLETION 
            ? 'bg-burgundy-gradient-4 border-burgundy-500 text-white shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.PENDING_COMPLETION)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending Completion
        </div>
      </button>
      
      <button 
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
          {statusFilter === JobStatus.COMPLETED 
            ? 'bg-purple-gradient border-purple-500 text-white shadow-md' 
            : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
        on:click={() => updateStatusFilter(JobStatus.COMPLETED)}
      >
        <div class="flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Completed
        </div>
      </button>
      
      {#if isAuthorized}
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
            {statusFilter === 'INVOICE_APPROVAL' 
              ? 'bg-burgundy-gradient-5 border-burgundy-500 text-white shadow-md' 
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
          on:click={() => updateStatusFilter('INVOICE_APPROVAL')}
        >
          <div class="flex items-center justify-center">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Invoice Approval
          </div>
        </button>
        
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
            {statusFilter === JobStatus.INVOICED 
              ? 'bg-burgundy-gradient-5 border-burgundy-500 text-white shadow-md' 
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
          on:click={() => updateStatusFilter(JobStatus.INVOICED)}
        >
          <div class="flex items-center justify-center">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Invoiced
          </div>
        </button>
        
        <button 
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
            {statusFilter === JobStatus.PAID 
              ? 'bg-emerald-gradient border-emerald-500 text-white shadow-md' 
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
          on:click={() => updateStatusFilter(JobStatus.PAID)}
        >
          <div class="flex items-center justify-center">
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Paid
          </div>
        </button>
      {/if}
    </div>
  </div>

  <div class="mb-6 flex flex-col sm:flex-row gap-4">
    <!-- Search -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input 
        type="search" 
        class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
        placeholder="Search jobs..."
        on:input={handleSearch}
      />
    </div>
    
    <!-- Status Filter Dropdown (remains for backward compatibility) -->
    <div class="w-full sm:w-auto">
      <select 
        bind:value={statusFilter}
        on:change={() => {
          // Update URL when dropdown changes
          if (browser) {
            const url = new URL(window.location.href);
            if (statusFilter === 'ALL') {
              url.searchParams.delete('status');
            } else {
              url.searchParams.set('status', statusFilter);
            }
            goto(url.toString(), { replaceState: true, noscroll: true });
          }
        }}
        class="block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="ALL">All Statuses</option>
        <option value={JobStatus.NEW}>New</option>
        <option value={JobStatus.SCHEDULED}>Scheduled</option>
        <option value={JobStatus.IN_PROGRESS}>In Progress</option>
        <option value={JobStatus.PENDING_COMPLETION}>Pending Completion</option>
        <option value={JobStatus.ON_HOLD}>On Hold</option>
        <option value={JobStatus.COMPLETED}>Completed</option>
        <option value="INVOICE_APPROVAL">Invoice Approval</option>
        <option value={JobStatus.INVOICED}>Invoiced</option>
        <option value={JobStatus.PAID}>Paid</option>
        <option value={JobStatus.CANCELLED}>Cancelled</option>
      </select>
    </div>
  </div>
  
  <JobList 
    jobs={filteredJobs} 
    loading={$isLoading} 
    error={$error}
    filterStatus={statusFilter}
    emptyStateMessage={searchQuery ? "No jobs match your search" : "No jobs found"}
  />
</div>