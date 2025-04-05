<script lang="ts">
  import { notificationStore, removeNotification } from '$lib/stores/notificationStore';
  import Toast from './Toast.svelte';
</script>

<div class="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
  {#each $notificationStore as notification (notification.id)}
    <div class="pointer-events-auto">
      <Toast {notification} onClose={() => removeNotification(notification.id)} />
    </div>
  {/each}
</div> 