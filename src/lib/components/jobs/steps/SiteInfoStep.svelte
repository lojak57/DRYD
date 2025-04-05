<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  
  // Props
  export let formData: any;
  export let disabled: boolean = false;
  export let updateValidation: (isValid: boolean) => void;
  
  // Form errors
  let formErrors: Record<string, string> = {};
  
  // Validate the form
  function validateForm() {
    formErrors = {};
    
    // Required fields
    if (!formData.siteAddress.street) formErrors.street = 'Street address is required';
    if (!formData.siteAddress.city) formErrors.city = 'City is required';
    if (!formData.siteAddress.state) formErrors.state = 'State is required';
    if (!formData.siteAddress.zip) formErrors.zip = 'ZIP code is required';
    
    // Return validity
    const isValid = Object.keys(formErrors).length === 0;
    updateValidation(isValid);
    return isValid;
  }
  
  // Setup validation on component initialization
  onMount(validateForm);
  
  // Validate on form data changes
  afterUpdate(validateForm);
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-800 mb-6">Site Address</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Street Address -->
    <div class="col-span-2">
      <label for="street" class="block text-sm font-medium text-gray-700 mb-1">Street Address <span class="text-red-500">*</span></label>
      <input 
        type="text" 
        id="street"
        bind:value={formData.siteAddress.street}
        placeholder="Street address"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
        class:border-red-500={formErrors.street}
      >
      {#if formErrors.street}
        <p class="mt-1 text-sm text-red-600">{formErrors.street}</p>
      {/if}
    </div>
    
    <!-- City -->
    <div class="col-span-1">
      <label for="city" class="block text-sm font-medium text-gray-700 mb-1">City <span class="text-red-500">*</span></label>
      <input 
        type="text" 
        id="city"
        bind:value={formData.siteAddress.city}
        placeholder="City"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
        class:border-red-500={formErrors.city}
      >
      {#if formErrors.city}
        <p class="mt-1 text-sm text-red-600">{formErrors.city}</p>
      {/if}
    </div>
    
    <!-- State -->
    <div class="col-span-1 md:grid md:grid-cols-2 md:gap-6">
      <!-- State field -->
      <div>
        <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          id="state"
          bind:value={formData.siteAddress.state}
          placeholder="State"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
          class:border-red-500={formErrors.state}
        >
        {#if formErrors.state}
          <p class="mt-1 text-sm text-red-600">{formErrors.state}</p>
        {/if}
      </div>
      
      <!-- ZIP field -->
      <div>
        <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">ZIP <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          id="zip"
          bind:value={formData.siteAddress.zip}
          placeholder="ZIP code"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          {disabled}
          class:border-red-500={formErrors.zip}
        >
        {#if formErrors.zip}
          <p class="mt-1 text-sm text-red-600">{formErrors.zip}</p>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Access Instructions -->
  <div class="mt-6">
    <div class="flex items-start">
      <label for="accessInstructions" class="block text-sm font-medium text-gray-700 mb-1">Access Instructions</label>
      <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
    </div>
    <textarea 
      id="accessInstructions"
      bind:value={formData.accessInstructions}
      rows="4"
      placeholder="Special instructions for accessing the property (e.g., lockbox code, gate instructions, etc.)"
      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
      {disabled}
    ></textarea>
  </div>
</div> 