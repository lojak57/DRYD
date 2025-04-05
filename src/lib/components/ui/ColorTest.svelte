<script lang="ts">
  import Button from './Button.svelte';
</script>

<div class="p-6 space-y-4">
  <h1 class="text-2xl font-bold mb-4">Button Color Test</h1>
  
  <div class="space-y-2">
    <h2 class="text-lg font-semibold">Button Component Tests</h2>
    <div class="flex flex-wrap gap-2">
      <Button color="primary">Primary Button</Button>
      <Button color="secondary">Secondary Button</Button>
      <Button color="success">Success Button</Button>
      <Button color="danger">Danger Button</Button>
      <Button color="warning">Warning Button</Button>
      <Button color="info">Info Button</Button>
      <Button color="default">Default Button</Button>
    </div>
  </div>
  
  <div class="space-y-2 mt-6">
    <h2 class="text-lg font-semibold">Direct Tailwind Class Tests</h2>
    <div class="flex flex-wrap gap-2">
      <button class="bg-blue-600 text-white px-4 py-2 rounded-md">
        Standard Blue (bg-blue-600)
      </button>
      <button class="bg-green-600 text-white px-4 py-2 rounded-md">
        Standard Green (bg-green-600)
      </button>
      <button class="bg-red-600 text-white px-4 py-2 rounded-md">
        Standard Red (bg-red-600)
      </button>
    </div>
  </div>
  
  <div class="space-y-2 mt-6">
    <h2 class="text-lg font-semibold">Color Palette</h2>
    <div class="flex flex-wrap gap-2">
      <div class="w-32 h-10 bg-blue-600 flex items-center justify-center text-white text-sm">
        blue-600
      </div>
      <div class="w-32 h-10 bg-blue-700 flex items-center justify-center text-white text-sm">
        blue-700
      </div>
      <div class="w-32 h-10 bg-cyan-500 flex items-center justify-center text-white text-sm">
        cyan-500
      </div>
    </div>
  </div>
</div> 