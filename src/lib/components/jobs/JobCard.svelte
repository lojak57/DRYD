<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import JobStatusBadge from './JobStatusBadge.svelte';
  import { getCustomerById } from '$lib/services/customers';
  
  export let job: Job;
  
  // Customer name store
  const customerName = writable<string>('');
  
  // Format the address for display
  $: formattedAddress = job?.siteAddress 
    ? `${job.siteAddress.street || ''}, ${job.siteAddress.city || ''}, ${job.siteAddress.state || ''} ${job.siteAddress.zip || ''}`
    : 'Address not available';
    
  // Format date for display
  function formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Determine styling classes based on job status
  $: headerClass = getHeaderClass(job.status);
  $: bgColorClass = getBgColorClass(job.status);
  $: buttonClass = getButtonClass(job.status);
  
  // Get header class based on job status
  function getHeaderClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.NEW:
        return 'card-header-burgundy-3';
      case JobStatus.SCHEDULED:
        return 'card-header-burgundy-3';
      case JobStatus.IN_PROGRESS:
        return 'card-header-burgundy-4';
      case JobStatus.PENDING_COMPLETION:
        return 'card-header-burgundy-4';
      case JobStatus.INVOICE_APPROVAL:
      case JobStatus.INVOICED:
        return 'card-header-burgundy-5';
      case JobStatus.ON_HOLD:
        return 'card-header-amber';
      case JobStatus.COMPLETED:
        return 'card-header-purple';
      case JobStatus.PAID:
        return 'card-header-emerald';
      case JobStatus.CANCELLED:
        return 'card-header-slate';
      default:
        return 'card-header-teal';
    }
  }
  
  // Get background color class based on job status
  function getBgColorClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.NEW:
        return 'bg-burgundy-gradient-3';
      case JobStatus.SCHEDULED:
        return 'bg-burgundy-gradient-3';
      case JobStatus.IN_PROGRESS:
        return 'bg-burgundy-gradient-4';
      case JobStatus.PENDING_COMPLETION:
        return 'bg-burgundy-gradient-4';
      case JobStatus.INVOICE_APPROVAL:
      case JobStatus.INVOICED:
        return 'bg-burgundy-gradient-5';
      case JobStatus.ON_HOLD:
        return 'bg-amber-gradient';
      case JobStatus.COMPLETED:
        return 'bg-purple-gradient';
      case JobStatus.PAID:
        return 'bg-emerald-gradient';
      case JobStatus.CANCELLED:
        return 'bg-slate-gradient';
      default:
        return 'bg-teal-gradient';
    }
  }
  
  // Get button class based on job status
  function getButtonClass(status: JobStatus): string {
    switch (status) {
      case JobStatus.NEW:
        return 'btn-burgundy-1';
      case JobStatus.SCHEDULED:
        return 'btn-burgundy-2';
      case JobStatus.IN_PROGRESS:
        return 'btn-burgundy-3';
      case JobStatus.PENDING_COMPLETION:
        return 'btn-burgundy-4';
      case JobStatus.INVOICE_APPROVAL:
      case JobStatus.INVOICED:
        return 'btn-burgundy-5';
      case JobStatus.ON_HOLD:
        return 'btn-amber';
      case JobStatus.COMPLETED:
        return 'btn-purple';
      case JobStatus.PAID:
        return 'btn-emerald';
      case JobStatus.CANCELLED:
        return 'btn-slate';
      default:
        return 'btn-teal';
    }
  }
  
  // Load customer data
  onMount(async () => {
    try {
      const customerData = await getCustomerById(job.customerId);
      if (customerData) {
        customerName.set(customerData.name);
      }
    } catch (err) {
      console.error(`Error loading customer for job ${job.id}:`, err);
    }
  });
</script>

<div class="card-glass rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ease-in-out card-shadow">
  <div class="flex items-center justify-between p-4 {headerClass}">
    <div class="flex items-center">
      <div class="p-2 rounded-full {bgColorClass} text-white mr-3">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-800">{job.title}</h3>
        <p class="text-sm text-gray-600">Job #{job.jobNumber}</p>
      </div>
    </div>
    <JobStatusBadge status={job.status} />
  </div>
  
  <div class="p-5 bg-white">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Type</p>
          <p class="text-gray-900 font-medium">{job.jobType}</p>
        </div>
      </div>
      
      <div class="flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Customer</p>
          <p class="text-gray-900 font-medium">{$customerName || 'Loading...'}</p>
        </div>
      </div>
      
      <div class="md:col-span-2 flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Site Address</p>
          <p class="text-gray-900 font-medium">{formattedAddress}</p>
        </div>
      </div>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
      <div class="text-sm text-gray-700 flex items-center">
        <svg class="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {job.incidentDate ? formatDate(job.incidentDate) : 'No incident date'}
      </div>
      <a 
        href="/jobs/{job.id}" 
        class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 {buttonClass}"
      >
        View Details
        <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</div> 