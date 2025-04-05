<script lang="ts">
  import type { Job } from "$lib/types/Job";
  import { JobStatus } from "$lib/types/Job";
  import { goto } from "$app/navigation";
  
  export let job: Job;
  
  // Get status-based styling
  $: statusStyle = getStatusStyle(job.status);
  
  // Format job details for display
  $: displayText = `${job.jobNumber}`;
  $: titleText = job.title || 'Untitled Job';
  
  // Navigate to job detail page
  function navigateToJob() {
    goto(`/jobs/${job.id}`);
  }
  
  // Get style based on job status
  function getStatusStyle(status: JobStatus): { bgClass: string; textClass: string; borderClass: string; statusBgClass: string } {
    switch(status) {
      case JobStatus.SCHEDULED:
        return { 
          bgClass: "bg-blue-50", 
          textClass: "text-blue-800",
          borderClass: "border-blue-200",
          statusBgClass: "bg-blue-100 border-blue-300"
        };
      case JobStatus.IN_PROGRESS:
        return { 
          bgClass: "bg-amber-50", 
          textClass: "text-amber-800",
          borderClass: "border-amber-200",
          statusBgClass: "bg-amber-100 border-amber-300"
        };
      case JobStatus.ON_HOLD:
        return { 
          bgClass: "bg-red-50", 
          textClass: "text-red-800",
          borderClass: "border-red-200",
          statusBgClass: "bg-red-100 border-red-300"
        };
      case JobStatus.PENDING_COMPLETION:
        return { 
          bgClass: "bg-indigo-50", 
          textClass: "text-indigo-800",
          borderClass: "border-indigo-200",
          statusBgClass: "bg-indigo-100 border-indigo-300" 
        };
      case JobStatus.COMPLETED:
        return { 
          bgClass: "bg-green-50", 
          textClass: "text-green-800",
          borderClass: "border-green-200",
          statusBgClass: "bg-green-100 border-green-300" 
        };
      case JobStatus.INVOICE_APPROVAL:
        return { 
          bgClass: "bg-purple-50", 
          textClass: "text-purple-800",
          borderClass: "border-purple-200",
          statusBgClass: "bg-purple-100 border-purple-300" 
        };
      case JobStatus.INVOICED:
        return { 
          bgClass: "bg-pink-50", 
          textClass: "text-pink-800",
          borderClass: "border-pink-200",
          statusBgClass: "bg-pink-100 border-pink-300" 
        };
      case JobStatus.PAID:
        return { 
          bgClass: "bg-teal-50", 
          textClass: "text-teal-800",
          borderClass: "border-teal-200",
          statusBgClass: "bg-teal-100 border-teal-300" 
        };
      case JobStatus.CANCELLED:
        return { 
          bgClass: "bg-gray-50", 
          textClass: "text-gray-800",
          borderClass: "border-gray-200",
          statusBgClass: "bg-gray-100 border-gray-300" 
        };
      default:
        return { 
          bgClass: "bg-gray-50", 
          textClass: "text-gray-800",
          borderClass: "border-gray-200",
          statusBgClass: "bg-gray-100 border-gray-300" 
        };
    }
  }
  
  // Get a shorter status display
  function getShortStatus(status: JobStatus): string {
    switch(status) {
      case JobStatus.SCHEDULED:
        return "Scheduled";
      case JobStatus.IN_PROGRESS:
        return "In Progress";
      case JobStatus.ON_HOLD:
        return "On Hold";
      case JobStatus.PENDING_COMPLETION:
        return "Pending";
      case JobStatus.COMPLETED:
        return "Completed";
      case JobStatus.INVOICE_APPROVAL:
        return "Invoice Review";
      case JobStatus.INVOICED:
        return "Invoiced";
      case JobStatus.PAID:
        return "Paid";
      case JobStatus.CANCELLED:
        return "Cancelled";
      default:
        return status;
    }
  }
</script>

<div 
  class="job-card {statusStyle.bgClass} border {statusStyle.borderClass} rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
  on:click={navigateToJob}
  on:keydown={(e) => e.key === 'Enter' && navigateToJob()}
  tabindex="0"
  role="button"
  aria-label="View job {job.jobNumber}"
>
  <div class="flex justify-between items-start">
    <div class="text-xs font-bold {statusStyle.textClass} truncate">{displayText}</div>
    <div class="text-xs {statusStyle.textClass} {statusStyle.statusBgClass} px-1.5 py-0.5 rounded border text-xs">
      {getShortStatus(job.status)}
    </div>
  </div>
  
  <div class="text-xs {statusStyle.textClass} truncate mt-1">{titleText}</div>
  
  <div class="text-xs text-gray-500 mt-1 flex items-center">
    {#if job.location?.city}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="truncate">{job.location.city}</span>
    {/if}
  </div>
</div>