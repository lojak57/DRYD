<script lang="ts">
  import { userJobCounts } from '$lib/stores/jobStore';
  import { dashboardJobs } from '$lib/stores/jobStore';
  import { JobStatus } from '$lib/types/Job';
  
  // Calculate jobs scheduled for today
  $: todaysJobs = $dashboardJobs.filter(job => {
    // Check if job has a scheduled date and it's today
    if (!job.scheduledStartDate) return false;
    
    const today = new Date();
    const scheduledDate = new Date(job.scheduledStartDate);
    
    return scheduledDate.getDate() === today.getDate() &&
           scheduledDate.getMonth() === today.getMonth() &&
           scheduledDate.getFullYear() === today.getFullYear();
  });
  
  // Calculate jobs scheduled for tomorrow
  $: tomorrowsJobs = $dashboardJobs.filter(job => {
    // Check if job has a scheduled date and it's tomorrow
    if (!job.scheduledStartDate) return false;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduledDate = new Date(job.scheduledStartDate);
    
    return scheduledDate.getDate() === tomorrow.getDate() &&
           scheduledDate.getMonth() === tomorrow.getMonth() &&
           scheduledDate.getFullYear() === tomorrow.getFullYear();
  });
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
    <div class="flex flex-col items-center">
      <div class="text-3xl font-bold text-blue-600 mb-1">{$userJobCounts?.assigned || 0}</div>
      <div class="text-gray-600 font-medium flex items-center">
        <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        My Jobs
      </div>
    </div>
  </div>
  
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
    <div class="flex flex-col items-center">
      <div class="text-3xl font-bold text-amber-600 mb-1">{$userJobCounts?.active || 0}</div>
      <div class="text-gray-600 font-medium flex items-center">
        <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        In Progress
      </div>
    </div>
  </div>

  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
    <div class="flex flex-col items-center">
      <div class="text-3xl font-bold text-green-600 mb-1">{todaysJobs.length}</div>
      <div class="text-gray-600 font-medium flex items-center">
        <svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Today
      </div>
    </div>
  </div>
  
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
    <div class="flex flex-col items-center">
      <div class="text-3xl font-bold text-dryd-blue mb-1">{tomorrowsJobs.length}</div>
      <div class="text-gray-600 font-medium flex items-center">
        <svg class="w-4 h-4 mr-1 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Tomorrow
      </div>
    </div>
  </div>
</div>

<!-- Upcoming Schedule Summary -->
<div class="mt-4 bg-white rounded-lg shadow-md border border-gray-200 p-5">
  <h3 class="text-lg font-semibold text-gray-800 mb-3">My Schedule</h3>
  
  {#if todaysJobs.length === 0 && tomorrowsJobs.length === 0}
    <p class="text-gray-500">No jobs scheduled for today or tomorrow.</p>
  {:else}
    <div class="space-y-4">
      {#if todaysJobs.length > 0}
        <div>
          <h4 class="text-md font-medium text-gray-700 mb-2">Today</h4>
          <ul class="space-y-2">
            {#each todaysJobs as job}
              <li class="bg-blue-50 p-3 rounded-md border border-blue-100">
                <div class="font-medium text-blue-800">{job.title || 'Untitled Job'}</div>
                <div class="text-sm text-blue-600">{job.jobNumber} - {job.status}</div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      
      {#if tomorrowsJobs.length > 0}
        <div>
          <h4 class="text-md font-medium text-gray-700 mb-2">Tomorrow</h4>
          <ul class="space-y-2">
            {#each tomorrowsJobs as job}
              <li class="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                <div class="font-medium text-indigo-800">{job.title || 'Untitled Job'}</div>
                <div class="text-sm text-indigo-600">{job.jobNumber} - {job.status}</div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</div> 