<script lang="ts">
  import { page } from '$app/stores';
  
  export let href: string;
  export let label: string;
  
  // Check if the item is active based on the current URL
  $: isActive = $page.url.pathname === href;
</script>

<a 
  {href}
  class="block px-3 py-2 text-sm rounded-md transition-colors duration-150
  {isActive 
    ? 'bg-indigo-50 text-indigo-600 font-medium' 
    : 'text-gray-600 hover:bg-gray-50'}"
>
  {label}
</a> 