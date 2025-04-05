<script lang="ts">
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry } from '$lib/types/LogEntry';
  import { addLogEntry } from '$lib/services/logEntries';
  import { createEventDispatcher } from 'svelte';
  
  export let jobId: string;
  export let userId: string;
  
  let fileInput: HTMLInputElement;
  let selectedFiles: FileList | null = null;
  let caption = '';
  let isSubmitting = false;
  let errorMessage = '';
  let previewUrl: string | null = null;
  
  const dispatch = createEventDispatcher<{
    submit: LogEntry;
  }>();
  
  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFiles = input.files;
      
      // Create a preview for the selected image
      const file = input.files[0];
      previewUrl = URL.createObjectURL(file);
    } else {
      selectedFiles = null;
      previewUrl = null;
    }
  }
  
  async function handleSubmit() {
    if (!selectedFiles || selectedFiles.length === 0) {
      errorMessage = "Please select a photo to upload";
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      const file = selectedFiles[0];
      
      // In a real app, we would upload the file to storage here
      // For the prototype, we'll just log the metadata
      
      // Create a simulated photo URL (would be a real URL in production)
      const simulatedPhotoUrl = `/assets/photos/job-${jobId}-${Date.now()}.jpg`;
      
      // Prepare the photo content object
      const photoContent = {
        url: simulatedPhotoUrl,
        caption: caption.trim() || `Photo uploaded on ${new Date().toLocaleString()}`,
        filename: file.name,
        size: file.size,
        type: file.type,
        tags: []
      };
      
      // Call the service function to add the log entry
      const newEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: LogEntryType.PHOTO,
        content: photoContent
      });
      
      // Dispatch the new entry to the parent component
      dispatch('submit', newEntry);
      
      // Reset form
      selectedFiles = null;
      caption = '';
      previewUrl = null;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      console.error('Error adding photo:', err);
      errorMessage = 'Failed to add photo. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Cleanup preview URL when component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  });
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Add Photo</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="photo-upload" class="block text-sm font-medium text-gray-700 mb-1">Select photo</label>
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        bind:this={fileInput}
        on:change={handleFileChange}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        disabled={isSubmitting}
      />
      
      {#if previewUrl}
        <div class="mt-2 border rounded overflow-hidden">
          <img src={previewUrl} alt="Selected photo preview" class="w-full h-auto max-h-48 object-contain" />
        </div>
      {/if}
    </div>
    
    <div>
      <label for="photo-caption" class="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
      <input
        id="photo-caption"
        type="text"
        bind:value={caption}
        placeholder="Enter a caption for this photo..."
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        disabled={isSubmitting}
      />
    </div>
    
    {#if errorMessage}
      <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
    {/if}
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting || !selectedFiles}
        class="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        {:else}
          Add Photo
        {/if}
      </button>
    </div>
  </form>
</div> 