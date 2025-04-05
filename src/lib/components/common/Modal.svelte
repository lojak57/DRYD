<!-- Modal Component -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
  
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleEscape} />

<!-- Modal Backdrop -->
<div
  class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
  on:click={handleBackdropClick}
  transition:fade={{ duration: 200 }}
>
  <!-- Modal Content -->
  <div
    class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
    transition:fly={{ y: 20, duration: 200 }}
  >
    <slot />
  </div>
</div> 