<script lang="ts">
  import { onMount } from 'svelte';
  import { quoteStore } from '$lib/stores/quoteStore';
  import QuoteList from '$lib/components/quotes/QuoteList.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { QuoteStatus } from '$lib/types/Quote';
  import { goto } from '$app/navigation';
  
  let searchQuery = '';
  let statusFilter: QuoteStatus | 'ALL' = 'ALL';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  $: filteredQuotes = filterQuotes($quoteStore.quotes, searchQuery);
  
  function filterQuotes(quotes, query) {
    if (!query.trim()) return quotes;
    
    const searchTerms = query.toLowerCase().split(' ');
    return quotes.filter(quote => {
      const searchableText = [
        quote.quoteNumber,
        quote.scopeOfWork,
        (quote.siteAddress?.street ?? '') + ' ' + 
        (quote.siteAddress?.city ?? '') + ' ' + 
        (quote.siteAddress?.state ?? '')
      ].join(' ').toLowerCase();
      
      // Check if all search terms are found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
    }, 300);
  }
  
  function createNewQuote() {
    goto('/quotes/new');
  }
  
  onMount(() => {
    quoteStore.fetchQuotes();
  });
</script>

<PageHeader title="Quotes">
  <svelte:fragment slot="actions">
    <Button color="primary" on:click={createNewQuote}>
      New Quote
    </Button>
  </svelte:fragment>
</PageHeader>

<div class="container mx-auto p-4">
  <div class="mb-6 flex flex-col sm:flex-row gap-4">
    <!-- Search -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input 
        type="search" 
        class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
        placeholder="Search quotes..."
        on:input={handleSearch}
      />
    </div>
    
    <!-- Status Filter -->
    <div class="w-full sm:w-auto">
      <select 
        bind:value={statusFilter}
        class="block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="ALL">All Statuses</option>
        <option value={QuoteStatus.DRAFT}>Draft</option>
        <option value={QuoteStatus.SENT}>Sent</option>
        <option value={QuoteStatus.ACCEPTED}>Accepted</option>
        <option value={QuoteStatus.DECLINED}>Declined</option>
        <option value={QuoteStatus.CONVERTED_TO_JOB}>Converted to Job</option>
      </select>
    </div>
  </div>
  
  <QuoteList 
    quotes={filteredQuotes} 
    loading={$quoteStore.loading} 
    error={$quoteStore.error}
    filterStatus={statusFilter}
    emptyStateMessage={searchQuery ? "No quotes match your search" : "No quotes found"}
  />
</div>