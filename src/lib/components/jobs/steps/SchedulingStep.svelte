<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  
  // Props
  export let formData: any;
  export let disabled: boolean = false;
  export let updateValidation: (isValid: boolean) => void;
  
  // Form errors
  let formErrors: Record<string, string> = {};
  
  // Format date for min attribute
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }
  
  // Get tomorrow's date for default scheduling
  function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Get default completion date (2 weeks from tomorrow)
  function getDefaultCompletionDate() {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  }
  
  // Set default dates if they're not already set
  function setDefaultDates() {
    if (!formData.scheduledStartDate) {
      formData.scheduledStartDate = getTomorrow();
    }
    
    if (!formData.estimatedCompletionDate) {
      formData.estimatedCompletionDate = getDefaultCompletionDate();
    }
  }
  
  // Validate the form
  function validateForm() {
    formErrors = {};
    
    // Validate dates consistency
    if (formData.incidentDate && formData.scheduledStartDate && 
        new Date(formData.incidentDate) > new Date(formData.scheduledStartDate)) {
      formErrors.scheduledStartDate = 'Scheduled start date must be after the incident date';
    }
    
    if (formData.scheduledStartDate && formData.estimatedCompletionDate && 
        new Date(formData.scheduledStartDate) > new Date(formData.estimatedCompletionDate)) {
      formErrors.estimatedCompletionDate = 'Estimated completion date must be after the scheduled start date';
    }
    
    // All fields are optional, but validation rules still apply
    const isValid = Object.keys(formErrors).length === 0;
    updateValidation(isValid);
    return isValid;
  }
  
  // Setup validation and defaults on component initialization
  onMount(() => {
    setDefaultDates();
    validateForm();
  });
  
  // Validate on form data changes
  afterUpdate(validateForm);
</script>

<div>
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Scheduling Information</h2>
    
    <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
      <div class="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-blue-700">
          Set the incident date and schedule the job. The incident date helps track response time and may be important for insurance claims.
        </p>
      </div>
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Incident Date -->
    <div>
      <div class="flex items-start">
        <label for="incidentDate" class="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
        <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Optional</span>
      </div>
      <input 
        type="date" 
        id="incidentDate"
        bind:value={formData.incidentDate}
        max={getToday()}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        {disabled}
      >
      <p class="mt-1 text-xs text-gray-500">When did the incident occur?</p>
    </div>
    
    <!-- Scheduled Start Date -->
    <div>
      <label for="scheduledStartDate" class="block text-sm font-medium text-gray-700 mb-1">Scheduled Start Date</label>
      <input 
        type="date" 
        id="scheduledStartDate"
        bind:value={formData.scheduledStartDate}
        min={getToday()}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue {formErrors.scheduledStartDate ? 'border-red-500' : ''}"
        {disabled}
      >
      {#if formErrors.scheduledStartDate}
        <p class="mt-1 text-sm text-red-600">{formErrors.scheduledStartDate}</p>
      {:else}
        <p class="mt-1 text-xs text-gray-500">When will work begin?</p>
      {/if}
    </div>
    
    <!-- Estimated Completion Date -->
    <div>
      <label for="estimatedCompletionDate" class="block text-sm font-medium text-gray-700 mb-1">Est. Completion Date</label>
      <input 
        type="date" 
        id="estimatedCompletionDate"
        bind:value={formData.estimatedCompletionDate}
        min={formData.scheduledStartDate || getToday()}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue {formErrors.estimatedCompletionDate ? 'border-red-500' : ''}"
        {disabled}
      >
      {#if formErrors.estimatedCompletionDate}
        <p class="mt-1 text-sm text-red-600">{formErrors.estimatedCompletionDate}</p>
      {:else}
        <p class="mt-1 text-xs text-gray-500">When is work expected to be completed?</p>
      {/if}
    </div>
  </div>
</div> 