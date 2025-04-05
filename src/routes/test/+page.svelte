<script lang="ts">
  import TestTechnicianPicker from '$lib/components/test/TestTechnicianPicker.svelte';
  
  let selectedTechnicians: string[] = [];
  
  function handleSelectionChange(event: CustomEvent<string[]>): void {
    console.log('Selection changed:', event.detail);
    selectedTechnicians = event.detail;
  }
</script>

<div class="container mx-auto p-8">
  <h1 class="text-2xl font-bold mb-6">Technician Picker Test Page</h1>
  
  <div class="mb-8">
    <p class="mb-4">
      This is an isolated test page for the technician picker component.
      It should show 3 hardcoded technicians that you can select.
    </p>
  </div>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-3">Technician Selector:</h2>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <TestTechnicianPicker 
        bind:selectedIds={selectedTechnicians}
        on:change={handleSelectionChange}
      />
    </div>
  </div>
  
  <div class="mt-6 p-4 bg-gray-100 rounded-lg">
    <h3 class="font-semibold mb-2">Selection Result:</h3>
    <pre class="bg-gray-800 text-white p-4 rounded overflow-auto">
      {JSON.stringify(selectedTechnicians, null, 2)}
    </pre>
  </div>
</div> 