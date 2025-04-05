<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  export let job: any;
  
  const dispatch = createEventDispatcher();
  
  let submissionNotes = '';
  let isValid = true;
  
  function handleSubmit() {
    dispatch('submit', {
      submissionNotes,
      timestamp: new Date()
    });
  }
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
  <div class="space-y-2">
    <h3 class="text-lg font-semibold">Job Review Summary</h3>
    
    <div class="rounded-md bg-green-50 p-3">
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <p class="text-sm text-green-700">Moisture readings have been logged</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <p class="text-sm text-green-700">After photos have been uploaded</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-green-600">✓</span>
        <p class="text-sm text-green-700">Equipment removal has been confirmed</p>
      </div>
    </div>
  </div>
  
  <div class="space-y-2">
    <label for="notes" class="text-sm font-medium">Additional Notes</label>
    <textarea 
      id="notes" 
      placeholder="Add any additional information for office staff to review"
      class="w-full border rounded-md p-2"
      bind:value={submissionNotes}
    ></textarea>
  </div>
  
  <Button type="submit" fullWidth={true}>
    Submit for Office Review
  </Button>
</form> 