<script lang="ts">
  import { onMount } from 'svelte';
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry } from '$lib/types/LogEntry';
  import type { Equipment, EquipmentLogData } from '$lib/types/Equipment';
  import { EquipmentStatus } from '$lib/types/Equipment';
  import { addLogEntry } from '$lib/services/logEntries';
  import { 
    getAvailableEquipment, 
    getEquipmentByIds,
    setEquipmentStatus,
    addEquipmentToJob,
    removeEquipmentFromJob
  } from '$lib/services/equipment';
  import { createEventDispatcher } from 'svelte';
  
  export let jobId: string;
  export let userId: string;
  export let currentEquipmentIds: string[] = [];
  
  let action: 'placement' | 'removal' = 'placement';
  let selectedEquipmentId: string = '';
  let location: string = '';
  let settings: string = '';
  let notes: string = '';
  
  let availableEquipment: Equipment[] = [];
  let equipmentOnJob: Equipment[] = [];
  
  let isSubmitting = false;
  let isLoadingEquipment = true;
  let errorMessage = '';
  
  const dispatch = createEventDispatcher<{
    submit: LogEntry;
  }>();
  
  onMount(async () => {
    await loadEquipmentLists();
  });
  
  async function loadEquipmentLists() {
    isLoadingEquipment = true;
    errorMessage = '';
    
    try {
      // Load available equipment for placement
      availableEquipment = await getAvailableEquipment();
      
      // Load equipment currently on this job for removal
      if (currentEquipmentIds && currentEquipmentIds.length > 0) {
        equipmentOnJob = await getEquipmentByIds(currentEquipmentIds);
      } else {
        equipmentOnJob = [];
      }
    } catch (err) {
      console.error('Error loading equipment lists:', err);
      errorMessage = 'Failed to load equipment data. Please try again.';
    } finally {
      isLoadingEquipment = false;
    }
  }
  
  async function handleSubmit() {
    if (!selectedEquipmentId) {
      errorMessage = 'Please select equipment';
      return;
    }
    
    if (action === 'placement' && !location.trim()) {
      errorMessage = 'Please specify the location where the equipment will be placed';
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      // Find the full equipment object based on the selected ID
      const selectedEquipment = action === 'placement'
        ? availableEquipment.find(e => e.id === selectedEquipmentId)
        : equipmentOnJob.find(e => e.id === selectedEquipmentId);
      
      if (!selectedEquipment) {
        throw new Error(`Could not find selected equipment with ID ${selectedEquipmentId}`);
      }
      
      // Prepare log entry data
      const equipmentLogData: EquipmentLogData = {
        action,
        equipmentId: selectedEquipment.id,
        equipmentType: selectedEquipment.type,
        equipmentModel: selectedEquipment.model,
        equipmentSerialNumber: selectedEquipment.serialNumber,
        location: action === 'placement' ? location.trim() : undefined,
        settings: settings.trim() ? { description: settings.trim() } : undefined,
        notes: notes.trim() || undefined
      };
      
      // Add the log entry
      const newEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: action === 'placement' ? LogEntryType.EQUIPMENT_PLACEMENT : LogEntryType.EQUIPMENT_REMOVAL,
        content: equipmentLogData
      });
      
      // Update equipment status and job associations
      if (action === 'placement') {
        setEquipmentStatus(selectedEquipmentId, EquipmentStatus.DEPLOYED, jobId);
        addEquipmentToJob(jobId, selectedEquipmentId);
      } else {
        setEquipmentStatus(selectedEquipmentId, EquipmentStatus.AVAILABLE, null);
        removeEquipmentFromJob(jobId, selectedEquipmentId);
      }
      
      // Dispatch the new entry to the parent component
      dispatch('submit', newEntry);
      
      // Reset form
      selectedEquipmentId = '';
      location = '';
      settings = '';
      notes = '';
      
      // Reload equipment lists to reflect the changes
      await loadEquipmentLists();
    } catch (err) {
      console.error('Error adding equipment log:', err);
      errorMessage = 'Failed to add equipment log. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Log Equipment {action === 'placement' ? 'Placement' : 'Removal'}</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Equipment Action Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input
            type="radio"
            bind:group={action}
            value="placement"
            class="form-radio h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            disabled={isSubmitting}
          />
          <span class="ml-2 text-sm text-gray-700">Place Equipment</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="radio"
            bind:group={action}
            value="removal"
            class="form-radio h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            disabled={isSubmitting}
          />
          <span class="ml-2 text-sm text-gray-700">Remove Equipment</span>
        </label>
      </div>
    </div>
    
    <!-- Equipment Selection for Placement -->
    {#if action === 'placement'}
      <div>
        <label for="equipment-placement" class="block text-sm font-medium text-gray-700 mb-1">
          Select Equipment to Place
        </label>
        <select
          id="equipment-placement"
          bind:value={selectedEquipmentId}
          class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          disabled={isSubmitting || isLoadingEquipment}
        >
          <option value="">-- Select Equipment --</option>
          {#if isLoadingEquipment}
            <option disabled>Loading equipment...</option>
          {:else if availableEquipment.length === 0}
            <option disabled>No equipment available</option>
          {:else}
            {#each availableEquipment as equipment}
              <option value={equipment.id}>
                {equipment.type} - {equipment.model} (SN: {equipment.serialNumber})
              </option>
            {/each}
          {/if}
        </select>
      </div>
      
      <!-- Location (for placement) -->
      <div>
        <label for="equipment-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          id="equipment-location"
          type="text"
          bind:value={location}
          placeholder="e.g., Master Bedroom East Wall"
          class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
      
      <!-- Settings (for placement) -->
      <div>
        <label for="equipment-settings" class="block text-sm font-medium text-gray-700 mb-1">Settings (optional)</label>
        <input
          id="equipment-settings"
          type="text"
          bind:value={settings}
          placeholder="e.g., Medium fan speed, 40% humidity target"
          class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
    {:else}
      <!-- Equipment Selection for Removal -->
      <div>
        <label for="equipment-removal" class="block text-sm font-medium text-gray-700 mb-1">
          Select Equipment to Remove
        </label>
        <select
          id="equipment-removal"
          bind:value={selectedEquipmentId}
          class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          disabled={isSubmitting || isLoadingEquipment}
        >
          <option value="">-- Select Equipment --</option>
          {#if isLoadingEquipment}
            <option disabled>Loading equipment...</option>
          {:else if equipmentOnJob.length === 0}
            <option disabled>No equipment currently on this job</option>
          {:else}
            {#each equipmentOnJob as equipment}
              <option value={equipment.id}>
                {equipment.type} - {equipment.model} (SN: {equipment.serialNumber})
              </option>
            {/each}
          {/if}
        </select>
      </div>
    {/if}
    
    <!-- Notes (optional for both) -->
    <div>
      <label for="equipment-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
      <textarea
        id="equipment-notes"
        bind:value={notes}
        rows="2"
        placeholder="Any additional notes about the equipment..."
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        disabled={isSubmitting}
      ></textarea>
    </div>
    
    {#if errorMessage}
      <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
    {/if}
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting || isLoadingEquipment || !selectedEquipmentId || (action === 'placement' && !location.trim())}
        class="px-4 py-2 bg-purple-600 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        {:else}
          Log Equipment {action === 'placement' ? 'Placement' : 'Removal'}
        {/if}
      </button>
    </div>
  </form>
</div> 