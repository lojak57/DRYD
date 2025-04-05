<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import type { LogEntry } from '$lib/types/LogEntry';
  import type { LaborEntry } from '$lib/types/LaborEntry';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import { onMount } from 'svelte';
  import { getCustomerById } from '$lib/services/customers';
  
  export let job: Job;
  export let logEntries: LogEntry[] = [];
  export let laborEntries: LaborEntry[] = [];
  export let billingSummary = { details: [], totalCost: 0 };
  
  // Customer data
  let customerName = '';
  let loading = true;
  
  // Calculated summaries
  $: totalLaborHours = laborEntries.reduce((sum, entry) => sum + entry.hours, 0);
  $: totalLaborCost = totalLaborHours * 85; // Assuming $85/hour rate
  $: equipmentCost = billingSummary.totalCost || 0;
  $: totalCost = totalLaborCost + equipmentCost;
  $: photoCount = logEntries.filter(entry => entry.type === 'PHOTO').length;
  
  onMount(async () => {
    try {
      const customer = await getCustomerById(job.customerId);
      if (customer) {
        customerName = customer.name;
      }
    } catch (err) {
      console.error('Error loading customer:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden mb-8">
  <div class="p-4 bg-green-600 text-white">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-xl flex items-center">
        <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Job Completion Report
      </h2>
      
      <div class="bg-white text-green-800 py-1 px-3 rounded-full text-sm font-semibold shadow-sm border border-green-300">
        Completed on {formatDate(job.completedDate)}
      </div>
    </div>
  </div>

  <div class="p-6 bg-gray-50">
    <!-- Job Details Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Job Summary
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dl class="space-y-2">
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Job Number:</dt>
              <dd class="text-gray-900">{job.jobNumber}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Title:</dt>
              <dd class="text-gray-900">{job.title}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Type:</dt>
              <dd class="text-gray-900">{job.jobType}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Customer:</dt>
              <dd class="text-gray-900">{customerName || 'Loading...'}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <dl class="space-y-2">
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Created:</dt>
              <dd class="text-gray-900">{formatDate(job.createdAt)}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Incident Date:</dt>
              <dd class="text-gray-900">{formatDate(job.incidentDate)}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Started:</dt>
              <dd class="text-gray-900">{formatDate(job.scheduledStartDate)}</dd>
            </div>
            <div class="flex items-start">
              <dt class="w-32 font-medium text-gray-600">Completed:</dt>
              <dd class="text-green-600 font-medium">{formatDate(job.completedDate)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    
    <!-- Site Address Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Site Information
      </h3>
      
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <p class="text-gray-900">
          {job.siteAddress?.street || ''}<br />
          {job.siteAddress?.city || ''}, {job.siteAddress?.state || ''} {job.siteAddress?.zip || ''}
        </p>
        
        {#if job.accessInstructions}
          <div class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-sm font-medium text-gray-700">Access Instructions:</p>
            <p class="text-gray-800">{job.accessInstructions}</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Labor Summary Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Labor Summary
      </h3>
      
      {#if laborEntries.length === 0}
        <p class="text-gray-600 italic">No labor entries recorded for this job.</p>
      {:else}
        <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each laborEntries as entry}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.userName}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.hours}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(entry.hours * 85)}</td>
                </tr>
              {/each}
              <tr class="bg-gray-50 font-medium">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalLaborHours}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(totalLaborCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      {/if}
    </div>
    
    <!-- Equipment Summary Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Equipment & Materials
      </h3>
      
      {#if job.equipmentIds.length === 0}
        <p class="text-gray-600 italic">No equipment was used for this job.</p>
      {:else}
        <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment ID</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each job.equipmentIds as equipmentId, i}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipmentId}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(Math.random() * 100 + 50)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{Math.floor(Math.random() * 10) + 1}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(Math.random() * 1000 + 100)}</td>
                </tr>
              {/each}
              <tr class="bg-gray-50 font-medium">
                <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total Equipment Cost</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(equipmentCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      {/if}
    </div>
    
    <!-- Activity Summary -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Activity Summary
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-blue-600">{logEntries.length}</div>
          <div class="text-gray-700">Total Log Entries</div>
        </div>
        
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-purple-600">{photoCount}</div>
          <div class="text-gray-700">Photos Taken</div>
        </div>
        
        <div class="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div class="text-2xl font-bold text-indigo-600">
            {logEntries.filter(entry => entry.type === 'NOTE' || entry.type === 'MOISTURE_READING').length}
          </div>
          <div class="text-gray-700">Notes & Readings</div>
        </div>
      </div>
    </div>
    
    <!-- Total Cost Summary -->
    <div class="bg-green-50 p-6 rounded-lg border border-green-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Job Cost Summary
      </h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Labor ({totalLaborHours} hours)</span>
          <span class="text-gray-900">{formatCurrency(totalLaborCost)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Equipment & Materials</span>
          <span class="text-gray-900">{formatCurrency(equipmentCost)}</span>
        </div>
        <div class="pt-2 mt-2 border-t border-green-200 flex justify-between font-bold text-lg">
          <span class="text-gray-800">Total Job Cost</span>
          <span class="text-green-700">{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  </div>
</div> 