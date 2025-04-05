<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import type { Notification } from '$lib/stores/notificationStore';
  
  export let notification: Notification;
  export let onClose: () => void;
  
  function getTypeStyles(type: Notification['type']) {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          icon: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`
        };
      case 'error':
        return {
          backgroundColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          icon: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`
        };
      case 'warning':
        return {
          backgroundColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          icon: `<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`
        };
      case 'info':
      default:
        return {
          backgroundColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          icon: `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`
        };
    }
  }
  
  const styles = getTypeStyles(notification.type);
</script>

<div 
  class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden border-l-4 {styles.borderColor} {styles.backgroundColor}"
  transition:fly={{ y: 20, duration: 300 }}
  role="alert"
>
  <div class="p-4">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 {styles.iconColor}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          {@html styles.icon}
        </svg>
      </div>
      <div class="ml-3 w-0 flex-1">
        <p class="text-sm font-medium {styles.textColor}">
          {notification.message}
        </p>
      </div>
      <div class="ml-4 flex-shrink-0 flex">
        <button
          class="inline-flex rounded-md {styles.backgroundColor} {styles.textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          on:click={onClose}
        >
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div> 