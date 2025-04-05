<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';
  import type { Quote } from '$lib/types/Quote';
  import { QuoteStatus, QuoteType, type ScopeOfWorkData } from '$lib/types/Quote';
  import type { Customer, Address } from '$lib/types/Customer';
  import { getQuoteById, updateQuote } from '$lib/services/quotes';
  import { getCustomerById } from '$lib/services/customers';
  import { createJob } from '$lib/services/jobs';
  import { JobType } from '$lib/types/Job';
  import { format } from 'date-fns';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import QuoteStatusBadge from '$lib/components/quotes/QuoteStatusBadge.svelte';

  // Store for the current quote
  const currentQuote = writable<Quote | null>(null);
  const customer = writable<Customer | null>(null);
  const loading = writable<boolean>(true);
  const error = writable<string | null>(null);
  const actionLoading = writable<boolean>(false);
  const actionError = writable<string | null>(null);

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

  // Load quote and customer data
  async function loadQuoteData() {
    loading.set(true);
    error.set(null);
    
    try {
      const quoteId = $page.params.quoteId;
      const quoteData = await getQuoteById(quoteId);
      
      if (!quoteData) {
        error.set('Quote not found');
        loading.set(false);
        return;
      }
      
      currentQuote.set(quoteData);
      
      // Fetch customer data
      if (quoteData.customerId) {
        const customerData = await getCustomerById(quoteData.customerId);
        customer.set(customerData);
      }
      
    } catch (err) {
      console.error('Error loading quote:', err);
      error.set(err instanceof Error ? err.message : 'Failed to load quote');
    } finally {
      loading.set(false);
    }
  }

  // Action functions
  async function finalizeAndSend() {
    await updateQuoteStatus(QuoteStatus.SENT);
  }

  async function markAccepted() {
    await updateQuoteStatus(QuoteStatus.ACCEPTED);
  }

  async function markDeclined() {
    await updateQuoteStatus(QuoteStatus.DECLINED);
  }

  async function updateQuoteStatus(status: QuoteStatus) {
    if (!$currentQuote) return;
    
    actionLoading.set(true);
    actionError.set(null);
    
    try {
      const updatedQuote = await updateQuote($currentQuote.id, { 
        status,
        ...(status === QuoteStatus.SENT ? { dateSent: new Date().toISOString() } : {})
      });
      
      currentQuote.set(updatedQuote);
    } catch (err) {
      console.error('Error updating quote status:', err);
      actionError.set(err instanceof Error ? err.message : 'Failed to update quote status');
    } finally {
      actionLoading.set(false);
    }
  }

  async function convertToJob() {
    if (!$currentQuote || !$customer) return;
    
    actionLoading.set(true);
    actionError.set(null);
    
    try {
      // Create job from quote data
      const newJob = await createJob({
        customerId: $currentQuote.customerId,
        title: `Quote ${$currentQuote.quoteNumber}`,
        // Convert ScopeOfWorkData to string format for the job description
        description: typeof $currentQuote.scopeOfWork === 'string' 
          ? $currentQuote.scopeOfWork 
          : formatScopeOfWorkForPDF($currentQuote.scopeOfWork),
        siteAddress: $currentQuote.siteAddress,
        jobType: JobType.OTHER, // Default job type
        priority: 3, // Default medium priority
        assignedUserIds: [], // No users assigned initially 
        originatingQuoteId: $currentQuote.id
      });
      
      // Update quote to mark as converted
      const updatedQuote = await updateQuote($currentQuote.id, {
        status: QuoteStatus.CONVERTED_TO_JOB,
        associatedJobId: newJob.id
      });
      
      currentQuote.set(updatedQuote);
      
      // Navigate to the new job
      goto(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error('Error converting quote to job:', err);
      actionError.set(err instanceof Error ? err.message : 'Failed to convert quote to job');
    } finally {
      actionLoading.set(false);
    }
  }

  // Function to format address for display
  function formatAddress(address: Address): string {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  }

  async function generatePDF() {
    if (!$currentQuote) return;
    
    // Convert the scope of work to string if it's an object
    let scopeOfWorkText: string;
    if (typeof $currentQuote.scopeOfWork === 'string') {
      scopeOfWorkText = $currentQuote.scopeOfWork;
    } else {
      // Format the structured scope of work into a single string
      scopeOfWorkText = formatScopeOfWorkForPDF($currentQuote.scopeOfWork);
    }
    
    // Build the PDF content
    const content = {
      title: `Quote #${$currentQuote.quoteNumber}`,
      customer: $customer ? $customer.name : 'Unknown Customer',
      address: formatAddress($currentQuote.siteAddress),
      status: $currentQuote.status,
      date: new Date($currentQuote.dateCreated).toLocaleDateString(),
      description: scopeOfWorkText,
      items: $currentQuote.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.unitPrice,
        total: item.total,
        isEstimate: item.isEstimate || false
      })),
      subtotal: $currentQuote.subtotal,
      tax: $currentQuote.taxAmount || 0,
      total: $currentQuote.total
    };
    
    try {
      // Generate and open the PDF (implementation depends on your PDF generation library)
      console.log('Generating PDF with content:', content);
      
      // Here you would call your actual PDF generation service
      alert('PDF Generation: This would generate and open a PDF with the quote details in a real app.');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  // Function to format structured scope of work for PDF
  function formatScopeOfWorkForPDF(scopeOfWork: ScopeOfWorkData): string {
    const sections = [];
    
    if (scopeOfWork.summary) {
      sections.push(`PROJECT SUMMARY:\n${scopeOfWork.summary}`);
    }
    
    if (scopeOfWork.waterMitigation) {
      sections.push(`WATER MITIGATION:\n${scopeOfWork.waterMitigation}`);
    }
    
    if (scopeOfWork.containment) {
      sections.push(`CONTAINMENT:\n${scopeOfWork.containment}`);
    }
    
    if (scopeOfWork.affectedMaterials) {
      sections.push(`AFFECTED MATERIALS:\n${scopeOfWork.affectedMaterials}`);
    }
    
    if (scopeOfWork.dryingProcess) {
      sections.push(`DRYING PROCESS:\n${scopeOfWork.dryingProcess}`);
    }
    
    if (scopeOfWork.demolition) {
      sections.push(`DEMOLITION:\n${scopeOfWork.demolition}`);
    }
    
    if (scopeOfWork.cleaningSanitizing) {
      sections.push(`CLEANING & SANITIZING:\n${scopeOfWork.cleaningSanitizing}`);
    }
    
    if (scopeOfWork.reconstruction) {
      sections.push(`RECONSTRUCTION:\n${scopeOfWork.reconstruction}`);
    }
    
    if (scopeOfWork.exclusions) {
      sections.push(`EXCLUSIONS / NOT INCLUDED:\n${scopeOfWork.exclusions}`);
    }
    
    return sections.join('\n\n');
  }

  onMount(() => {
    loadQuoteData();
  });
</script>

<PageHeader 
  title="Quote Details" 
  back="/quotes" 
/>

<div class="container mx-auto p-4">
  {#if $loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
    </div>
  {:else if $error}
    <Card>
      <div class="p-6 text-center">
        <div class="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-medium">Error Loading Quote</h3>
        </div>
        <p class="mb-4">{$error}</p>
        <Button on:click={loadQuoteData}>Try Again</Button>
      </div>
    </Card>
  {:else if $currentQuote}
    <div class="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <!-- Quote Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{$currentQuote.quoteNumber}</h1>
            <p class="text-sm text-gray-500">Created on {formatDate($currentQuote.dateCreated)}</p>
          </div>
          <div class="mt-2 md:mt-0">
            <QuoteStatusBadge status={$currentQuote.status} size="lg" />
          </div>
        </div>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span class="text-xs text-gray-500 uppercase font-medium">Quote Type</span>
            <p class="font-medium">
              {#if $currentQuote.quoteType === 'FIXED_PRICE'}
                Fixed Price
              {:else}
                <span class="flex items-center">
                  Time & Expense
                  <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Variable Cost
                  </span>
                </span>
              {/if}
            </p>
          </div>
          {#if $currentQuote.dateSent}
            <div>
              <span class="text-xs text-gray-500 uppercase font-medium">Sent On</span>
              <p class="font-medium">{formatDate($currentQuote.dateSent)}</p>
            </div>
          {/if}
          {#if $currentQuote.dateExpires}
            <div>
              <span class="text-xs text-gray-500 uppercase font-medium">Expires On</span>
              <p class="font-medium {new Date($currentQuote.dateExpires) < new Date() ? 'text-red-600' : ''}">
                {formatDate($currentQuote.dateExpires)}
              </p>
            </div>
          {/if}
        </div>

        {#if $currentQuote.quoteType === 'T_AND_E'}
          <div class="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-amber-800">Time & Expense Quote</h3>
                <p class="mt-1 text-sm text-amber-700">
                  This is a time and expense quote. Final costs may vary based on actual time spent and materials used.
                  Items marked as "Estimate" are subject to change.
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <!-- Customer Info -->
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Customer Information</h2>
          {#if $customer}
            <div class="space-y-1">
              <p class="font-medium">{$customer.name}</p>
              {#if $customer.phone}
                <p class="flex items-center text-gray-600">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {$customer.phone}
                </p>
              {/if}
              {#if $customer.email}
                <p class="flex items-center text-gray-600">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {$customer.email}
                </p>
              {/if}
              {#if $customer.address}
                <p class="flex items-center text-gray-600">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {$customer.address.street}, {$customer.address.city}
                </p>
              {/if}
            </div>
          {:else}
            <p class="text-gray-500 italic">Customer information not available</p>
          {/if}
        </div>
        
        <!-- Site Address -->
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Site Address</h2>
          <div class="space-y-1">
            <p>{$currentQuote.siteAddress.street}</p>
            <p>{$currentQuote.siteAddress.city}, {$currentQuote.siteAddress.state} {$currentQuote.siteAddress.zip}</p>
          </div>
        </div>
        
        <!-- Details -->
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Quote Details</h2>
          <div class="space-y-1">
            <div class="flex justify-between py-1">
              <span class="font-medium">Subtotal:</span>
              <span>{formatCurrency($currentQuote.subtotal)}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="font-medium">Tax ({(($currentQuote?.taxRate || 0) * 100).toFixed(2)}%):</span>
              <span>{formatCurrency($currentQuote?.taxAmount || 0)}</span>
            </div>
            <div class="flex justify-between py-1 border-t border-gray-200 mt-1 pt-1">
              <span class="font-bold">Total:</span>
              <span class="font-bold">{formatCurrency($currentQuote.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scope of Work -->
      <div class="p-6 border-t border-gray-200">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">Scope of Work</h2>
        
        {#if typeof $currentQuote.scopeOfWork === 'string'}
          <!-- Handle legacy quotes with string scopeOfWork -->
          <p class="whitespace-pre-line text-gray-700">{$currentQuote.scopeOfWork}</p>
        {:else}
          <!-- Display structured scope of work -->
          <div class="space-y-4">
            {#if $currentQuote.scopeOfWork.summary}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Project Summary
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.summary}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.waterMitigation}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Water Mitigation / Initial Steps
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.waterMitigation}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.containment}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                  </svg>
                  Containment / Control Measures
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.containment}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.affectedMaterials}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Affected Materials
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.affectedMaterials}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.dryingProcess}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Drying Process
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.dryingProcess}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.demolition}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Demolition Requirements
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.demolition}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.cleaningSanitizing}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Cleaning & Sanitizing
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.cleaningSanitizing}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.reconstruction}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Reconstruction / Build-Back
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.reconstruction}</p>
              </div>
            {/if}
            
            {#if $currentQuote.scopeOfWork.exclusions}
              <div class="mb-4">
                <h3 class="text-md font-medium text-gray-800 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Exclusions / Not Included
                </h3>
                <p class="whitespace-pre-line text-gray-700 ml-6">{$currentQuote.scopeOfWork.exclusions}</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Line Items -->
      <div class="p-6 border-t border-gray-200">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold text-gray-800">Line Items</h2>
          {#if $currentQuote.quoteType === 'T_AND_E'}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-amber-100 text-amber-800">
              <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-amber-600" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Estimated quantities may vary
            </span>
          {/if}
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th class="px-3 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each $currentQuote.lineItems as item}
                <tr class="{item.isEstimate ? 'bg-amber-50' : ''}">
                  <td class="px-3 py-2 whitespace-normal">
                    <div>
                      <span class="font-medium">{item.description}</span>
                      {#if item.isEstimate}
                        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Estimate</span>
                      {/if}
                    </div>
                    {#if item.category}
                      <div class="text-xs text-gray-500 mt-0.5">{item.category}</div>
                    {/if}
                  </td>
                  <td class="px-3 py-2 text-right whitespace-nowrap">{item.quantity}</td>
                  <td class="px-3 py-2 text-right whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                  <td class="px-3 py-2 text-right whitespace-nowrap font-medium">{formatCurrency(item.total)}</td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="px-3 py-3 text-right text-sm font-medium text-gray-500">Subtotal</td>
                <td class="px-3 py-3 text-right font-medium">{formatCurrency($currentQuote.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" class="px-3 py-3 text-right text-sm font-medium text-gray-500">Tax ({(($currentQuote?.taxRate || 0) * 100).toFixed(2)}%)</td>
                <td class="px-3 py-3 text-right font-medium">{formatCurrency($currentQuote?.taxAmount || 0)}</td>
              </tr>
              <tr class="bg-gray-50">
                <td colspan="3" class="px-3 py-3 text-right text-sm font-bold text-gray-700">Total</td>
                <td class="px-3 py-3 text-right font-bold">{formatCurrency($currentQuote.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <!-- Notes -->
      {#if $currentQuote.notes}
        <div class="p-6 border-t border-gray-200">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Notes</h2>
          <p class="whitespace-pre-line text-gray-700">{$currentQuote.notes}</p>
        </div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="p-6 border-t border-gray-200 bg-gray-50">
        {#if $actionError}
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{$actionError}</p>
              </div>
            </div>
          </div>
        {/if}
        
        <div class="flex flex-wrap gap-3 justify-end">
          {#if $currentQuote.status === QuoteStatus.DRAFT}
            <Button color="secondary" disabled={$actionLoading}>
              Edit Quote
            </Button>
            <Button color="primary" on:click={finalizeAndSend} loading={$actionLoading}>
              Finalize & Send
            </Button>
          {:else if $currentQuote.status === QuoteStatus.SENT}
            <Button color="secondary" disabled={$actionLoading}>
              Resend
            </Button>
            <Button color="danger" on:click={markDeclined} loading={$actionLoading}>
              Mark Declined
            </Button>
            <Button color="success" on:click={markAccepted} loading={$actionLoading}>
              Mark Accepted
            </Button>
          {:else if $currentQuote.status === QuoteStatus.ACCEPTED}
            <Button color="primary" on:click={convertToJob} loading={$actionLoading}>
              Convert to Job
            </Button>
          {:else if $currentQuote.status === QuoteStatus.CONVERTED_TO_JOB && $currentQuote.associatedJobId}
            <a href={`/jobs/${$currentQuote.associatedJobId}`}>
              <Button color="primary">
                View Associated Job
              </Button>
            </a>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <Card>
      <div class="p-6 text-center">
        <p class="text-gray-500">Quote not found</p>
      </div>
    </Card>
  {/if}
</div> 