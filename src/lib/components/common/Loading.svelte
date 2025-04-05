<!-- Loading component -->
<script lang="ts">
  export let message: string = 'Loading...';
</script>

<div class="flex flex-col items-center justify-center space-y-4">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-dryd-blue"></div>
  <p class="text-gray-600 text-sm">{message}</p>
</div> 