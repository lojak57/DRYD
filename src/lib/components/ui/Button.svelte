<script lang="ts">
  export let type: "button" | "submit" | "reset" = "button";
  export let color = "default";
  export let size = "md";
  export let disabled = false;
  export let fullWidth = false;
  export let loading = false;
  export let icon = "";
  export let iconPosition = "left";
  
  // Simple colors using standard Tailwind classes (no custom color references)
  const colors = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white border border-transparent",
    secondary: "bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-800 border border-transparent",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border border-transparent",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border border-transparent",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 text-white border border-transparent",
    info: "bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400 text-white border border-transparent",
    default: "bg-gray-100 hover:bg-gray-200 focus:ring-gray-300 text-gray-700 border border-gray-300"
  };
  
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  $: colorClasses = colors[color as keyof typeof colors] || colors.default;
  $: sizeClasses = sizes[size as keyof typeof sizes] || sizes.md;
  $: iconSizeClasses = iconSizes[size as keyof typeof iconSizes] || iconSizes.md;
  $: widthClass = fullWidth ? "w-full" : "";

  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
  }
</script>

<button
  {type}
  class="inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed {colorClasses} {sizeClasses} {widthClass}"
  {disabled}
  on:click={handleClick}
  on:click
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 {iconSizeClasses}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else if icon && iconPosition === "left"}
    <span class="mr-2">{@html icon}</span>
  {/if}
  
  <slot />
  
  {#if icon && iconPosition === "right" && !loading}
    <span class="ml-2">{@html icon}</span>
  {/if}
</button>