<script lang="ts">
  import { onMount } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import { customers, loadCustomers, isLoading as customersLoading } from '$lib/stores/customerStore';
  
  import StepIndicator from './steps/StepIndicator.svelte';
  import JobInfoStep from './steps/JobInfoStep.svelte';
  import SiteInfoStep from './steps/SiteInfoStep.svelte';
  import SchedulingStep from './steps/SchedulingStep.svelte';
  import InsuranceStep from './steps/InsuranceStep.svelte';
  import ReviewStep from './steps/ReviewStep.svelte';
  
  // Props
  export let initialData: Partial<Job> = {};
  export let onSubmit: (formData: Omit<Job, 'id' | 'createdAt' | 'status' | 'equipmentIds'>) => Promise<void>;
  export let isLoading: boolean = false;
  
  // Define steps
  const steps = [
    { id: 'job-info', label: 'Job Info' },
    { id: 'site-info', label: 'Site Info' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'review', label: 'Review' }
  ];
  
  // Current step
  let currentStepIndex = 0;
  $: currentStep = steps[currentStepIndex];
  
  // Form data with default values - combined from all steps
  let formData = {
    customerId: initialData.customerId || '',
    title: initialData.title || '',
    jobType: initialData.jobType || 'WATER',
    priority: initialData.priority || 3,
    description: initialData.description || '',
    siteAddress: {
      street: initialData.siteAddress?.street || '',
      city: initialData.siteAddress?.city || '',
      state: initialData.siteAddress?.state || '',
      zip: initialData.siteAddress?.zip || ''
    },
    accessInstructions: initialData.accessInstructions || '',
    incidentDate: initialData.incidentDate ? new Date(initialData.incidentDate).toISOString().slice(0, 10) : '',
    scheduledStartDate: initialData.scheduledStartDate ? new Date(initialData.scheduledStartDate).toISOString().slice(0, 10) : '',
    estimatedCompletionDate: initialData.estimatedCompletionDate ? new Date(initialData.estimatedCompletionDate).toISOString().slice(0, 10) : '',
    hasInsurance: initialData.insuranceInfo ? true : false,
    insuranceInfo: {
      company: initialData.insuranceInfo?.company || '',
      policyNumber: initialData.insuranceInfo?.policyNumber || '',
      claimNumber: initialData.insuranceInfo?.claimNumber || '',
      adjustorName: initialData.insuranceInfo?.adjustorName || '',
      adjustorPhone: initialData.insuranceInfo?.adjustorPhone || '',
      adjustorEmail: initialData.insuranceInfo?.adjustorEmail || '',
      deductible: initialData.insuranceInfo?.deductible || 0,
      isInsuranceClaim: initialData.insuranceInfo?.isInsuranceClaim || true
    }
  };
  
  // Form validation state for each step
  let stepValidation = {
    'job-info': false,
    'site-info': false,
    'scheduling': true, // Optional fields, so default to true
    'insurance': true,  // Optional fields, so default to true
    'review': true      // Just a review step
  };
  
  // Overall form validity
  $: isFormValid = Object.values(stepValidation).every(isValid => isValid);
  
  // Update step validation
  function updateStepValidation(step: string, isValid: boolean) {
    stepValidation = { ...stepValidation, [step]: isValid };
  }
  
  // Step navigation
  function goToNextStep() {
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
    }
  }
  
  function goToPreviousStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
    }
  }
  
  function goToStep(index: number) {
    if (index >= 0 && index < steps.length) {
      currentStepIndex = index;
    }
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!isFormValid) return;
    
    // Create job data object from form data
    const jobData = {
      customerId: formData.customerId,
      title: formData.title,
      jobType: formData.jobType,
      priority: formData.priority,
      description: formData.description,
      siteAddress: formData.siteAddress,
      accessInstructions: formData.accessInstructions,
      incidentDate: formData.incidentDate ? new Date(formData.incidentDate).toISOString() : undefined,
      scheduledStartDate: formData.scheduledStartDate ? new Date(formData.scheduledStartDate).toISOString() : undefined,
      estimatedCompletionDate: formData.estimatedCompletionDate ? new Date(formData.estimatedCompletionDate).toISOString() : undefined,
      insuranceInfo: formData.hasInsurance ? {
        company: formData.insuranceInfo.company,
        policyNumber: formData.insuranceInfo.policyNumber,
        claimNumber: formData.insuranceInfo.claimNumber,
        adjustorName: formData.insuranceInfo.adjustorName,
        adjustorPhone: formData.insuranceInfo.adjustorPhone,
        adjustorEmail: formData.insuranceInfo.adjustorEmail,
        deductible: formData.insuranceInfo.deductible,
        isInsuranceClaim: true
      } : undefined
    };
    
    // Submit the form
    await onSubmit(jobData as any);
  }
  
  // Load customers on mount
  onMount(() => {
    loadCustomers();
  });
</script>

<div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
  <!-- Step indicators -->
  <StepIndicator 
    {steps} 
    currentStepIndex={currentStepIndex} 
    onStepClick={goToStep} 
    stepValidation={stepValidation}
  />
  
  <!-- Step content -->
  <div class="py-6">
    {#if currentStep.id === 'job-info'}
      <JobInfoStep 
        bind:formData={formData} 
        customersLoading={$customersLoading}
        customers={$customers}
        updateValidation={(isValid) => updateStepValidation('job-info', isValid)}
        disabled={isLoading}
      />
    {:else if currentStep.id === 'site-info'}
      <SiteInfoStep 
        bind:formData={formData} 
        updateValidation={(isValid) => updateStepValidation('site-info', isValid)}
        disabled={isLoading}
      />
    {:else if currentStep.id === 'scheduling'}
      <SchedulingStep 
        bind:formData={formData} 
        updateValidation={(isValid) => updateStepValidation('scheduling', isValid)}
        disabled={isLoading}
      />
    {:else if currentStep.id === 'insurance'}
      <InsuranceStep 
        bind:formData={formData} 
        updateValidation={(isValid) => updateStepValidation('insurance', isValid)}
        disabled={isLoading}
      />
    {:else if currentStep.id === 'review'}
      <ReviewStep 
        {formData} 
        customers={$customers}
        disabled={isLoading}
      />
    {/if}
  </div>
  
  <!-- Navigation buttons -->
  <div class="flex justify-between border-t border-gray-200 pt-4">
    <div>
      {#if currentStepIndex > 0}
        <button 
          type="button" 
          on:click={goToPreviousStep}
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
          disabled={isLoading}
        >
          Back
        </button>
      {/if}
    </div>
    
    <div class="flex space-x-3">
      <a 
        href="/dashboard" 
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue {isLoading ? 'pointer-events-none opacity-50' : ''}"
      >
        Cancel
      </a>
      
      {#if currentStepIndex < steps.length - 1}
        <button 
          type="button" 
          on:click={goToNextStep}
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dryd-blue hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!stepValidation[currentStep.id] || isLoading}
        >
          Next
        </button>
      {:else}
        <button 
          type="button" 
          on:click={handleSubmit}
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid || isLoading}
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
            Create Job
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div> 