<script lang="ts">
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry, MoistureReadingData } from '$lib/types/LogEntry';
  import { addLogEntry } from '$lib/services/logEntries';
  import { createEventDispatcher } from 'svelte';
  
  export let jobId: string;
  export let userId: string;
  
  let location = '';
  let customLocation = '';
  let material = '';
  let customMaterial = '';
  let value = '';
  let isSubmitting = false;
  let errorMessage = '';
  let showCustomLocation = false;
  let showCustomMaterial = false;
  
  // Common room/areas in a building
  const commonLocations = [
    'Kitchen',
    'Living Room',
    'Master Bedroom',
    'Bedroom 2',
    'Bedroom 3',
    'Bathroom',
    'Master Bathroom',
    'Basement',
    'Attic',
    'Hallway',
    'Dining Room',
    'Garage',
    'Laundry Room',
    'Utility Room',
    'Office',
    'Foyer/Entryway',
    'Closet',
    'Stairwell',
    'Other (specify)'
  ];
  
  // Wall locations or specific positions
  const positionOptions = [
    'North Wall',
    'South Wall',
    'East Wall',
    'West Wall',
    'Ceiling',
    'Floor',
    'Under Window',
    'Behind Cabinet',
    'Behind Appliance',
    'Inside Wall Cavity',
    'Structural Beam',
    'Floor Joist',
    'Ceiling Joist',
    'Baseboard',
    'Other (specify)'
  ];
  
  // Common materials that might be measured for moisture
  const materialOptions = [
    'Drywall/Gypsum',
    'Wood Framing',
    'Plywood',
    'Hardwood Flooring',
    'Engineered Wood',
    'Laminate Flooring',
    'Carpet Pad',
    'Carpet',
    'Tile Substrate',
    'Concrete',
    'Masonry/Brick',
    'Insulation',
    'OSB Board',
    'MDF',
    'Ceiling Tile',
    'Subfloor',
    'Furniture',
    'Cabinets',
    'Other (specify)'
  ];
  
  // Define moisture level types
  type MoistureLevel = 'dry' | 'normal' | 'wet' | 'unknown';
  
  // Define the range interface
  interface MoistureRange {
    dry: string;
    normal: string;
    wet: string;
  }
  
  // Reference ranges for different materials with index signature
  const moistureRanges: { [key: string]: MoistureRange } = {
    'Drywall/Gypsum': { dry: '0-0.5%', normal: '0.5-1%', wet: '1%+' },
    'Wood Framing': { dry: '7-10%', normal: '10-15%', wet: '16%+' },
    'Plywood': { dry: '6-10%', normal: '10-14%', wet: '15%+' },
    'Hardwood Flooring': { dry: '6-9%', normal: '9-12%', wet: '13%+' },
    'Concrete': { dry: '0-3%', normal: '3-5%', wet: '5%+' }
  };
  
  // Handle location selection
  function handleLocationChange() {
    if (location === 'Other (specify)') {
      showCustomLocation = true;
      customLocation = '';
    } else {
      showCustomLocation = false;
    }
  }
  
  // Handle material selection
  function handleMaterialChange() {
    if (material === 'Other (specify)') {
      showCustomMaterial = true;
      customMaterial = '';
    } else {
      showCustomMaterial = false;
    }
  }
  
  // Get the full location string
  function getFullLocation() {
    if (location === 'Other (specify)' && customLocation) {
      return customLocation.trim();
    }
    return location;
  }
  
  // Get the full material string
  function getFullMaterial() {
    if (material === 'Other (specify)' && customMaterial) {
      return customMaterial.trim();
    }
    return material;
  }
  
  // Determine moisture level based on value and material
  function getMoistureLevel(value: number, material: string): MoistureLevel {
    const ranges = moistureRanges[material];
    if (!ranges) return 'unknown';
    
    const numValue = parseFloat(value.toString());
    
    // Extract the upper bound of the "normal" range to use as threshold
    const wetThreshold = parseFloat(ranges.wet.split('+')[0]);
    const dryThreshold = parseFloat(ranges.dry.split('-')[1]);
    
    if (numValue >= wetThreshold) return 'wet';
    if (numValue <= dryThreshold) return 'dry';
    return 'normal';
  }
  
  const dispatch = createEventDispatcher<{
    submit: LogEntry;
  }>();
  
  async function handleSubmit() {
    // Validate form fields
    const fullLocation = getFullLocation();
    const fullMaterial = getFullMaterial();
    
    if (!fullLocation) {
      errorMessage = 'Location is required';
      return;
    }
    
    if (!fullMaterial) {
      errorMessage = 'Material type is required';
      return;
    }
    
    // Check that value is a valid number
    const readingValue = parseFloat(value);
    if (isNaN(readingValue) || readingValue < 0) {
      errorMessage = 'Please enter a valid moisture reading value';
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      // Get moisture level assessment if material is in known ranges
      const moistureLevel = getMoistureLevel(readingValue, fullMaterial);
      
      // Prepare the moisture reading data with additional properties for our interface
      const moistureData: MoistureReadingData & { assessmentLevel?: MoistureLevel } = {
        location: fullLocation,
        material: fullMaterial,
        value: readingValue,
        assessmentLevel: moistureLevel !== 'unknown' ? moistureLevel : undefined
      };
      
      // Call the service function to add the log entry
      const newEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: LogEntryType.MOISTURE_READING,
        content: moistureData
      });
      
      // Dispatch the new entry to the parent component
      dispatch('submit', newEntry);
      
      // Reset form
      location = '';
      customLocation = '';
      material = '';
      customMaterial = '';
      value = '';
      showCustomLocation = false;
      showCustomMaterial = false;
    } catch (err) {
      console.error('Error adding moisture reading:', err);
      errorMessage = 'Failed to add moisture reading. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Log Moisture Reading</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Location -->
    <div>
      <label for="reading-location" class="block text-sm font-medium text-gray-700 mb-1">Area</label>
      <select
        id="reading-location"
        bind:value={location}
        on:change={handleLocationChange}
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        disabled={isSubmitting}
      >
        <option value="">-- Select Area --</option>
        {#each commonLocations as loc}
          <option value={loc}>{loc}</option>
        {/each}
      </select>
    </div>
    
    <!-- Custom Location input (shown only when "Other" is selected) -->
    {#if showCustomLocation}
      <div>
        <label for="custom-location" class="block text-sm font-medium text-gray-700 mb-1">Specify Area</label>
        <input
          id="custom-location"
          type="text"
          bind:value={customLocation}
          placeholder="Enter specific area"
          class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
    {/if}
    
    <!-- Position/Location detail -->
    <div>
      <label for="position-detail" class="block text-sm font-medium text-gray-700 mb-1">Position</label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2 bg-white">
        {#each positionOptions as position, i}
          <label class="inline-flex items-center p-1 hover:bg-gray-50 rounded">
            <input 
              type="radio" 
              name="position"
              value={position}
              bind:group={customLocation}
              class="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
              disabled={isSubmitting}
            >
            <span class="ml-2 text-sm text-gray-700">{position}</span>
          </label>
        {/each}
      </div>
    </div>
    
    <!-- Material -->
    <div>
      <label for="reading-material" class="block text-sm font-medium text-gray-700 mb-1">Material</label>
      <select
        id="reading-material"
        bind:value={material}
        on:change={handleMaterialChange}
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        disabled={isSubmitting}
      >
        <option value="">-- Select Material --</option>
        {#each materialOptions as mat}
          <option value={mat}>{mat}</option>
        {/each}
      </select>
    </div>
    
    <!-- Custom Material input (shown only when "Other" is selected) -->
    {#if showCustomMaterial}
      <div>
        <label for="custom-material" class="block text-sm font-medium text-gray-700 mb-1">Specify Material</label>
        <input
          id="custom-material"
          type="text"
          bind:value={customMaterial}
          placeholder="Enter specific material"
          class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
    {/if}
    
    <!-- Reading Value -->
    <div>
      <label for="reading-value" class="block text-sm font-medium text-gray-700 mb-1">Reading Value (%)</label>
      <input
        id="reading-value"
        type="number"
        min="0"
        step="0.1"
        bind:value={value}
        placeholder="e.g., 15.5"
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        disabled={isSubmitting}
      />
      
      <!-- Reference ranges for selected material -->
      {#if material && moistureRanges[material]}
        <div class="mt-2 text-xs">
          <p class="text-gray-500 mb-1">Reference ranges for {material}:</p>
          <div class="flex space-x-2">
            <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md">Dry: {moistureRanges[material].dry}</span>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">Normal: {moistureRanges[material].normal}</span>
            <span class="px-2 py-1 bg-red-100 text-red-800 rounded-md">Wet: {moistureRanges[material].wet}</span>
          </div>
        </div>
      {/if}
    </div>
    
    {#if errorMessage}
      <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
    {/if}
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting || !location || (showCustomLocation && !customLocation) || !material || (showCustomMaterial && !customMaterial) || !value}
        class="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
          Add Reading
        {/if}
      </button>
    </div>
  </form>
</div> 