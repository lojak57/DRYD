<script lang="ts">
  import { JobStatus } from '$lib/types/Job';
  
  export let status: JobStatus;
  
  // Determine badge color based on job status
  $: badgeConfig = getBadgeConfig(status);
  
  function getBadgeConfig(status: JobStatus): { classes: string, icon: string } {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm';
    
    switch (status) {
      case JobStatus.NEW:
        return {
          classes: `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`,
          icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        };
      case JobStatus.SCHEDULED:
        return {
          classes: `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`,
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        };
      case JobStatus.IN_PROGRESS:
        return {
          classes: `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`,
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case JobStatus.ON_HOLD:
        return {
          classes: `${baseClasses} bg-red-100 text-red-800 border border-red-200`,
          icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case JobStatus.COMPLETED:
        return {
          classes: `${baseClasses} bg-green-100 text-green-800 border border-green-200`,
          icon: 'M5 13l4 4L19 7'
        };
      case JobStatus.INVOICED:
        return {
          classes: `${baseClasses} bg-indigo-100 text-indigo-800 border border-indigo-200`,
          icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
        };
      case JobStatus.PAID:
        return {
          classes: `${baseClasses} bg-teal-100 text-teal-800 border border-teal-200`,
          icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case JobStatus.CANCELLED:
        return {
          classes: `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`,
          icon: 'M6 18L18 6M6 6l12 12'
        };
      default:
        return {
          classes: `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`,
          icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  }
</script>

<span class={badgeConfig.classes}>
  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={badgeConfig.icon} />
  </svg>
  {status}
</span> 