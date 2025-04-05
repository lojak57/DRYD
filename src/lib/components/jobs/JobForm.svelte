<script lang="ts">
  import { onMount } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import { customers, loadCustomers, isLoading as customersLoading } from '$lib/stores/customerStore';
  
  // Props
  export let initialData: Partial<Job> = {};
  export let onSubmit: (formData: Omit<Job, 'id' | 'createdAt' | 'status' | 'equipmentIds'>) => Promise<void>;
  export let isLoading: boolean = false;
  
  // Form data with default values
  let customerId = initialData.customerId || '';
  let title = initialData.title || '';
  let jobType = initialData.jobType || 'WATER';
  let priority = initialData.priority || 3;
  let description = initialData.description || '';
  let street = initialData.siteAddress?.street || '';
  let city = initialData.siteAddress?.city || '';
  let state = initialData.siteAddress?.state || '';
  let zip = initialData.siteAddress?.zip || '';
  let incidentDate = initialData.incidentDate ? new Date(initialData.incidentDate).toISOString().slice(0, 10) : '';
  let scheduledStartDate = initialData.scheduledStartDate ? new Date(initialData.scheduledStartDate).toISOString().slice(0, 10) : '';
  let estimatedCompletionDate = initialData.estimatedCompletionDate ? new Date(initialData.estimatedCompletionDate).toISOString().slice(0, 10) : '';
  let accessInstructions = initialData.accessInstructions || '';
  
  // Insurance information
  let hasInsurance = initialData.insuranceInfo ? true : false;
  let insuranceCompany = initialData.insuranceInfo?.company || '';
  let policyNumber = initialData.insuranceInfo?.policyNumber || '';
  let claimNumber = initialData.insuranceInfo?.claimNumber || '';
  let adjustorName = initialData.insuranceInfo?.adjustorName || '';
  let adjustorPhone = initialData.insuranceInfo?.adjustorPhone || '';
  let adjustorEmail = initialData.insuranceInfo?.adjustorEmail || '';
  let deductible = initialData.insuranceInfo?.deductible || 0;
  
  // Form validation state
  let formErrors: Record<string, string> = {};
  let formValid: boolean = false;
  
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
  
  // Load customers on mount
  onMount(() => {
    loadCustomers();
  });
  
  // Validate form
  function validateForm() {
    formErrors = {};
    
    // Required fields
    if (!customerId) formErrors.customerId = 'Customer is required';
    if (!title) formErrors.title = 'Job title is required';
    if (!jobType) formErrors.jobType = 'Job type is required';
    if (!street) formErrors.street = 'Street address is required';
    if (!city) formErrors.city = 'City is required';
    if (!state) formErrors.state = 'State is required';
    if (!zip) formErrors.zip = 'ZIP code is required';
    
    // Insurance validation
    if (hasInsurance) {
      if (!insuranceCompany) formErrors.insuranceCompany = 'Insurance company is required';
      if (!policyNumber) formErrors.policyNumber = 'Policy number is required';
      if (!claimNumber) formErrors.claimNumber = 'Claim number is required';
    }
    
    // Check if form is valid
    formValid = Object.keys(formErrors).length === 0;
    return formValid;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;
    
    // Create job data object
    const jobData = {
      customerId,
      title,
      jobType,
      priority,
      description,
      siteAddress: {
        street,
        city,
        state,
        zip
      },
      incidentDate: incidentDate ? new Date(incidentDate).toISOString() : undefined,
      scheduledStartDate: scheduledStartDate ? new Date(scheduledStartDate).toISOString() : undefined,
      estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate).toISOString() : undefined,
      accessInstructions,
      insuranceInfo: hasInsurance ? {
        company: insuranceCompany,
        policyNumber,
        claimNumber,
        adjustorName,
        adjustorPhone,
        adjustorEmail,
        deductible: typeof deductible === 'string' ? parseInt(deductible, 10) : deductible,
        isInsuranceClaim: true
      } : undefined
    };
    
    // Submit the form
    await onSubmit(jobData as any);
  }
  
  // Format date for min attribute
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Job Information</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Customer Selection -->
      <div class="col-span-1">
        <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer <span class="text-red-500">*</span></label>
        <select 
          id="customerId"
          bind:value={customerId}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
          class:border-red-500={formErrors.customerId}
        >
          <option value="" disabled>Select a customer</option>
          {#if $customersLoading}
            <option value="" disabled>Loading customers...</option>
          {:else}
            {#each $customers as customer}
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
          bind:value={title}
          placeholder="E.g., Water damage restoration - Smith residence"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
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
          bind:value={jobType}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
          class:border-red-500={formErrors.jobType}
        >
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
          bind:value={priority}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
        >
          {#each priorityLevels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <!-- Description -->
    <div class="mt-4">
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea 
        id="description"
        bind:value={description}
        rows="4"
        placeholder="Detailed description of the job"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isLoading}
      ></textarea>
    </div>
  </div>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Site Address</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Street -->
      <div class="col-span-2">
        <label for="street" class="block text-sm font-medium text-gray-700 mb-1">Street <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          id="street"
          bind:value={street}
          placeholder="Street address"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
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
          bind:value={city}
          placeholder="City"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
          class:border-red-500={formErrors.city}
        >
        {#if formErrors.city}
          <p class="mt-1 text-sm text-red-600">{formErrors.city}</p>
        {/if}
      </div>
      
      <!-- State -->
      <div class="col-span-1 md:col-span-1/2">
        <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          id="state"
          bind:value={state}
          placeholder="State"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
          class:border-red-500={formErrors.state}
        >
        {#if formErrors.state}
          <p class="mt-1 text-sm text-red-600">{formErrors.state}</p>
        {/if}
      </div>
      
      <!-- ZIP -->
      <div class="col-span-1 md:col-span-1/2">
        <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">ZIP <span class="text-red-500">*</span></label>
        <input 
          type="text" 
          id="zip"
          bind:value={zip}
          placeholder="ZIP code"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
          class:border-red-500={formErrors.zip}
        >
        {#if formErrors.zip}
          <p class="mt-1 text-sm text-red-600">{formErrors.zip}</p>
        {/if}
      </div>
    </div>
    
    <!-- Access Instructions -->
    <div class="mt-4">
      <label for="accessInstructions" class="block text-sm font-medium text-gray-700 mb-1">Access Instructions</label>
      <textarea 
        id="accessInstructions"
        bind:value={accessInstructions}
        rows="2"
        placeholder="Special instructions for accessing the property"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isLoading}
      ></textarea>
    </div>
  </div>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Dates</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Incident Date -->
      <div>
        <label for="incidentDate" class="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
        <input 
          type="date" 
          id="incidentDate"
          bind:value={incidentDate}
          max={getToday()}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
        >
      </div>
      
      <!-- Scheduled Start Date -->
      <div>
        <label for="scheduledStartDate" class="block text-sm font-medium text-gray-700 mb-1">Scheduled Start Date</label>
        <input 
          type="date" 
          id="scheduledStartDate"
          bind:value={scheduledStartDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
        >
      </div>
      
      <!-- Estimated Completion Date -->
      <div>
        <label for="estimatedCompletionDate" class="block text-sm font-medium text-gray-700 mb-1">Est. Completion Date</label>
        <input 
          type="date" 
          id="estimatedCompletionDate"
          bind:value={estimatedCompletionDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isLoading}
        >
      </div>
    </div>
  </div>
  
  <div class="mb-6">
    <div class="flex items-center mb-4">
      <input 
        type="checkbox" 
        id="hasInsurance"
        bind:checked={hasInsurance}
        class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
        disabled={isLoading}
      >
      <label for="hasInsurance" class="ml-2 text-lg font-semibold text-gray-800">Insurance Information</label>
    </div>
    
    {#if hasInsurance}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <!-- Insurance Company -->
        <div>
          <label for="insuranceCompany" class="block text-sm font-medium text-gray-700 mb-1">Insurance Company <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            id="insuranceCompany"
            bind:value={insuranceCompany}
            placeholder="E.g., State Farm"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
            class:border-red-500={formErrors.insuranceCompany}
          >
          {#if formErrors.insuranceCompany}
            <p class="mt-1 text-sm text-red-600">{formErrors.insuranceCompany}</p>
          {/if}
        </div>
        
        <!-- Policy Number -->
        <div>
          <label for="policyNumber" class="block text-sm font-medium text-gray-700 mb-1">Policy Number <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            id="policyNumber"
            bind:value={policyNumber}
            placeholder="E.g., POL-12345"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
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
            bind:value={claimNumber}
            placeholder="E.g., CLM-67890"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
            class:border-red-500={formErrors.claimNumber}
          >
          {#if formErrors.claimNumber}
            <p class="mt-1 text-sm text-red-600">{formErrors.claimNumber}</p>
          {/if}
        </div>
        
        <!-- Deductible -->
        <div>
          <label for="deductible" class="block text-sm font-medium text-gray-700 mb-1">Deductible ($)</label>
          <input 
            type="number" 
            id="deductible"
            bind:value={deductible}
            min="0"
            step="100"
            placeholder="E.g., 1000"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
          >
        </div>
        
        <!-- Adjustor Name -->
        <div>
          <label for="adjustorName" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Name</label>
          <input 
            type="text" 
            id="adjustorName"
            bind:value={adjustorName}
            placeholder="E.g., John Smith"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
          >
        </div>
        
        <!-- Adjustor Phone -->
        <div>
          <label for="adjustorPhone" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Phone</label>
          <input 
            type="tel" 
            id="adjustorPhone"
            bind:value={adjustorPhone}
            placeholder="E.g., 555-123-4567"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
          >
        </div>
        
        <!-- Adjustor Email -->
        <div class="md:col-span-2">
          <label for="adjustorEmail" class="block text-sm font-medium text-gray-700 mb-1">Adjustor Email</label>
          <input 
            type="email" 
            id="adjustorEmail"
            bind:value={adjustorEmail}
            placeholder="E.g., john.smith@insurance.example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
            disabled={isLoading}
          >
        </div>
      </div>
    {/if}
  </div>
  
  <div class="flex justify-end space-x-3 border-t border-gray-200 pt-4">
    <a 
      href="/dashboard" 
      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue {isLoading ? 'pointer-events-none opacity-50' : ''}"
    >
      Cancel
    </a>
    <button 
      type="submit" 
      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dryd-blue hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating...
        </span>
      {:else}
        {initialData.id ? 'Update Job' : 'Create Job'}
      {/if}
    </button>
  </div>
</form> 