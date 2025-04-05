<script lang="ts">
  // Props
  export let steps: { id: string; label: string }[] = [];
  export let currentStepIndex: number = 0;
  export let onStepClick: (index: number) => void;
  export let stepValidation: Record<string, boolean> = {};
  
  // Count completed and valid steps
  $: completedSteps = steps.filter((_, i) => i < currentStepIndex && stepValidation[steps[i].id]).length;
</script>

<div class="mb-8">
  <div class="flex items-center justify-between">
    <div class="w-full bg-gray-200 rounded-full h-2.5 relative">
      <!-- Progress bar -->
      <div 
        class="bg-dryd-blue h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style="width: {Math.max((completedSteps / (steps.length - 1)) * 100, 0)}%"
      ></div>
      
      <!-- Step indicators -->
      {#each steps as step, index}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div 
          class="absolute cursor-pointer transform -translate-y-1/2" 
          style="left: {(index / (steps.length - 1)) * 100}%"
          on:click={() => onStepClick(index)}
        >
          <div 
            class="flex flex-col items-center"
          >
            <div 
              class="w-7 h-7 rounded-full flex items-center justify-center mb-1 border-2 transition-all duration-200 {
                index === currentStepIndex 
                  ? 'bg-dryd-blue text-white border-dryd-blue' 
                  : index < currentStepIndex && stepValidation[steps[index].id]
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-500 border-gray-300'
              }"
            >
              {#if index < currentStepIndex && stepValidation[steps[index].id]}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {index + 1}
              {/if}
            </div>
            <div class="text-xs text-center {index === currentStepIndex ? 'font-semibold text-dryd-blue' : 'text-gray-500'} whitespace-nowrap">
              {step.label}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div> 