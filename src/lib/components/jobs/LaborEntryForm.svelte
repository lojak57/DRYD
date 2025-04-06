<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { getFullName } from '$lib/types/User';
  import { getUserById } from '$lib/services/users';
  import { onMount } from 'svelte';
  import { getQuoteById } from '$lib/services/quotes';
  import type { Quote, QuoteLineItem } from '$lib/types/Quote';
  
  export let job: Job;
  
  interface LaborEntry {
    technicianId: string;
    technicianName: string;
    hours: number;
    hourlyRate: number;
  }
  
  const dispatch = createEventDispatcher<{
    submit: { laborEntries: LaborEntry[], totalHours: number, totalLaborCost: number };
    cancel: void;
  }>();
  
  let technicians: User[] = [];
  let laborEntries: LaborEntry[] = [];
  let isLoading = true;
  let errorMessage = '';
  
  // Quote data
  let quote: Quote | null = null;
  let quoteLoading = false;
  let quoteError = '';
  let quoteLaborHours = 0;
  let quoteLaborCost = 0;
  let laborLineItems: Array<{type: string, hours: number, cost: number}> = [];
  
  // Calculate totals
  $: totalHours = laborEntries.reduce((sum, entry) => sum + entry.hours, 0);
  $: totalLaborCost = laborEntries.reduce((sum, entry) => sum + (entry.hours * entry.hourlyRate), 0);
  
  // Load quote data if job was created from a quote
  async function loadQuoteData() {
    if (!job.originatingQuoteId) return;
    
    quoteLoading = true;
    quoteError = '';
    laborLineItems = [];
    
    try {
      console.log('Loading quote with ID:', job.originatingQuoteId);
      quote = await getQuoteById(job.originatingQuoteId);
      console.log('Quote data loaded:', quote);
      
      if (quote && quote.lineItems && quote.lineItems.length > 0) {
        // Extract labor items from quote
        const laborItems = quote.lineItems.filter(item => 
          item.category === 'LABOR' || 
          item.description.toLowerCase().includes('labor'));
        
        console.log('Labor items from quote:', laborItems);
        
        if (laborItems.length > 0) {
          quoteLaborCost = laborItems.reduce((sum, item) => sum + item.total, 0);
          
          // Group by labor type (from description)
          const laborTypes = new Map<string, {hours: number, cost: number}>();
          
          laborItems.forEach(item => {
            // Extract labor type from description (e.g., "Labor - Restoration Technician")
            let laborType = item.description;
            
            // Extract technician type from description
            if (item.description.includes(' - ')) {
              laborType = item.description.split(' - ')[1].trim();
            } else if (item.description.includes('-')) {
              laborType = item.description.split('-')[1].trim();
            }
            
            if (!laborType) laborType = 'General Labor';
            
            // Calculate hours based on quantity or estimate from cost
            const hours = item.quantity > 0 ? item.quantity : Math.round(item.total / 45 * 10) / 10;
            
            // Add to or update the labor type in our map
            if (laborTypes.has(laborType)) {
              const existing = laborTypes.get(laborType)!;
              laborTypes.set(laborType, {
                hours: existing.hours + hours,
                cost: existing.cost + item.total
              });
            } else {
              laborTypes.set(laborType, {
                hours: hours,
                cost: item.total
              });
            }
          });
          
          // Convert map to array for display
          laborLineItems = Array.from(laborTypes.entries()).map(([type, data]) => ({
            type,
            hours: data.hours,
            cost: data.cost
          }));
          
          console.log('Processed labor line items:', laborLineItems);
          
          // Update total hours
          quoteLaborHours = laborLineItems.reduce((sum, item) => sum + item.hours, 0);
        }
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      quoteError = 'Failed to load quote information';
    } finally {
      quoteLoading = false;
    }
  }
  
  onMount(async () => {
    if (!job.assignedUserIds || job.assignedUserIds.length === 0) {
      errorMessage = 'No technicians assigned to this job';
      isLoading = false;
      return;
    }
    
    try {
      // Load quote data first
      await loadQuoteData();
      
      // Initialize labor entries for each assigned technician
      const technicianPromises = job.assignedUserIds.map(async (id) => {
        try {
          const technician = await getUserById(id);
          return technician;
        } catch (error) {
          console.error(`Failed to load technician ${id}:`, error);
          return null;
        }
      });
      
      const loadedTechnicians = (await Promise.all(technicianPromises)).filter((tech): tech is User => !!tech);
      technicians = loadedTechnicians;
      
      // Initialize labor entries
      laborEntries = technicians.map(tech => ({
        technicianId: tech.id,
        technicianName: getFullName(tech),
        hours: 0,
        hourlyRate: 45 // Default hourly rate
      }));
    } catch (error) {
      console.error('Error loading technicians:', error);
      errorMessage = 'Failed to load technician information';
    } finally {
      isLoading = false;
    }
  });
  
  // Add a new labor entry
  function addLaborEntry() {
    laborEntries = [...laborEntries, {
      technicianId: '',
      technicianName: 'New Technician',
      hours: 0,
      hourlyRate: 45
    }];
  }
  
  // Remove a labor entry
  function removeLaborEntry(index: number) {
    laborEntries = laborEntries.filter((_, i) => i !== index);
  }
  
  // Update hours for a technician
  function updateHours(index: number, hours: number) {
    laborEntries[index].hours = hours;
    laborEntries = [...laborEntries]; // Trigger reactivity
  }
  
  // Update hourly rate for a technician
  function updateRate(index: number, rate: number) {
    laborEntries[index].hourlyRate = rate;
    laborEntries = [...laborEntries]; // Trigger reactivity
  }
  
  // Handle form submission
  function handleSubmit() {
    dispatch('submit', {
      laborEntries,
      totalHours,
      totalLaborCost
    });
  }
  
  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-3">Enter Labor Hours</h3>
    <p class="text-gray-500 mb-4">Record the hours worked by each technician on this job.</p>
    
    <!-- Important notification box about quote labor hours -->
    <div class="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Important Labor Hours Information</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>All labor hours originally added on the quote will be automatically included. Only add in any <strong>additional labor hours</strong> that were not on the original quote.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Original quote labor hours summary -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
      <h4 class="text-sm font-medium text-blue-800 mb-2">Labor Hours from Original Quote</h4>
      {#if quoteLoading}
        <div class="flex items-center text-blue-700">
          <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading quote information...
        </div>
      {:else if quoteError}
        <p class="text-red-600 text-sm">{quoteError}</p>
      {:else if !job.originatingQuoteId}
        <p class="text-blue-700 text-sm">This job was not created from a quote.</p>
        <p class="text-blue-700 text-sm font-medium mt-1">Quote Labor Hours: 0</p>
      {:else if laborLineItems.length === 0}
        <p class="text-blue-700 text-sm">No labor items found in the original quote.</p>
        <p class="text-blue-700 text-sm font-medium mt-1">Quote Labor Hours: 0</p>
      {:else}
        <div class="mb-2">
          <div class="flex justify-between mb-1">
            <p class="text-sm font-medium text-blue-800">Technician Type</p>
            <div class="flex">
              <p class="text-sm font-medium text-blue-800 w-24 text-right mr-4">Hours</p>
              <p class="text-sm font-medium text-blue-800 w-24 text-right">Cost</p>
            </div>
          </div>
          
          <div class="border-t border-blue-200 pt-1">
            {#each laborLineItems as item}
              <div class="flex justify-between py-1">
                <p class="text-sm text-blue-700">{item.type}</p>
                <div class="flex">
                  <p class="text-sm text-blue-700 w-24 text-right mr-4">{item.hours.toFixed(1)}</p>
                  <p class="text-sm text-blue-700 w-24 text-right">${item.cost.toFixed(2)}</p>
                </div>
              </div>
            {/each}
          </div>
          
          <div class="border-t border-blue-200 pt-1 mt-1">
            <div class="flex justify-between py-1">
              <p class="text-sm font-semibold text-blue-800">Total</p>
              <div class="flex">
                <p class="text-sm font-semibold text-blue-800 w-24 text-right mr-4">{quoteLaborHours.toFixed(1)}</p>
                <p class="text-sm font-semibold text-blue-800 w-24 text-right">${quoteLaborCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    {#if isLoading}
      <div class="flex justify-center my-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if errorMessage}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {errorMessage}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hourly Rate ($)
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each laborEntries as entry, i}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.technicianName}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    class="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={entry.hours}
                    on:input={(e) => {
                      const target = e.target as HTMLInputElement;
                      updateHours(i, parseFloat(target.value) || 0);
                    }}
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <span class="mr-1">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      class="w-20 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={entry.hourlyRate}
                      on:input={(e) => {
                        const target = e.target as HTMLInputElement;
                        updateRate(i, parseFloat(target.value) || 0);
                      }}
                    />
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${(entry.hours * entry.hourlyRate).toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    on:click={() => removeLaborEntry(i)}
                    class="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
            
            <!-- Totals row -->
            <tr class="bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Totals
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {totalHours.toFixed(1)} hours
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                -
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                ${totalLaborCost.toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Add entry button -->
      <div class="mt-3">
        <button
          type="button"
          on:click={addLaborEntry}
          class="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Another Technician
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Form Actions -->
  <div class="pt-5 border-t border-gray-200 mt-8 flex justify-end space-x-3">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      Cancel
    </button>
    
    <button
      on:click={handleSubmit}
      disabled={isLoading || !!errorMessage || laborEntries.length === 0}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Submit Labor Hours
    </button>
  </div>
</div> 