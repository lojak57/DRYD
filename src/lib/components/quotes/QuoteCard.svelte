<script lang="ts">
  import { format } from 'date-fns';
  import { page } from '$app/stores';
  import type { Quote } from '$lib/types/Quote';
  import QuoteStatusBadge from './QuoteStatusBadge.svelte';

  export let quote: Quote;

  // Format dates for display
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Format currency for display
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<a href="{$page.url.pathname}/{quote.id}" class="block">
  <div class="bg-white rounded-lg shadow-md transition-all hover:shadow-lg p-5 border border-gray-100">
    <div class="flex flex-col md:flex-row md:items-start justify-between mb-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{quote.quoteNumber}</h3>
        <p class="text-sm text-gray-500">Created on {formatDate(quote.dateCreated)}</p>
      </div>
      <div class="self-start mt-2 md:mt-0">
        <QuoteStatusBadge status={quote.status} />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <span class="text-xs text-gray-500 uppercase font-medium">Type</span>
        <p class="text-sm text-gray-700">
          {quote.quoteType === 'FIXED_PRICE' ? 'Fixed Price' : 'Time & Expense'}
        </p>
      </div>
      <div>
        <span class="text-xs text-gray-500 uppercase font-medium">Total</span>
        <p class="text-base font-semibold text-gray-900">{formatCurrency(quote.total)}</p>
      </div>
    </div>
    
    <div class="line-clamp-2 text-sm text-gray-600 mb-4">{quote.scopeOfWork}</div>
    
    <div class="flex justify-between items-center pt-2 border-t border-gray-100">
      <div class="text-xs text-gray-500">
        {quote.lineItems.length} line item{quote.lineItems.length !== 1 ? 's' : ''}
      </div>
      {#if quote.dateExpires}
        <div class="text-xs {new Date(quote.dateExpires) < new Date() ? 'text-red-500' : 'text-gray-500'}">
          {new Date(quote.dateExpires) < new Date() 
            ? 'Expired on ' 
            : 'Expires on '}{formatDate(quote.dateExpires)}
        </div>
      {/if}
    </div>
  </div>
</a>