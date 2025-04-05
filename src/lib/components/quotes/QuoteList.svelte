<script lang="ts">
  import type { Quote } from '$lib/types/Quote';
  import { QuoteStatus } from '$lib/types/Quote';
  import QuoteCard from './QuoteCard.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';

  export let quotes: Quote[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
  export let emptyStateMessage: string = 'No quotes found';
  export let filterStatus: QuoteStatus | 'ALL' = 'ALL';

  // Filter quotes by status if filterStatus is not 'ALL'
  $: filteredQuotes = filterStatus === 'ALL' 
    ? quotes 
    : quotes.filter(quote => quote.status === filterStatus);

  // Sort quotes by date created, newest first
  $: sortedQuotes = [...filteredQuotes].sort((a, b) => {
    return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
  });
</script>

{#if error}
  <ErrorAlert message={error} />
{:else if loading}
  <div class="flex justify-center py-8">
    <LoadingSpinner size="lg" />
  </div>
{:else if sortedQuotes.length === 0}
  <EmptyState 
    message={emptyStateMessage} 
    icon="document-text"
  />
{:else}
  <div class="grid grid-cols-1 gap-4">
    {#each sortedQuotes as quote (quote.id)}
      <QuoteCard {quote} />
    {/each}
  </div>
{/if}