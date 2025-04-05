<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import type { Customer } from '$lib/types/Customer';
  
  // Props
  export let formData: any;
  export let customers: Customer[] = [];
  export let customersLoading: boolean = false;
  export let disabled: boolean = false;
  export let updateValidation: (isValid: boolean) => void;
  
  // Form errors
  let formErrors: Record<string, string> = {};
  
  // Job types
  const jobTypes = [
    { value: 'WATER', label: 'Water Damage' },
    { value: 'FIRE', label: 'Fire Damage' },
    { value: 'MOLD', label: 'Mold Remediation' },
    { value: 'SMOKE', label: 'Smoke Damage' },
    { value: 'STORM', label: 'Storm Damage' },
    { value: 'OTHER', label: 'Other' }
  ];
  
  // Priority levels
  const priorityLevels = [
    { value: 1, label: '1 - Low' },
    { value: 2, label: '2' },
    { value: 3, label: '3 - Medium' },
    { value: 4, label: '4' },
    { value: 5, label: '5 - High' }
  ];

  // Structured description data
  let damageSource = '';
  let areasAffected = '';
  let materialsAffected: string[] = [];
  let damageState = '';
  let contaminants: string[] = [];
  let specialConsiderations = '';

  // Damage source options for water damage
  const waterDamageSources = [
    'Burst pipe',
    'Roof leak',
    'Plumbing leak',
    'Flooding',
    'Appliance overflow',
    'Sewage backup',
    'Sprinkler system',
    'Weather-related',
    'Unknown',
    'Other'
  ];

  // Damage source options for fire damage
  const fireDamageSources = [
    'Kitchen fire',
    'Electrical fire',
    'Heating system',
    'Candle/Open flame',
    'Smoking',
    'Lightning',
    'Wildfire',
    'Unknown',
    'Other'
  ];

  // Areas affected options
  const commonAreas = [
    'Kitchen',
    'Bathroom',
    'Bedroom',
    'Living room',
    'Basement',
    'Attic',
    'Garage',
    'Entire floor',
    'Multiple floors',
    'Entire building',
    'Other'
  ];

  // Materials affected options
  const materialOptions = [
    'Drywall',
    'Hardwood flooring',
    'Carpet',
    'Tile',
    'Furniture',
    'Cabinets',
    'Insulation',
    'Ceiling',
    'Electronics',
    'Personal belongings',
    'Structural elements',
    'Other'
  ];

  // Damage state options
  const damageStateOptions = [
    'Standing water present',
    'Moisture in walls/floors',
    'Active leak ongoing',
    'Recently dried but still damp',
    'Smoke damage only',
    'Charred materials present',
    'Visible mold growth',
    'Odor present',
    'Other'
  ];

  // Contaminant options
  const contaminantOptions = [
    'Black/Gray water',
    'Sewage',
    'Mold',
    'Chemical',
    'Asbestos',
    'Lead',
    'Smoke residue',
    'Other'
  ];

  // Function to update the description field based on structured data
  function updateDescription() {
    // Create sections only for fields that have values
    const sections = [];
    
    if (damageSource) {
      sections.push(`SOURCE OF DAMAGE: ${damageSource}`);
    }
    
    if (areasAffected) {
      sections.push(`AREAS AFFECTED: ${areasAffected}`);
    }
    
    if (materialsAffected.length > 0) {
      sections.push(`MATERIALS AFFECTED: ${materialsAffected.join(', ')}`);
    }
    
    if (damageState) {
      sections.push(`CURRENT STATE: ${damageState}`);
    }
    
    if (contaminants.length > 0) {
      sections.push(`CONTAMINANTS PRESENT: ${contaminants.join(', ')}`);
    }
    
    if (specialConsiderations) {
      sections.push(`SPECIAL CONSIDERATIONS: ${specialConsiderations}`);
    }
    
    // Update the main description field
    formData.description = sections.join('\n\n');
  }

  // Filter damage source options based on job type
  $: damageSourceOptions = formData.jobType === 'FIRE' || formData.jobType === 'SMOKE' 
    ? fireDamageSources 
    : waterDamageSources;
  
  // Validate the form
  function validateForm() {
    formErrors = {};
    
    // Required fields
    if (!formData.customerId) formErrors.customerId = 'Customer is required';
    if (!formData.title) formErrors.title = 'Job title is required';
    if (!formData.jobType) formErrors.jobType = 'Job type is required';
    
    // Return validity
    const isValid = Object.keys(formErrors).length === 0;
    updateValidation(isValid);
    return isValid;
  }
  
  // Setup validation on component initialization
  onMount(() => {
    // Initialize any structured data from existing description, if present
    validateForm();
  });
  
  // Validate on form data changes
  afterUpdate(validateForm);

  // Watch for changes in structured fields and update the description
  $: if (damageSource || areasAffected || materialsAffected.length || damageState || 
         contaminants.length || specialConsiderations) {
    updateDescription();
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-800 mb-6">Job Information</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Customer Selection -->
    <div class="col-span-1">
      <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer <span class="text-red-500">*</span></label>
      <select 
        id="customerId"
        bind:value={formData.customerId}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
        class:border-red-500={formErrors.customerId}
      >
        <option value="" disabled>Select a customer</option>
        {#if customersLoading}
          <option value="" disabled>Loading customers...</option>
        {:else}
          {#each customers as customer}
            <option value={customer.id}>{customer.name}</option>
          {/each}
        {/if}
      </select>
      {#if formErrors.customerId}
        <p class="mt-1 text-sm text-red-600">{formErrors.customerId}</p>
      {/if}
    </div>
    
    <!-- Job Title -->
    <div class="col-span-1">
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Job Title <span class="text-red-500">*</span></label>
      <input 
        type="text" 
        id="title"
        bind:value={formData.title}
        placeholder="E.g., Water damage restoration - Smith residence"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
        class:border-red-500={formErrors.title}
      >
      {#if formErrors.title}
        <p class="mt-1 text-sm text-red-600">{formErrors.title}</p>
      {/if}
    </div>
    
    <!-- Job Type -->
    <div class="col-span-1">
      <label for="jobType" class="block text-sm font-medium text-gray-700 mb-1">Job Type <span class="text-red-500">*</span></label>
      <select 
        id="jobType"
        bind:value={formData.jobType}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
        class:border-red-500={formErrors.jobType}
      >
        <option value="" disabled selected>Select job type</option>
        {#each jobTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
      {#if formErrors.jobType}
        <p class="mt-1 text-sm text-red-600">{formErrors.jobType}</p>
      {/if}
    </div>
    
    <!-- Priority -->
    <div class="col-span-1">
      <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
      <select 
        id="priority"
        bind:value={formData.priority}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
      >
        {#each priorityLevels as level}
          <option value={level.value}>{level.label}</option>
        {/each}
      </select>
    </div>
  </div>
  
  <!-- Structured Description Fields -->
  <div class="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
    <h3 class="text-md font-semibold text-gray-700 mb-4">Job Details</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Source of Damage -->
      <div>
        <label for="damageSource" class="block text-sm font-medium text-gray-700 mb-1">Source of Damage</label>
        <select 
          id="damageSource"
          bind:value={damageSource}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
        >
          <option value="">Select source</option>
          {#each damageSourceOptions as source}
            <option value={source}>{source}</option>
          {/each}
        </select>
      </div>
      
      <!-- Areas Affected -->
      <div>
        <label for="areasAffected" class="block text-sm font-medium text-gray-700 mb-1">Areas Affected</label>
        <select 
          id="areasAffected"
          bind:value={areasAffected}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
        >
          <option value="">Select area</option>
          {#each commonAreas as area}
            <option value={area}>{area}</option>
          {/each}
        </select>
      </div>
      
      <!-- Materials Affected -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Materials Affected</label>
        <div class="bg-white p-3 border border-gray-300 rounded-md max-h-32 overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            {#each materialOptions as material}
              <label class="inline-flex items-center">
                <input 
                  type="checkbox" 
                  value={material}
                  bind:group={materialsAffected}
                  class="rounded border-gray-300 text-dryd-blue focus:ring-dryd-blue"
                  {disabled}
                >
                <span class="ml-2 text-sm text-gray-700">{material}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Current State -->
      <div>
        <label for="damageState" class="block text-sm font-medium text-gray-700 mb-1">Current State</label>
        <select 
          id="damageState"
          bind:value={damageState}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
        >
          <option value="">Select state</option>
          {#each damageStateOptions as state}
            <option value={state}>{state}</option>
          {/each}
        </select>
      </div>
      
      <!-- Contaminants Present -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Contaminants Present</label>
        <div class="bg-white p-3 border border-gray-300 rounded-md">
          <div class="grid grid-cols-2 gap-2">
            {#each contaminantOptions as contaminant}
              <label class="inline-flex items-center">
                <input 
                  type="checkbox" 
                  value={contaminant}
                  bind:group={contaminants}
                  class="rounded border-gray-300 text-dryd-blue focus:ring-dryd-blue"
                  {disabled}
                >
                <span class="ml-2 text-sm text-gray-700">{contaminant}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Special Considerations -->
      <div class="md:col-span-2">
        <label for="specialConsiderations" class="block text-sm font-medium text-gray-700 mb-1">Special Considerations</label>
        <textarea 
          id="specialConsiderations"
          bind:value={specialConsiderations}
          rows="3"
          placeholder="Enter any special considerations (pets, valuables, access info, etc.)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
        ></textarea>
      </div>
    </div>
  </div>
  
  <!-- Full Description (hidden, will be auto-populated) -->
  <div class="hidden">
    <textarea 
      id="description"
      bind:value={formData.description}
      rows="5"
    ></textarea>
  </div>
</div> 