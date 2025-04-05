<!-- Root page redirect -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    onMount(() => {
        if (browser) {
            goto('/dashboard', { replaceState: true });
        }
    });
</script>

<div class="flex items-center justify-center h-screen">
  <p>Loading...</p>
</div>
