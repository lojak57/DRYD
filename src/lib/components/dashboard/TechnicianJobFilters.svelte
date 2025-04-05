<script lang="ts">
  import { TechnicianJobFilter, setTechnicianJobFilter, technicianJobFilter } from '$lib/stores/jobStore';
</script>

<div class="bg-white rounded-lg shadow-md p-4 mb-6">
  <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
    <svg class="w-5 h-5 mr-2 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
    My Job Filters
  </h3>
  
  <div class="flex flex-wrap gap-2">
    <button 
      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
        {$technicianJobFilter === TechnicianJobFilter.ASSIGNED_UNSCHEDULED 
          ? 'bg-teal-gradient-1 border-teal-500 text-teal-900 shadow-md' 
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
      on:click={() => setTechnicianJobFilter(TechnicianJobFilter.ASSIGNED_UNSCHEDULED)}
    >
      <div class="flex items-center justify-center">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Needs Scheduling / Info
      </div>
    </button>
    
    <button 
      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
        {$technicianJobFilter === TechnicianJobFilter.ASSIGNED_SCHEDULED_IN_PROGRESS 
          ? 'bg-teal-gradient-3 border-teal-500 text-white shadow-md' 
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
      on:click={() => setTechnicianJobFilter(TechnicianJobFilter.ASSIGNED_SCHEDULED_IN_PROGRESS)}
    >
      <div class="flex items-center justify-center">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Active Jobs
      </div>
    </button>
    
    <button 
      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex-1
        {$technicianJobFilter === TechnicianJobFilter.COMPLETED_BY_TECH 
          ? 'bg-teal-gradient-5 border-teal-500 text-white shadow-md' 
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}"
      on:click={() => setTechnicianJobFilter(TechnicianJobFilter.COMPLETED_BY_TECH)}
    >
      <div class="flex items-center justify-center">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        My Completed
      </div>
    </button>
  </div>
</div> 