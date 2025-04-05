<script lang="ts">
  export let color = 'gray';
  export let size = 'md';
  export let rounded = true;
  export let className = '';
  
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    amber: 'bg-amber-100 text-amber-800'
  };
  
  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };
  
  $: colorClasses = colors[color as keyof typeof colors] || colors.gray;
  $: sizeClasses = sizes[size as keyof typeof sizes] || sizes.md;
  $: roundedClass = rounded ? 'rounded-full' : 'rounded';
</script>

<span class="{colorClasses} {sizeClasses} {roundedClass} font-medium inline-flex items-center justify-center {className}">
  <slot />
</span>