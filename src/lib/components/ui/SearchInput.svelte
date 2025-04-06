<script lang="ts">
  export let value = '';
  export let placeholder = 'Search...';
  export let disabled = false;
  export let debounceTime = 300;
  
  let inputElement: HTMLInputElement;
  let timer: ReturnType<typeof setTimeout>;
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    
    // Clear any existing timer
    if (timer) clearTimeout(timer);
    
    // Set a new timer for debouncing
    timer = setTimeout(() => {
      value = target.value;
    }, debounceTime);
  }
  
  function clear() {
    value = '';
    inputElement.focus();
  }
</script>

<div class="relative">
  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
    <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
  
  <input
    bind:this={inputElement}
    type="search"
    {placeholder}
    {disabled}
    value={value}
    on:input={handleInput}
    class="block w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue text-sm"
  />
  
  {#if value}
    <button 
      type="button" 
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      on:click={clear}
      disabled={disabled}
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div> 