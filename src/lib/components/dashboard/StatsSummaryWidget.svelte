<script lang="ts">
  import { jobStatusCounts } from '$lib/stores/jobStore';
  import { JobStatus } from '$lib/types/Job';
</script>

<div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden mb-6">
  <div class="p-4 bg-dryd-gradient text-white border-b-4 border-blue-600">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-xl flex items-center">
        <div class="bg-blue-600 text-white p-2 rounded-md mr-3">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span>Company Performance</span>
      </h2>
    </div>
  </div>

  <div class="p-6 bg-gray-50">
    <!-- Job Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col items-center">
          <div class="text-3xl font-bold text-blue-600 mb-1">{$jobStatusCounts?.NEW || 0}</div>
          <div class="text-gray-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            New
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col items-center">
          <div class="text-3xl font-bold text-amber-600 mb-1">{$jobStatusCounts?.IN_PROGRESS || 0}</div>
          <div class="text-gray-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Active
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col items-center">
          <div class="text-3xl font-bold text-green-600 mb-1">{$jobStatusCounts?.COMPLETED || 0}</div>
          <div class="text-gray-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col items-center">
          <div class="text-3xl font-bold text-blue-600 mb-1">{$jobStatusCounts?.PENDING_COMPLETION || 0}</div>
          <div class="text-gray-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Pending Completion
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
        <div class="flex flex-col items-center">
          <div class="text-3xl font-bold text-dryd-blue mb-1">{$jobStatusCounts?.total || 0}</div>
          <div class="text-gray-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Total
          </div>
        </div>
      </div>
    </div>

    <!-- Business metrics overview -->
    <div class="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-5">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Business Metrics</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border-r border-gray-200 pr-4">
          <h4 class="text-sm font-medium text-gray-600 mb-1">Jobs This Month</h4>
          <p class="text-2xl font-bold text-dryd-blue">{$jobStatusCounts?.NEW + $jobStatusCounts?.IN_PROGRESS || 0}</p>
          <p class="text-xs text-gray-500 mt-1">Active jobs in current month</p>
        </div>
        
        <div class="border-r border-gray-200 px-4">
          <h4 class="text-sm font-medium text-gray-600 mb-1">Conversion Rate</h4>
          <p class="text-2xl font-bold text-green-600">--</p>
          <p class="text-xs text-gray-500 mt-1">Quote to job conversion</p>
        </div>
        
        <div class="pl-4">
          <h4 class="text-sm font-medium text-gray-600 mb-1">Avg. Job Value</h4>
          <p class="text-2xl font-bold text-amber-600">--</p>
          <p class="text-xs text-gray-500 mt-1">Based on completed jobs</p>
        </div>
      </div>
    </div>
  </div>
</div> 