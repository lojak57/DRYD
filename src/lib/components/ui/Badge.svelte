<script lang="ts">
  export let color = 'gray';
  export let size = 'md';
  export let rounded = 'full';
  export let className = '';
  export let class_ = '';
  
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
  };
  
  const sizes = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-xs py-1 px-2.5',
    lg: 'text-sm py-1 px-3'
  };
  
  const roundings = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  $: colorClass = colors[color as keyof typeof colors] || colors.gray;
  $: sizeClass = sizes[size as keyof typeof sizes] || sizes.md;
  $: roundedClass = roundings[rounded as keyof typeof roundings] || roundings.full;
  $: classList = `inline-flex items-center font-medium ${colorClass} ${sizeClass} ${roundedClass} ${className || class_}`;
</script>

<span class={classList}>
  <slot />
</span>