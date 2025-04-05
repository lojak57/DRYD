<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher();
  
  let selectedFile: File | null = null;
  let photoCaption = '';
  let photoSubmitting = false;
  let photoError = '';
  let photoPreviewUrl: string | null = null;
  
  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFile = input.files[0];
      photoPreviewUrl = URL.createObjectURL(selectedFile);
    } else {
      selectedFile = null;
      photoPreviewUrl = null;
    }
  }
  
  function handleSubmit() {
    if (!selectedFile) {
      photoError = 'Please select a photo to upload';
      return;
    }
    
    photoSubmitting = true;
    photoError = '';
    
    // Create a simulated photo URL (would be a real upload in production)
    // Using a placeholder image URL that actually exists in the system
    const simulatedPhotoUrl = `https://placehold.co/600x400?text=Job+Photo+${Date.now()}`;
    
    // Simulate a network delay for better user feedback
    setTimeout(() => {
      // Dispatch the photo data
      dispatch('submit', {
        url: simulatedPhotoUrl,
        caption: photoCaption.trim() || `Photo uploaded on ${new Date().toLocaleString()}`,
        filename: selectedFile?.name,
        size: selectedFile?.size,
        type: selectedFile?.type,
        tags: ['after'],
        timestamp: new Date()
      });
      
      // No need to reset photoSubmitting since the component will be unmounted
    }, 800); // Short delay to show the loading state
  }
  
  // Clean up preview URLs on component destruction
  import { onDestroy } from 'svelte';
  
  onDestroy(() => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
  });
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label for="photo-upload" class="block text-sm font-medium text-gray-700 mb-1">Select photo</label>
    <input
      id="photo-upload"
      type="file"
      accept="image/*"
      on:change={handleFileChange}
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      disabled={photoSubmitting}
    />
    
    {#if photoPreviewUrl}
      <div class="mt-2 border rounded overflow-hidden">
        <img src={photoPreviewUrl} alt="Preview" class="w-full h-auto max-h-48 object-contain" />
      </div>
    {/if}
  </div>
  
  <div>
    <label for="photo-caption" class="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
    <input
      id="photo-caption"
      type="text"
      bind:value={photoCaption}
      placeholder="Enter a caption for this photo..."
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      disabled={photoSubmitting}
    />
  </div>
  
  {#if photoError}
    <p class="mt-1 text-sm text-red-600">{photoError}</p>
  {/if}
  
  <div class="mt-6 flex justify-end space-x-3">
    <button 
      type="button" 
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      on:click={() => dispatch('cancel')}
    >
      Cancel
    </button>
    
    <button
      type="submit"
      disabled={photoSubmitting || !selectedFile}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {#if photoSubmitting}
        <span class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </span>
      {:else}
        Complete Task
      {/if}
    </button>
  </div>
</form> 