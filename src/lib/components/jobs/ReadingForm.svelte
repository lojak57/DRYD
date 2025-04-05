<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher();
  
  // Form states
  let location = '';
  let customLocation = '';
  let material = '';
  let customMaterial = '';
  let readingValue = '';
  let readingError = '';
  let showCustomLocation = false;
  let showCustomMaterial = false;
  let submitting = false;
  
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
  
  // Handle form submission
  function handleSubmit() {
    // Reset error state
    readingError = '';
    
    // Validate form fields
    const fullLocation = getFullLocation();
    const fullMaterial = getFullMaterial();
    
    if (!fullLocation) {
      readingError = 'Location is required';
      return;
    }
    
    if (!fullMaterial) {
      readingError = 'Material type is required';
      return;
    }
    
    // Check that value is a valid number
    const readingValueNum = parseFloat(readingValue);
    if (isNaN(readingValueNum) || readingValueNum < 0) {
      readingError = 'Please enter a valid moisture reading value';
      return;
    }
    
    submitting = true;
    
    // Dispatch the reading data
    dispatch('submit', {
      location: fullLocation,
      material: fullMaterial,
      value: readingValueNum,
      timestamp: new Date()
    });
  }
</script>

<div class="p-4 bg-white rounded-lg border border-gray-200">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Log Moisture Reading</h3>
  
  {#if readingError}
    <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
      {readingError}
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Location -->
    <div>
      <label for="reading-location" class="block text-sm font-medium text-gray-700 mb-1">Area</label>
      <select
        id="reading-location"
        bind:value={location}
        on:change={handleLocationChange}
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        disabled={submitting}
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
          disabled={submitting}
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
              disabled={submitting}
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
        disabled={submitting}
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
          disabled={submitting}
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
        bind:value={readingValue}
        placeholder="e.g., 15.5"
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        disabled={submitting}
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
    
    <div class="mt-6 flex justify-end space-x-3">
      <button 
        type="button" 
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        on:click={() => dispatch('cancel')}
      >
        Cancel
      </button>
      
      <button 
        type="submit" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={submitting || !location || (showCustomLocation && !customLocation) || !material || (showCustomMaterial && !customMaterial) || !readingValue}
      >
        {#if submitting}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        {:else}
          Submit Reading
        {/if}
      </button>
    </div>
  </form>
</div> 