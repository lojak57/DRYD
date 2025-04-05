<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import type { Customer, Address } from '$lib/types/Customer';
  import type { User } from '$lib/types/User';
  import { getCustomerById } from '$lib/services/customers';
  import { getUserById } from '$lib/services/users';
  import { onMount } from 'svelte';
  import Logo from '$lib/components/common/Logo.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { format } from 'date-fns';
  
  // Re-define CustomLineItem type since we can't import it directly from JobFinalizeForm
  interface CustomLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    internalCost?: number;
    total: number;
    category: string;
  }
  
  export let job: Job;
  export let lineItems: CustomLineItem[] = job.lineItems || [];
  export let laborCost: number = job.laborCost || 0;
  export let materialsCost: number = job.materialsCost || 0;
  export let equipmentCost: number = job.equipmentCost || 0;
  export let mode: 'create' | 'review' = 'review';
  export let showInternalCosts: boolean = false; // New prop to toggle internal cost view
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    approve: void;
    cancel: void;
  }>();
  
  // Debug information
  console.log('InvoicePreview - Job data:', job);
  console.log('InvoicePreview - Line items:', lineItems);
  console.log('InvoicePreview - Costs:', { laborCost, materialsCost, equipmentCost });
  
  // Check if the job has any line items
  $: hasLineItems = lineItems && lineItems.length > 0;
  
  // State
  let customer: Customer | null = null;
  let technicians: User[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // Calculate totals
  $: subtotal = laborCost + materialsCost + equipmentCost + 
    lineItems.reduce((sum, item) => sum + item.total, 0);
  
  $: taxRate = 0.07; // 7% tax rate
  $: taxAmount = subtotal * taxRate;
  $: total = subtotal + taxAmount;
  
  // Calculate profit margin (for admin/internal view)
  $: totalInternalCost = [
    ...lineItems.map(item => ({category: item.category, cost: (item.internalCost || 0) * item.quantity})), 
    {category: 'LABOR', cost: laborCost * 0.65}, // Assuming labor internal cost is 65% of billed
    {category: 'MATERIALS', cost: materialsCost * 0.80}, // Assuming materials cost is 80% of billed
    {category: 'EQUIPMENT', cost: equipmentCost * 0.60} // Assuming equipment cost is 60% of billed
  ].reduce((sum, item) => sum + item.cost, 0);
  
  $: profitAmount = subtotal - totalInternalCost;
  $: profitMarginPercentage = subtotal > 0 ? (profitAmount / subtotal) * 100 : 0;
  
  // Track if current user is admin/office for viewing internal costs
  $: canViewInternalCosts = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  
  // Format date for invoice
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get today's date for invoice date
  const invoiceDate = formatDate(new Date());
  
  // Generate invoice number
  const invoiceNumber = `INV-${job.jobNumber.replace('J-', '')}-${new Date().getFullYear()}`;
  
  // Due date (30 days from now)
  const dueDate = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // Function to load technician data one by one
  async function loadTechnicians(userIds: string[]): Promise<User[]> {
    const techData: User[] = [];
    for (const id of userIds) {
      try {
        const tech = await getUserById(id);
        if (tech) techData.push(tech);
      } catch (err) {
        console.error(`Error loading technician ${id}:`, err);
      }
    }
    return techData;
  }
  
  // Load customer and technician data
  onMount(async () => {
    isLoading = true;
    error = null;
    
    try {
      // Load customer data
      if (job.customerId) {
        customer = await getCustomerById(job.customerId);
      }
      
      // Load technician data
      if (job.assignedUserIds && job.assignedUserIds.length > 0) {
        technicians = await loadTechnicians(job.assignedUserIds);
      }
      
      isLoading = false;
    } catch (err) {
      console.error('Error loading invoice data:', err);
      error = 'Failed to load customer or technician information';
      isLoading = false;
    }
  });
  
  // Handle approve and cancel
  function handleApprove() {
    dispatch('approve');
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  // Format address for display
  function formatAddress(address?: Address): string {
    if (!address) return 'No address available';
    
    let addressStr = address.street;
    if (address.city) addressStr += `, ${address.city}`;
    if (address.state) addressStr += `, ${address.state}`;
    if (address.zip) addressStr += ` ${address.zip}`;
    
    return addressStr;
  }
</script>

<div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dryd-blue"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
      <p class="text-red-700">{error}</p>
    </div>
  {:else}
    {#if job && job.payment}
      <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-8 flex items-center">
        <div class="mr-4 text-green-600">
          <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-green-800">PAID</h3>
          <p class="text-green-700">
            Payment of <span class="font-semibold">${job.payment.amount.toFixed(2)}</span> 
            received via <span class="font-medium">{job.payment.method}</span>
            on <span class="font-medium">{new Date(job.payment.date).toLocaleDateString()}</span>
            {#if job.payment.referenceNumber}
              (Ref: {job.payment.referenceNumber})
            {/if}
          </p>
          {#if job.payment.notes}
            <p class="text-green-600 text-sm mt-1">{job.payment.notes}</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Internal Cost Toggle (Admin/Office Only) -->
    {#if canViewInternalCosts}
      <div class="mb-4 flex justify-end">
        <label class="inline-flex items-center cursor-pointer">
          <span class="mr-2 text-sm text-gray-600">Show Internal View</span>
          <div class="relative">
            <input 
              type="checkbox" 
              bind:checked={showInternalCosts} 
              class="sr-only peer"
            >
            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>
    {/if}

    <!-- Invoice Header with Logo -->
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="mb-2">
          <div class="w-48 h-48 flex items-center justify-center">
            <Logo size="xl" linkToDashboard={false} />
          </div>
        </div>
        <p class="text-gray-600 text-sm">Professional Water & Fire Restoration Services</p>
        <p class="text-gray-600 text-sm">123 Main Street, Suite 101</p>
        <p class="text-gray-600 text-sm">Anytown, CA 90210</p>
        <p class="text-gray-600 text-sm">Phone: (555) 123-4567</p>
        <p class="text-gray-600 text-sm">Email: billing@dryadrestoration.com</p>
      </div>
      
      <div class="text-right">
        <h1 class="text-3xl font-bold text-dryd-blue mb-4">INVOICE</h1>
        <div class="bg-gray-100 p-3 rounded-md">
          <div class="flex justify-between mb-1">
            <span class="font-medium text-gray-700">Invoice #:</span>
            <span>{invoiceNumber}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="font-medium text-gray-700">Invoice Date:</span>
            <span>{invoiceDate}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="font-medium text-gray-700">Due Date:</span>
            <span>{dueDate}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-300 mt-2">
            <span class="font-bold text-gray-800">Amount Due:</span>
            <span class="font-bold text-dryd-blue">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Customer and Job Information -->
    <div class="grid grid-cols-2 gap-8 mt-10 mb-8">
      <div>
        <h2 class="text-lg font-bold text-gray-700 mb-3 border-b border-gray-300 pb-1">Bill To</h2>
        {#if customer}
          <p class="font-medium">{customer.name}</p>
          {#if customer.contactPerson}
            <p class="text-sm mb-1">{customer.contactPerson}</p>
          {/if}
          {#if customer.billingAddress}
            <p>{customer.billingAddress.street}</p>
            <p>{customer.billingAddress.city}, {customer.billingAddress.state} {customer.billingAddress.zip}</p>
          {:else if customer.primaryAddress}
            <p>{customer.primaryAddress.street}</p>
            <p>{customer.primaryAddress.city}, {customer.primaryAddress.state} {customer.primaryAddress.zip}</p>
          {/if}
          <p class="mt-2">{customer.email}</p>
          <p>{customer.phone}</p>
        {:else}
          <p class="text-gray-500">Customer information not available</p>
        {/if}
      </div>
      
      <div>
        <h2 class="text-lg font-bold text-gray-700 mb-3 border-b border-gray-300 pb-1">Job Details</h2>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
          <div class="font-medium text-gray-700">Job #:</div>
          <div>{job.jobNumber}</div>
          
          <div class="font-medium text-gray-700">Job Type:</div>
          <div class="capitalize">{job?.type ? job.type.toLowerCase() : 'Unknown'} Damage</div>
          
          <div class="font-medium text-gray-700">Job Location:</div>
          <div>
            {job.location ? `${job.location.street}, ${job.location.city}, ${job.location.state} ${job.location.zip}` : 'Job Site Address'}
          </div>
          
          <div class="font-medium text-gray-700">Start Date:</div>
          <div>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), 'MMM d, yyyy') : 'Not specified'}</div>
          
          <div class="font-medium text-gray-700">Completion Date:</div>
          <div>{job.completedDate ? format(new Date(job.completedDate), 'MMM d, yyyy') : 'Not specified'}</div>
        </div>
      </div>
    </div>
    
    <!-- Technician Information -->
    {#if technicians.length > 0}
      <div class="mb-8">
        <h2 class="text-base font-bold text-gray-700 mb-2">Technicians</h2>
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex flex-wrap gap-2">
            {#each technicians as tech}
              <div class="bg-white px-3 py-1 rounded-md border border-gray-200 text-sm">
                {tech.firstName} {tech.lastName}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Line Items Table -->
    <h2 class="text-lg font-bold text-gray-700 mb-3">Services & Products</h2>
    <div class="mb-8 overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Price</th>
            {#if showInternalCosts && canViewInternalCosts}
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Int. Cost</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Margin</th>
            {/if}
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Standard service items -->
          {#if laborCost > 0}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Labor Services</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">1</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${laborCost.toFixed(2)}</td>
              {#if showInternalCosts && canViewInternalCosts}
                {@const laborIntCost = laborCost * 0.65}
                {@const laborMargin = ((laborCost - laborIntCost) / laborCost * 100) || 0}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${laborIntCost.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  <span class={laborMargin < 20 ? 'text-red-600' : laborMargin < 40 ? 'text-yellow-600' : 'text-green-600'}>
                    {laborMargin.toFixed(1)}%
                  </span>
                </td>
              {/if}
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${laborCost.toFixed(2)}</td>
            </tr>
          {/if}
          
          {#if materialsCost > 0}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Materials & Supplies</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">1</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${materialsCost.toFixed(2)}</td>
              {#if showInternalCosts && canViewInternalCosts}
                {@const matIntCost = materialsCost * 0.80}
                {@const matMargin = ((materialsCost - matIntCost) / materialsCost * 100) || 0}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${matIntCost.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  <span class={matMargin < 20 ? 'text-red-600' : matMargin < 40 ? 'text-yellow-600' : 'text-green-600'}>
                    {matMargin.toFixed(1)}%
                  </span>
                </td>
              {/if}
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${materialsCost.toFixed(2)}</td>
            </tr>
          {/if}
          
          {#if equipmentCost > 0}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Equipment Usage</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">1</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${equipmentCost.toFixed(2)}</td>
              {#if showInternalCosts && canViewInternalCosts}
                {@const equipIntCost = equipmentCost * 0.60}
                {@const equipMargin = ((equipmentCost - equipIntCost) / equipmentCost * 100) || 0}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${equipIntCost.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  <span class={equipMargin < 20 ? 'text-red-600' : equipMargin < 40 ? 'text-yellow-600' : 'text-green-600'}>
                    {equipMargin.toFixed(1)}%
                  </span>
                </td>
              {/if}
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${equipmentCost.toFixed(2)}</td>
            </tr>
          {/if}
          
          <!-- Custom line items -->
          {#each lineItems as item}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{item.quantity}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${item.unitPrice.toFixed(2)}</td>
              {#if showInternalCosts && canViewInternalCosts}
                {@const itemIntCost = item.internalCost || (item.unitPrice * 0.7)}
                {@const itemMargin = ((item.unitPrice - itemIntCost) / item.unitPrice * 100) || 0}
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">${itemIntCost.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  <span class={itemMargin < 20 ? 'text-red-600' : itemMargin < 40 ? 'text-yellow-600' : 'text-green-600'}>
                    {itemMargin.toFixed(1)}%
                  </span>
                </td>
              {/if}
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot class="bg-gray-50">
          <tr>
            <td colspan={showInternalCosts && canViewInternalCosts ? 5 : 3} class="px-6 py-3 text-right text-sm font-medium text-gray-700">Subtotal</td>
            <td class="px-6 py-3 text-right text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</td>
          </tr>
          
          {#if showInternalCosts && canViewInternalCosts}
            <tr>
              <td colspan="5" class="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Internal Cost</td>
              <td class="px-6 py-3 text-right text-sm font-medium text-gray-900">${totalInternalCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="5" class="px-6 py-3 text-right text-sm font-medium text-gray-700">
                Profit Margin ({profitMarginPercentage.toFixed(1)}%)
              </td>
              <td class="px-6 py-3 text-right text-sm font-medium text-green-600 font-bold">${profitAmount.toFixed(2)}</td>
            </tr>
          {/if}
          
          <tr>
            <td colspan={showInternalCosts && canViewInternalCosts ? 5 : 3} class="px-6 py-3 text-right text-sm font-medium text-gray-700">Tax ({(taxRate * 100).toFixed(0)}%)</td>
            <td class="px-6 py-3 text-right text-sm font-medium text-gray-900">${taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="bg-gray-100">
            <td colspan={showInternalCosts && canViewInternalCosts ? 5 : 3} class="px-6 py-3 text-right text-base font-bold text-gray-800">Total Due</td>
            <td class="px-6 py-3 text-right text-base font-bold text-dryd-blue">${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <!-- Payment Information & Terms -->
    <div class="grid grid-cols-2 gap-8 mt-10">
      <div>
        <h2 class="text-base font-bold text-gray-700 mb-2">Payment Methods</h2>
        <div class="bg-gray-50 p-4 rounded-md">
          <p class="mb-2"><span class="font-medium">Check:</span> Make payable to "Dryad Restoration LLC"</p>
          <p class="mb-2"><span class="font-medium">Bank Transfer:</span> Contact us for account details</p>
          <p><span class="font-medium">Credit Card:</span> Call our office to pay by card</p>
        </div>
      </div>
      
      <div>
        <h2 class="text-base font-bold text-gray-700 mb-2">Terms & Conditions</h2>
        <div class="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
          <ul class="list-disc ml-4 space-y-1">
            <li>Payment is due within 30 days of invoice date</li>
            <li>Late payments subject to 1.5% monthly interest</li>
            <li>All work is guaranteed for 90 days from completion</li>
            <li>Questions about this invoice? Contact billing@dryadrestoration.com</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Thank You Note -->
    <div class="mt-8 text-center p-4 bg-dryd-blue bg-opacity-10 rounded-lg border border-dryd-blue border-opacity-20">
      <p class="text-dryd-blue font-medium">Thank you for choosing Dryad Restoration for your restoration needs!</p>
      <p class="text-gray-600 text-sm mt-1">We appreciate your business and are committed to your satisfaction.</p>
    </div>
    
    <!-- Approval Buttons -->
    <div class="mt-8 flex justify-end space-x-4">
      <button 
        on:click={handleCancel}
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
      >
        Back
      </button>
      
      <button 
        on:click={handleApprove}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#if mode === 'create'}
          Create & Submit Invoice
        {:else}
          Approve & Generate Invoice
        {/if}
      </button>
    </div>
  {/if}
</div> 