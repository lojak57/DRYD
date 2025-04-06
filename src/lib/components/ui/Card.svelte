<script lang="ts">
  // Slot content will be placed inside the card
  export let elevation: 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;
  export let className = '';
  export let class_ = '';
  
  // Elevation classes
  const elevationClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  // Combine classes
  $: elevationClass = elevationClasses[elevation];
  $: hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  $: combinedClasses = `${elevationClass} ${hoverClass} rounded-lg bg-white ${className || class_}`;
</script>

<div class={combinedClasses}>
  <slot />
</div>