<script lang="ts">
  import { JobStatus } from '$lib/types/Job';
  
  export let status: JobStatus;
  export let compact: boolean = false;
  
  // Define the workflow stages in order
  const workflowStages = [
    { status: JobStatus.NEW, label: 'New', icon: 'M12 4v16m8-8H4' },
    { status: JobStatus.SCHEDULED, label: 'Scheduled', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { status: JobStatus.IN_PROGRESS, label: 'In Progress', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { status: JobStatus.PENDING_COMPLETION, label: 'Pending Completion', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { status: JobStatus.COMPLETED, label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { status: JobStatus.INVOICE_APPROVAL, label: 'Invoice Approval', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { status: JobStatus.INVOICED, label: 'Invoiced', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { status: JobStatus.PAID, label: 'Paid', icon: 'M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];
  
  // Special cases for on hold and cancelled
  const specialCases = [
    { status: JobStatus.ON_HOLD, label: 'On Hold', icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { status: JobStatus.CANCELLED, label: 'Cancelled', icon: 'M6 18L18 6M6 6l12 12' }
  ];
  
  // Find current stage index
  $: currentStageIndex = workflowStages.findIndex(stage => stage.status === status);
  $: isSpecialCase = specialCases.some(special => special.status === status);
  
  // Get status information for display
  $: statusInfo = isSpecialCase 
    ? specialCases.find(special => special.status === status)
    : workflowStages.find(stage => stage.status === status);
  
  // Get colors for current status
  function getStatusColors(status: JobStatus): { bg: string, text: string, border: string, icon: string } {
    switch (status) {
      case JobStatus.NEW:
        return { bg: 'bg-dryd-blue-light/20', text: 'text-dryd-blue-dark', border: 'border-dryd-blue', icon: 'text-dryd-blue' };
      case JobStatus.SCHEDULED:
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300', icon: 'text-indigo-600' };
      case JobStatus.IN_PROGRESS:
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: 'text-green-600' };
      case JobStatus.ON_HOLD:
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: 'text-amber-600' };
      case JobStatus.PENDING_COMPLETION:
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: 'text-blue-600' };
      case JobStatus.COMPLETED:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: 'text-gray-600' };
      case JobStatus.INVOICE_APPROVAL:
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', icon: 'text-purple-600' };
      case JobStatus.INVOICED:
        return { bg: 'bg-dryd-burgundy/10', text: 'text-dryd-burgundy', border: 'border-dryd-burgundy/20', icon: 'text-dryd-burgundy' };
      case JobStatus.PAID:
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: 'text-emerald-600' };
      case JobStatus.CANCELLED:
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: 'text-red-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: 'text-gray-600' };
    }
  }
  
  $: colors = getStatusColors(status);
</script>

{#if compact}
  <!-- Compact version just shows the current status with an icon -->
  <div class="inline-flex items-center px-3 py-1.5 rounded-md {colors.bg} {colors.text} {colors.border} border shadow-sm">
    <svg class="w-4 h-4 mr-1.5 {colors.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={statusInfo?.icon || ''} />
    </svg>
    <span class="font-semibold text-sm">{statusInfo?.label || status}</span>
  </div>
{:else}
  <!-- Full workflow indicator -->
  <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700">Job Status</h3>
      <!-- Current status badge -->
      <div class="inline-flex items-center px-3 py-1 rounded-md {colors.bg} {colors.text} border {colors.border}">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={statusInfo?.icon || ''} />
        </svg>
        <span class="font-semibold text-sm">{statusInfo?.label || status}</span>
      </div>
    </div>
    
    {#if isSpecialCase}
      <!-- Special display for On Hold and Cancelled -->
      <div class="flex items-center mt-2">
        <div class="w-full relative">
          <div class="overflow-hidden h-2 flex rounded bg-gray-200">
            <div class="w-full h-full rounded {status === JobStatus.ON_HOLD ? 'bg-amber-400' : 'bg-red-500'} absolute top-0 left-0 
              {status === JobStatus.ON_HOLD ? 'animate-pulse' : ''}" style="animation-duration: 2s;"></div>
          </div>
          <div class="flex justify-between mt-1">
            <div class="text-center">
              <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mx-auto 
                  {status === JobStatus.ON_HOLD ? 'ring-2 ring-amber-400' : 'ring-2 ring-red-500'}">
                <svg class="w-4 h-4 {status === JobStatus.ON_HOLD ? 'text-amber-700' : 'text-red-700'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={statusInfo?.icon || ''} />
                </svg>
              </div>
              <span class="text-xs mt-1 inline-block {status === JobStatus.ON_HOLD ? 'text-amber-700' : 'text-red-700'} font-medium">
                {statusInfo?.label || status}
              </span>
            </div>
            
            <div class="text-center">
              <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mx-auto opacity-60">
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-xs mt-1 inline-block text-gray-500">Resume</span>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Normal workflow visualization -->
      <div class="flex items-center mt-2">
        <div class="w-full">
          <!-- Progress bar -->
          <div class="overflow-hidden h-2 flex rounded bg-gray-200">
            <div class="h-full rounded bg-gradient-to-r from-dryd-blue to-dryd-burgundy" 
                style="width: {Math.min(100, (currentStageIndex / (workflowStages.length - 1)) * 100)}%"></div>
          </div>
          
          <!-- Stage indicators -->
          <div class="flex justify-between mt-1">
            {#each workflowStages as stage, i}
              {@const isCurrentStage = stage.status === status}
              {@const isPastStage = currentStageIndex > i}
              <div class="text-center" style={i > 0 && i < workflowStages.length - 1 ? 'margin-left: -12px; margin-right: -12px;' : ''}>
                <div class="w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-all
                    {isCurrentStage ? 'bg-gradient-to-r from-dryd-blue to-dryd-burgundy text-white' : 
                      isPastStage ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-400'}
                    {isCurrentStage ? 'ring-2 ring-dryd-blue/30' : ''}">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={stage.icon} />
                  </svg>
                </div>
                <span class="text-xs mt-0.5 inline-block whitespace-nowrap
                    {isCurrentStage ? 'text-dryd-blue-dark font-semibold' : 
                      isPastStage ? 'text-gray-600' : 'text-gray-400'}">
                  {i === 0 || i === workflowStages.length - 1 || isCurrentStage ? stage.label : ''}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if} 