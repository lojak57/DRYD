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
    
    // Only validate if insurance is selected
    if (formData.hasInsurance) {
      if (!formData.insuranceInfo.company) formErrors.company = 'Insurance company is required';
      if (!formData.insuranceInfo.policyNumber) formErrors.policyNumber = 'Policy number is required';
      if (!formData.insuranceInfo.claimNumber) formErrors.claimNumber = 'Claim number is required';
    }
    
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
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Insurance Information</h2>
    
    <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
      <div class="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-blue-700">
          If this job is covered by insurance, add the insurance information below. This will be used for billing and documentation.
        </p>
      </div>
    </div>
  </div>
  
  <div class="flex items-center mb-6">
    <input 
      type="checkbox" 
      id="hasInsurance"
      bind:checked={formData.hasInsurance}
      class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
      {disabled}
    >
    <label for="hasInsurance" class="ml-2 font-medium text-gray-700">This job is covered by insurance</label>
  </div>
  
  {#if formData.hasInsurance}
    <div class="bg-gray-50 p-6 rounded-md border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Insurance Company -->
        <div>
          <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Insurance Company <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            id="company"
            bind:value={formData.insuranceInfo.company}
            placeholder="E.g., State Farm"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
            class:border-red-500={formErrors.company}
          >
          {#if formErrors.company}
            <p class="mt-1 text-sm text-red-600">{formErrors.company}</p>
          {/if}
        </div>
        
        <!-- Policy Number -->
        <div>
          <label for="policyNumber" class="block text-sm font-medium text-gray-700 mb-1">Policy Number <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            id="policyNumber"
            bind:value={formData.insuranceInfo.policyNumber}
            placeholder="E.g., POL-12345"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
            class:border-red-500={formErrors.policyNumber}
          >
          {#if formErrors.policyNumber}
            <p class="mt-1 text-sm text-red-600">{formErrors.policyNumber}</p>
          {/if}
        </div>
        
        <!-- Claim Number -->
        <div>
          <label for="claimNumber" class="block text-sm font-medium text-gray-700 mb-1">Claim Number <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            id="claimNumber"
            bind:value={formData.insuranceInfo.claimNumber}
            placeholder="E.g., CLM-67890"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
            class:border-red-500={formErrors.claimNumber}
          >
          {#if formErrors.claimNumber}
            <p class="mt-1 text-sm text-red-600">{formErrors.claimNumber}</p>
          {/if}
        </div>
        
        <!-- Deductible -->
        <div>
          <div class="flex items-start">
            <label for="deductible" class="block text-sm font-medium text-gray-700 mb-1">Deductible ($)</label>
            <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
          </div>
          <input 
            type="number" 
            id="deductible"
            bind:value={formData.insuranceInfo.deductible}
            min="0"
            step="100"
            placeholder="E.g., 1000"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
          >
        </div>
      </div>
      
      <h3 class="text-md font-medium text-gray-700 mt-6 mb-4">Adjustor Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Adjustor Name -->
        <div>
          <div class="flex items-start">
            <label for="adjustorName" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Name</label>
            <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
          </div>
          <input 
            type="text" 
            id="adjustorName"
            bind:value={formData.insuranceInfo.adjustorName}
            placeholder="E.g., John Smith"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
          >
        </div>
        
        <!-- Adjustor Phone -->
        <div>
          <div class="flex items-start">
            <label for="adjustorPhone" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Phone</label>
            <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
          </div>
          <input 
            type="tel" 
            id="adjustorPhone"
            bind:value={formData.insuranceInfo.adjustorPhone}
            placeholder="E.g., 555-123-4567"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
          >
        </div>
        
        <!-- Adjustor Email -->
        <div class="md:col-span-2">
          <div class="flex items-start">
            <label for="adjustorEmail" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Email</label>
            <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
          </div>
          <input 
            type="email" 
            id="adjustorEmail"
            bind:value={formData.insuranceInfo.adjustorEmail}
            placeholder="E.g., john.smith@insurance.example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            {disabled}
          >
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-gray-50 p-6 rounded-md border border-gray-200 text-center text-gray-500">
      <p>No insurance information will be added to this job.</p>
    </div>
  {/if}
</div> 