<script lang="ts">
  import type { Customer } from '$lib/types/Customer';
  
  // Props
  export let formData: any;
  export let customers: Customer[] = [];
  export let disabled: boolean = false;
  
  // Get job type label
  $: jobTypeLabel = getJobTypeLabel(formData.jobType);
  
  // Get priority label
  $: priorityLabel = getPriorityLabel(formData.priority);
  
  // Get customer name
  $: customerName = getCustomerName(formData.customerId);
  
  // Helper functions
  function getJobTypeLabel(jobType: string): string {
    const jobTypes = {
      'WATER': 'Water Damage',
      'FIRE': 'Fire Damage',
      'MOLD': 'Mold Remediation',
      'SMOKE': 'Smoke Damage',
      'STORM': 'Storm Damage',
      'OTHER': 'Other'
    };
    
    return jobTypes[jobType as keyof typeof jobTypes] || jobType;
  }
  
  function getPriorityLabel(priority: number): string {
    const priorities = {
      1: 'Low',
      2: '2',
      3: 'Medium',
      4: '4',
      5: 'High'
    };
    
    return priorities[priority as keyof typeof priorities] || priority.toString();
  }
  
  function getCustomerName(customerId: string): string {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  }
</script>

<div>
  <h2 class="text-xl font-semibold text-gray-800 mb-4">Review Job Information</h2>
  
  <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
    <div class="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-blue-700">
        Please review the job information below before creating the job. You can go back to any previous step to make changes.
      </p>
    </div>
  </div>
  
  <div class="space-y-8">
    <!-- Job Information -->
    <div class="bg-gray-50 rounded-md p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Job Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
        <div>
          <p class="text-sm font-medium text-gray-500">Customer</p>
          <p class="text-gray-800">{customerName}</p>
        </div>
        
        <div>
          <p class="text-sm font-medium text-gray-500">Job Title</p>
          <p class="text-gray-800">{formData.title}</p>
        </div>
        
        <div>
          <p class="text-sm font-medium text-gray-500">Job Type</p>
          <p class="text-gray-800">{jobTypeLabel}</p>
        </div>
        
        <div>
          <p class="text-sm font-medium text-gray-500">Priority</p>
          <p class="text-gray-800">{priorityLabel}</p>
        </div>
        
        {#if formData.description}
          <div class="col-span-2 mt-2">
            <p class="text-sm font-medium text-gray-500">Description</p>
            <p class="text-gray-800 whitespace-pre-line">{formData.description}</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Site Address -->
    <div class="bg-gray-50 rounded-md p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Site Address</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
        <div class="col-span-2">
          <p class="text-sm font-medium text-gray-500">Street</p>
          <p class="text-gray-800">{formData.siteAddress.street}</p>
        </div>
        
        <div>
          <p class="text-sm font-medium text-gray-500">City</p>
          <p class="text-gray-800">{formData.siteAddress.city}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">State</p>
            <p class="text-gray-800">{formData.siteAddress.state}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">ZIP</p>
            <p class="text-gray-800">{formData.siteAddress.zip}</p>
          </div>
        </div>
        
        {#if formData.accessInstructions}
          <div class="col-span-2 mt-2">
            <p class="text-sm font-medium text-gray-500">Access Instructions</p>
            <p class="text-gray-800">{formData.accessInstructions}</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Scheduling -->
    <div class="bg-gray-50 rounded-md p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Scheduling</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-y-4">
        {#if formData.incidentDate}
          <div>
            <p class="text-sm font-medium text-gray-500">Incident Date</p>
            <p class="text-gray-800">{formatDate(formData.incidentDate)}</p>
          </div>
        {/if}
        
        <div>
          <p class="text-sm font-medium text-gray-500">Scheduled Start Date</p>
          <p class="text-gray-800">{formatDate(formData.scheduledStartDate)}</p>
        </div>
        
        <div>
          <p class="text-sm font-medium text-gray-500">Est. Completion Date</p>
          <p class="text-gray-800">{formatDate(formData.estimatedCompletionDate)}</p>
        </div>
      </div>
    </div>
    
    <!-- Insurance Information -->
    <div class="bg-gray-50 rounded-md p-5 border border-gray-200">
      <h3 class="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Insurance Information</h3>
      
      {#if formData.hasInsurance}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Insurance Company</p>
            <p class="text-gray-800">{formData.insuranceInfo.company}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">Policy Number</p>
            <p class="text-gray-800">{formData.insuranceInfo.policyNumber}</p>
          </div>
          
          <div>
            <p class="text-sm font-medium text-gray-500">Claim Number</p>
            <p class="text-gray-800">{formData.insuranceInfo.claimNumber}</p>
          </div>
          
          {#if formData.insuranceInfo.deductible}
            <div>
              <p class="text-sm font-medium text-gray-500">Deductible</p>
              <p class="text-gray-800">${formData.insuranceInfo.deductible}</p>
            </div>
          {/if}
          
          {#if formData.insuranceInfo.adjustorName}
            <div class="col-span-2 mt-2 pt-2 border-t border-gray-100">
              <h4 class="text-md font-medium text-gray-700 mb-2">Adjustor Information</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <p class="text-sm font-medium text-gray-500">Name</p>
                  <p class="text-gray-800">{formData.insuranceInfo.adjustorName}</p>
                </div>
                
                {#if formData.insuranceInfo.adjustorPhone}
                  <div>
                    <p class="text-sm font-medium text-gray-500">Phone</p>
                    <p class="text-gray-800">{formData.insuranceInfo.adjustorPhone}</p>
                  </div>
                {/if}
                
                {#if formData.insuranceInfo.adjustorEmail}
                  <div class="col-span-2">
                    <p class="text-sm font-medium text-gray-500">Email</p>
                    <p class="text-gray-800">{formData.insuranceInfo.adjustorEmail}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <p class="text-gray-500">No insurance information added.</p>
      {/if}
    </div>
  </div>
</div> 