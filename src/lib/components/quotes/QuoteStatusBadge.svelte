<script lang="ts">
  import { QuoteStatus } from '$lib/types/Quote';
  import Badge from '$lib/components/ui/Badge.svelte';
  
  export let status: QuoteStatus;
  export let size = 'md';
  
  // Determine status badge color
  function getStatusColor(status: QuoteStatus): string {
    switch (status) {
      case QuoteStatus.DRAFT:
        return 'amber';
      case QuoteStatus.SENT:
        return 'blue';
      case QuoteStatus.ACCEPTED:
        return 'green';
      case QuoteStatus.DECLINED:
        return 'red';
      case QuoteStatus.CONVERTED_TO_JOB:
        return 'indigo';
      default:
        return 'gray';
    }
  }
  
  // Format status for display
  function formatStatus(status: QuoteStatus): string {
    return status.replace(/_/g, ' ');
  }
</script>

<Badge color={getStatusColor(status)} {size}>
  {formatStatus(status)}
</Badge> 