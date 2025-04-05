<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import type { InvoicePayment } from '$lib/types/Invoice';
  import { updateJob } from '$lib/services/jobs';
  import { format } from 'date-fns';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher<{
    submit: InvoicePayment;
    cancel: void;
  }>();
  
  // Form fields
  let paymentDate = format(new Date(), 'yyyy-MM-dd');
  let amount = job.total?.toString() || '';
  let paymentMethod = 'Credit Card';
  let referenceNumber = '';
  let notes = '';
  let isSubmitting = false;
  let errorMessage = '';
  
  // Payment method options
  const paymentMethods = [
    'Credit Card',
    'Check',
    'Bank Transfer',
    'Cash',
    'Insurance',
    'Other'
  ];
  
  function validateForm(): boolean {
    if (!paymentDate) {
      errorMessage = 'Please select a payment date';
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errorMessage = 'Please enter a valid payment amount';
      return false;
    }
    
    if (!paymentMethod) {
      errorMessage = 'Please select a payment method';
      return false;
    }
    
    return true;
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      // Create payment data
      const paymentData: InvoicePayment = {
        date: new Date(paymentDate),
        amount: parseFloat(amount),
        method: paymentMethod,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        timestamp: new Date()
      };
      
      // Dispatch the payment data to the parent component
      dispatch('submit', paymentData);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      errorMessage = 'Failed to process payment. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
  <h2 class="text-xl font-bold text-gray-800 mb-6">Record Payment</h2>
  
  {#if job.invoiceNumber}
    <div class="bg-gray-50 p-4 rounded mb-6 border border-gray-200">
      <div class="flex justify-between mb-2">
        <span class="font-medium text-gray-700">Invoice Number:</span>
        <span>{job.invoiceNumber}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span class="font-medium text-gray-700">Invoice Date:</span>
        <span>{job.invoiceDate ? format(new Date(job.invoiceDate), 'MMM d, yyyy') : 'N/A'}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span class="font-medium text-gray-700">Due Date:</span>
        <span>{job.invoiceDueDate ? format(new Date(job.invoiceDueDate), 'MMM d, yyyy') : 'N/A'}</span>
      </div>
      <div class="flex justify-between">
        <span class="font-medium text-gray-700">Total Amount:</span>
        <span class="font-bold text-dryd-blue">${job.total?.toFixed(2) || '0.00'}</span>
      </div>
    </div>
  {/if}
  
  {#if errorMessage}
    <div class="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
      {errorMessage}
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Payment Date -->
    <div>
      <label for="paymentDate" class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
      <input
        type="date"
        id="paymentDate"
        bind:value={paymentDate}
        max={format(new Date(), 'yyyy-MM-dd')}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isSubmitting}
      />
    </div>
    
    <!-- Payment Amount -->
    <div>
      <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
      <div class="relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          id="amount"
          bind:value={amount}
          step="0.01"
          min="0"
          class="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
          disabled={isSubmitting}
        />
      </div>
    </div>
    
    <!-- Payment Method -->
    <div>
      <label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
      <select
        id="paymentMethod"
        bind:value={paymentMethod}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isSubmitting}
      >
        {#each paymentMethods as method}
          <option value={method}>{method}</option>
        {/each}
      </select>
    </div>
    
    <!-- Reference Number -->
    <div>
      <label for="referenceNumber" class="block text-sm font-medium text-gray-700 mb-1">
        Reference Number <span class="text-gray-400 text-xs">(Optional)</span>
      </label>
      <input
        type="text"
        id="referenceNumber"
        bind:value={referenceNumber}
        placeholder="Check #, Transaction ID, etc."
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isSubmitting}
      />
    </div>
    
    <!-- Notes -->
    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
        Notes <span class="text-gray-400 text-xs">(Optional)</span>
      </label>
      <textarea
        id="notes"
        bind:value={notes}
        rows="3"
        placeholder="Any additional information about this payment"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue"
        disabled={isSubmitting}
      ></textarea>
    </div>
    
    <!-- Action Buttons -->
    <div class="pt-4 flex justify-end space-x-3">
      <button
        type="button"
        on:click={handleCancel}
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      
      <button
        type="submit"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        {:else}
          Mark as Paid
        {/if}
      </button>
    </div>
  </form>
</div> 