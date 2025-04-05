<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { getFullName } from '$lib/types/User';
  import { getUserById } from '$lib/services/users';
  import { onMount } from 'svelte';
  
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
  
  // Calculate totals
  $: totalHours = laborEntries.reduce((sum, entry) => sum + entry.hours, 0);
  $: totalLaborCost = laborEntries.reduce((sum, entry) => sum + (entry.hours * entry.hourlyRate), 0);
  
  onMount(async () => {
    if (!job.assignedUserIds || job.assignedUserIds.length === 0) {
      errorMessage = 'No technicians assigned to this job';
      isLoading = false;
      return;
    }
    
    try {
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