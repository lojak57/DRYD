<script lang="ts">
  export let showText = true; // This prop will now default to true but we'll override it in Nav
  export let size = "md"; // sm, md, lg, xl, xxl, xxxl
  export let linkToDashboard = true; // Add option to make it a link
  export let logoSrc = "/dryd-logo-new.PNG"; // Default to primary logo, but allow changing
  
  // Calculate image sizes based on the size prop using Tailwind classes
  // Increased sizes scale: sm=h-12, md=h-16, lg=h-20, xl=h-24, xxl=h-32, xxxl=h-40
  $: logoClass = 
    size === "sm" ? "h-12 w-auto" : 
    size === "lg" ? "h-20 w-auto" : 
    size === "xl" ? "h-24 w-auto" :
    size === "xxl" ? "h-32 w-auto" :
    size === "xxxl" ? "h-40 w-auto" :
    "h-16 w-auto"; // Default to md size
      
  // Text size scale with the logo size
  $: textClass = 
    size === "sm" ? "text-lg" : 
    size === "lg" ? "text-3xl" :
    size === "xl" ? "text-4xl" :
    size === "xxl" ? "text-5xl" :
    size === "xxxl" ? "text-6xl" :
    "text-2xl";
    
  // Subtitle size scales with logo size
  $: subtitleClass = 
    size === "sm" ? "text-xs" : 
    size === "lg" ? "text-sm" :
    size === "xl" ? "text-base" :
    size === "xxl" ? "text-lg" :
    "text-xs";
</script>

{#if linkToDashboard}
  <a href="/dashboard" class="flex items-center hover:opacity-90 transition-opacity duration-150">
    <!-- Logo image -->
    <img src={logoSrc} alt="DRYD Restoration Logo" class="{logoClass}" />
    
    {#if showText}
      <div class="ml-3 flex flex-col">
        <span class={`font-montserrat font-extrabold tracking-wide ${textClass}`}>DRYD</span>
      </div>
    {/if}
  </a>
{:else}
  <div class="flex items-center">
    <!-- Logo image -->
    <img src={logoSrc} alt="DRYD Restoration Logo" class="{logoClass}" />
    
    {#if showText}
      <div class="ml-3 flex flex-col">
        <span class={`font-montserrat font-extrabold tracking-wide ${textClass}`}>DRYD</span>
      </div>
    {/if}
  </div>
{/if}