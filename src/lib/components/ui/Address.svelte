<script lang="ts">
  import type { Address } from '$lib/types/Customer';
  
  export let address: Address;
</script>

<div class="space-y-1">
  <p class="text-gray-700">{address.street}</p>
  <p class="text-gray-700">{address.city}, {address.state} {address.zip}</p>
</div> 