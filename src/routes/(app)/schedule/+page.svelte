<script lang="ts">
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import GanttChart from '$lib/components/schedule/GanttChart.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
</script>

<PageHeader title="Schedule" subtitle="View and manage technician schedules" />

{#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
  <div class="p-4">
    <GanttChart />
  </div>
{:else}
  <div class="container mx-auto px-4 py-6">
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
      <p class="flex items-center font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Access Denied
      </p>
      <p class="mt-1">Only Admin and Office staff can access the scheduling page.</p>
    </div>
  </div>
{/if}
