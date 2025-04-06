<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { onMount } from 'svelte';
  import { getUserById } from '$lib/services/users';
  import { getFullName } from '$lib/types/User';
  import { getQuoteById } from '$lib/services/quotes';
  import type { Quote, QuoteLineItem } from '$lib/types/Quote';
  
  export let job: Job;
  export let onSubmit: (laborData: { userId: string, hours: number }[]) => Promise<void>;
  
  // State
  let laborHours: { [userId: string]: number } = {};
  let techDetails: { id: string, name: string }[] = [];
  let isLoading = false;
  let error = '';
  
  // Quote data
  let quote: Quote | null = null;
  let quoteLoading = false;
  let quoteError = '';
  let quoteLaborHours = 0;
  let quoteLaborCost = 0;
  let laborLineItems: Array<{type: string, hours: number, cost: number}> = [];
  
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
  
  // Load technician details
  onMount(async () => {
    // First load quote data
    await loadQuoteData();
    
    if (job.assignedUserIds && job.assignedUserIds.length > 0) {
      try {
        // Fetch details for each technician
        const techPromises = job.assignedUserIds.map(async (techId: string) => {
          const user = await getUserById(techId);
          return user ? { id: user.id, name: getFullName(user) || `Tech ${user.id}` } : null;
        });
        
        const results = await Promise.all(techPromises);
        techDetails = results.filter((tech): tech is { id: string, name: string } => tech !== null);
        
        // Initialize labor hours for each tech
        techDetails.forEach(tech => {
          laborHours[tech.id] = 0;
        });
      } catch (err) {
        console.error('Error loading technician details:', err);
        error = 'Failed to load technician details. Please try again.';
      }
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    isLoading = true;
    error = '';
    
    try {
      // Create array of labor data entries
      const laborData = Object.entries(laborHours)
        .map(([userId, hours]) => ({ userId, hours }))
        .filter(entry => entry.hours > 0);
      
      if (laborData.length === 0) {
        if (!confirm('No labor hours entered. Continue with job completion?')) {
          isLoading = false;
          return;
        }
      }
      
      // Call the completion handler
      await onSubmit(laborData);
    } catch (err) {
      console.error('Error completing job:', err);
      error = 'Failed to complete job. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="space-y-4">
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  {/if}
  
  <div>
    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
      <svg class="w-5 h-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Enter Labor Hours
    </h3>
    
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
    
    {#if techDetails.length === 0}
      <p class="text-gray-600 italic">No technicians assigned to this job.</p>
    {:else}
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="grid grid-cols-1 gap-4">
          {#each techDetails as tech}
            <div class="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
              <div>
                <p class="font-medium text-gray-800">{tech.name}</p>
                <p class="text-sm text-gray-500">Tech ID: {tech.id}</p>
              </div>
              <div class="flex items-center space-x-2">
                <label for="hours-{tech.id}" class="text-sm font-medium text-gray-700">Hours:</label>
                <input 
                  id="hours-{tech.id}"
                  type="number" 
                  min="0" 
                  step="0.5" 
                  bind:value={laborHours[tech.id]} 
                  class="w-20 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <div class="flex justify-end">
    <button
      on:click={handleSubmit}
      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dryd-blue hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </span>
      {:else}
        Save Labor Hours
      {/if}
    </button>
  </div>
</div> 