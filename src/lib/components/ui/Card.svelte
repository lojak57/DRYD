<script lang="ts">
  // Slot content will be placed inside the card
  export let elevation: 'sm' | 'md' | 'lg' = 'md';
  export let hover: boolean = false;
  export let className: string = '';
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden 
  {elevation === 'sm' ? 'shadow-sm' : elevation === 'md' ? 'shadow' : 'shadow-lg'}
  {hover ? 'transition-all duration-150 hover:shadow-lg' : ''}
  {className}"
>
  <slot />
</div>