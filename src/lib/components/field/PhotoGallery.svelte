<script lang="ts">
  import type { LogEntry } from '$lib/types/LogEntry';
  import { LogEntryType } from '$lib/types/LogEntry';
  
  // Placeholder SVG Camera Icon
  const cameraIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500 mb-1"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>`;

  export let logEntries: LogEntry[] = [];
  let selectedPhoto: { url: string, caption?: string } | null = null;

  // Helper function to extract photo data safely
  function getPhotoContent(content: any) {
    if (typeof content === 'object' && content !== null && 'url' in content) {
      return {
        url: content.url as string,
        caption: (content.caption as string) || '',
        filename: (content.filename as string) || 'photo.jpg',
        size: (content.size as number) || 0,
        tags: (content.tags as string[]) || []
      };
    }
    return null;
  }

  // Filter only photo entries
  $: photoEntries = logEntries.filter(entry => 
    entry.type === LogEntryType.PHOTO && typeof entry.content === 'object' && entry.content !== null
  );
  
  // Format timestamp to a readable format
  function formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Show photo in modal
  function showPhotoDetail(entry: LogEntry) {
    const photoContent = getPhotoContent(entry.content);
    if (photoContent) {
      selectedPhoto = {
        url: photoContent.url,
        caption: photoContent.caption
      };
    }
  }
  
  // Close modal
  function closeModal() {
    selectedPhoto = null;
  }
</script>

{#if photoEntries.length > 0}
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
    {#each photoEntries as entry (entry.id)}
      {@const photoContent = getPhotoContent(entry.content)}
      {#if photoContent}
        <div 
          class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 ease-in-out cursor-pointer"
          on:click={() => showPhotoDetail(entry)}
          on:keydown={(e) => e.key === 'Enter' && showPhotoDetail(entry)}
          role="button"
          tabindex="0"
        >
          <div class="h-full flex flex-col">
            <div class="flex-1 relative overflow-hidden bg-gray-200">
              <img 
                src={photoContent.url} 
                alt={photoContent.caption || "Job photo"} 
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                on:error={(e) => { 
                  const img = e.target as HTMLImageElement;
                  img.src = 'https://via.placeholder.com/300x200?text=Photo+Preview';
                }} 
              />
            </div>
            <div class="p-2 bg-white">
              <p class="text-xs font-medium text-gray-500 truncate">
                {photoContent.filename || 'photo.jpg'}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {formatTimestamp(entry.timestamp)}
              </p>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="flex flex-col items-center justify-center py-8 text-center">
    <div class="text-gray-400 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <p class="text-gray-600 font-medium">No photos found in the log</p>
    <p class="text-gray-500 text-sm mt-1">Use the "Add Photo" button to upload images</p>
  </div>
{/if}

<!-- Photo Modal -->
{#if selectedPhoto}
  <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" on:click={closeModal}>
    <div class="max-w-5xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-xl" on:click|stopPropagation>
      <div class="relative">
        <img 
          src={selectedPhoto.url} 
          alt={selectedPhoto.caption || "Job photo"}
          class="w-full max-h-[80vh] object-contain"
          on:error={(e) => { 
            const img = e.target as HTMLImageElement;
            img.src = 'https://via.placeholder.com/800x600?text=Photo+Preview';
          }}
        />
        <button 
          class="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          on:click={closeModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {#if selectedPhoto.caption}
        <div class="p-4 bg-white border-t">
          <p class="text-gray-800">{selectedPhoto.caption}</p>
        </div>
      {/if}
    </div>
  </div>
{/if} 