<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job'; // Adjust import path if needed
  import Button from '$lib/components/ui/Button.svelte'; // Assuming Button component exists

  export let job: Job;

  const dispatch = createEventDispatcher();

  // Calculate the total invoice amount (including tax)
  const taxRate = 0.0875; // 8.75% default tax rate
  
  // Calculate subtotal from various sources
  const subtotal = job?.total || 
                  (job?.lineItems && job.lineItems.length > 0 
                    ? job.lineItems.reduce((sum, item) => sum + item.total, 0) 
                    : 0) ||
                  (job?.laborCost || 0) + (job?.materialsCost || 0) + (job?.equipmentCost || 0) || 
                  0;
                  
  // Calculate tax amount
  const taxAmount = subtotal * taxRate;
  
  // Calculate final invoice total with tax
  const invoiceTotal = subtotal + taxAmount;

  console.log('ApplyPaymentForm - Calculating invoice total:', {
    jobId: job?.id,
    jobTotal: job?.total,
    subtotal: subtotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    lineItemsTotal: job?.lineItems ? job.lineItems.reduce((sum, item) => sum + item.total, 0) : 0,
    laborCost: job?.laborCost,
    materialsCost: job?.materialsCost,
    equipmentCost: job?.equipmentCost,
    calculatedTotal: invoiceTotal
  });
  
  // State for form fields
  let paymentAmount: number = invoiceTotal;
  let paymentDate: string = new Date().toISOString().split('T')[0];
  let paymentMethod: string = 'Check'; // Default value
  let referenceNumber: string = '';
  let paymentNotes: string = '';
  let isSubmitting = false;
  let errorMessage = '';
  let customAmount = false;

  // Payment amount options
  const amountOptions = [
    { label: 'Full Invoice Amount', value: 'full' },
    { label: 'Custom Amount', value: 'custom' }
  ];
  
  let selectedAmountOption = 'full';

  // Expanded payment methods
  const paymentMethods = [
    'Check', 
    'Credit Card', 
    'ACH/Bank Transfer', 
    'Cash', 
    'Money Order',
    'Insurance Payment',
    'Other'
  ];

  // Handle amount option change
  function handleAmountOptionChange() {
    if (selectedAmountOption === 'full') {
      paymentAmount = invoiceTotal;
      customAmount = false;
    } else {
      customAmount = true;
    }
  }

  function validateForm(): boolean {
    errorMessage = '';
    if (!paymentAmount || paymentAmount <= 0) {
      errorMessage = 'Payment amount must be positive.';
      return false;
    }
    if (paymentAmount > invoiceTotal) {
      errorMessage = 'Payment amount cannot exceed the invoice total.';
      return false;
    }
    if (!paymentDate) {
      errorMessage = 'Payment date is required.';
      return false;
    }
    if (!paymentMethod) {
      errorMessage = 'Payment method is required.';
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    isSubmitting = true;
    try {
      const paymentData = {
        amount: paymentAmount,
        date: paymentDate,
        method: paymentMethod,
        referenceNumber,
        notes: paymentNotes
      };
      // Dispatch the collected data
      dispatch('submit', paymentData);
      // No need to reset form here, modal will close
    } catch (err) {
      console.error("Error submitting payment form:", err);
      errorMessage = 'An unexpected error occurred.';
      isSubmitting = false; // Only reset submitting state on error
    }
    // Don't set isSubmitting = false on success, modal will close
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4 p-4">
  {#if errorMessage}
    <div class="text-red-600 bg-red-100 border border-red-400 p-2 rounded">
      {errorMessage}
    </div>
  {/if}

  <div class="mb-6">
    <div class="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
      <h3 class="font-medium text-blue-800 mb-1">Invoice Information</h3>
      <p class="text-blue-700">Total Amount Due: ${invoiceTotal.toFixed(2)}</p>
      {#if job?.invoiceNumber}
        <p class="text-blue-700">Invoice #: {job.invoiceNumber}</p>
      {/if}
    </div>
  </div>

  <div>
    <label for="payment-amount-option" class="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
    <select
      id="payment-amount-option"
      bind:value={selectedAmountOption}
      on:change={handleAmountOptionChange}
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent mb-2"
      disabled={isSubmitting}
    >
      {#each amountOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    
    {#if customAmount}
      <input
        type="number"
        id="payment-amount"
        step="0.01"
        bind:value={paymentAmount}
        required
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
        disabled={isSubmitting}
      />
    {/if}
  </div>

  <div>
    <label for="payment-date" class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
    <input
      type="date"
      id="payment-date"
      bind:value={paymentDate}
      required
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
      disabled={isSubmitting}
    />
  </div>

  <div>
    <label for="payment-method" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
    <select
      id="payment-method"
      bind:value={paymentMethod}
      required
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
      disabled={isSubmitting}
    >
      {#each paymentMethods as method}
        <option value={method}>{method}</option>
      {/each}
    </select>
  </div>

  <div>
    <label for="reference-number" class="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
    <input
      type="text"
      id="reference-number"
      placeholder="Check #, Transaction ID, etc."
      bind:value={referenceNumber}
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
      disabled={isSubmitting}
    />
  </div>

  <div>
    <label for="payment-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
    <textarea
      id="payment-notes"
      rows="3"
      bind:value={paymentNotes}
      class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
      disabled={isSubmitting}
      placeholder="Any additional information about this payment"
    ></textarea>
  </div>

  <div class="flex justify-end space-x-3 pt-4">
    <Button type="button" variant="secondary" on:click={handleCancel} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button type="submit" variant="primary" disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Apply Payment'}
    </Button>
  </div>
</form> 