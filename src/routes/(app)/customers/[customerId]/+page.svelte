<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  import { customers, loadCustomers } from '$lib/stores/customerStore';
  import { jobs, loadJobs } from '$lib/stores/jobStore';
  import type { Customer } from '$lib/types/Customer';
  import type { Job } from '$lib/types/Job';
  
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Address from '$lib/components/ui/Address.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  import PhoneIcon from '$lib/components/icons/PhoneIcon.svelte';
  import EmailIcon from '$lib/components/icons/EmailIcon.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  
  let customer: Customer | undefined;
  let customerJobs: Job[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // Status label mapping
  const statusLabels: Record<string, { text: string, color: string }> = {
    'pending': { text: 'Pending', color: 'yellow' },
    'in-progress': { text: 'In Progress', color: 'blue' },
    'completed': { text: 'Completed', color: 'green' },
    'canceled': { text: 'Canceled', color: 'red' },
  };
  
  // Job type label mapping
  const jobTypeLabels: Record<string, string> = {
    'water-damage': 'Water Damage',
    'fire-damage': 'Fire Damage',
    'mold-remediation': 'Mold Remediation',
    'storm-damage': 'Storm Damage',
    'reconstruction': 'Reconstruction',
    'cleaning': 'Cleaning',
    'other': 'Other',
  };
  
  onMount(async () => {
    isLoading = true;
    error = null;
    
    try {
      // Load customers if not already loaded
      if ($customers.length === 0) {
        await loadCustomers();
      }
      
      // Load jobs if not already loaded
      if ($jobs.length === 0) {
        await loadJobs();
      }
      
      // Get customer ID from URL
      const customerId = $page.params.customerId;
      
      // Find customer from store
      customer = $customers.find(c => c.id === customerId);
      
      if (!customer) {
        error = "Customer not found";
        return;
      }
      
      // Find jobs for this customer
      customerJobs = $jobs.filter(job => job.customerId === customerId);
    } catch (err) {
      console.error("Error loading customer data:", err);
      error = "Failed to load customer data";
    } finally {
      isLoading = false;
    }
  });

  function formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  function formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function viewJob(jobId: string) {
    goto(`/jobs/${jobId}`);
  }

  function createNewJob() {
    goto(`/jobs/new?customerId=${customer?.id}`);
  }

  function createNewQuote() {
    goto(`/quotes/new?customerId=${customer?.id}`);
  }
  
  function sendEmail() {
    if (customer?.email) {
      window.location.href = `mailto:${customer.email}`;
    }
  }
  
  function callCustomer() {
    if (customer?.phone) {
      window.location.href = `tel:${customer.phone}`;
    }
  }
  
  function editCustomer() {
    // Would navigate to customer edit page if implemented
    alert('Edit customer functionality not implemented yet');
  }
</script>

<PageHeader title="Customer Details" subtitle="View and manage customer information" back="/customers">
  <div slot="actions">
    <Button color="primary" on:click={editCustomer}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
      Edit Customer
    </Button>
  </div>
</PageHeader>

{#if isLoading}
  <div class="flex justify-center my-12">
    <LoadingSpinner size="lg" color="blue" />
  </div>
{:else if error}
  <div class="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">{error}</p>
      </div>
    </div>
  </div>
{:else if customer}
  <div class="container mx-auto px-4 py-6">
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">{customer.name}</h1>
        <div class="flex space-x-3">
          <Button color="blue" class_="w-full" on:click={createNewJob}>
            <PlusIcon class_="h-4 w-4 mr-2" />
            Create New Job
          </Button>
          <Button color="blue" class_="w-full" on:click={createNewQuote}>
            <PlusIcon class_="h-4 w-4 mr-2" />
            Create New Quote
          </Button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Customer Info Card -->
        <Card className="p-6">
          <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Contact Person</p>
              <p class="font-medium">{customer.contactPerson || 'N/A'}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Phone</p>
              <div class="flex items-center">
                <p class="font-medium">{customer.phone || 'N/A'}</p>
                {#if customer.phone}
                  <Button color="gray" on:click={callCustomer} class_="ml-2 p-1">
                    <PhoneIcon class_="h-4 w-4" />
                  </Button>
                {/if}
              </div>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <div class="flex items-center">
                <p class="font-medium">{customer.email || 'N/A'}</p>
                {#if customer.email}
                  <Button color="gray" on:click={sendEmail} class_="ml-2 p-1">
                    <EmailIcon class_="h-4 w-4" />
                  </Button>
                {/if}
              </div>
            </div>
            
            <div>
              <p class="text-sm text-gray-500">Created</p>
              <p class="font-medium">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
          
          <div class="mt-6 flex space-x-3">
            <Button color="gray" class_="w-full" on:click={callCustomer} disabled={!customer.phone}>
              Call Customer
            </Button>
            <Button color="gray" class_="w-full" on:click={sendEmail} disabled={!customer.email}>
              Send Email
            </Button>
          </div>
        </Card>
        
        <!-- Primary Address Card -->
        <Card className="p-6">
          <h2 class="text-lg font-semibold mb-4">Primary Address</h2>
          {#if customer.primaryAddress}
            <Address address={customer.primaryAddress} />
          {:else}
            <p class="text-gray-500">No primary address provided</p>
          {/if}
        </Card>
        
        <!-- Billing Address Card -->
        <Card className="p-6">
          <h2 class="text-lg font-semibold mb-4">Billing Address</h2>
          {#if customer.billingAddress}
            <Address address={customer.billingAddress} />
          {:else if customer.primaryAddress}
            <div>
              <p class="text-gray-500 mb-2">Same as primary address</p>
              <Address address={customer.primaryAddress} />
            </div>
          {:else}
            <p class="text-gray-500">No billing address provided</p>
          {/if}
        </Card>
      </div>
      
      {#if customer.notes}
        <Card className="p-6 mb-8">
          <h2 class="text-lg font-semibold mb-3">Notes</h2>
          <p class="whitespace-pre-wrap">{customer.notes}</p>
        </Card>
      {/if}
      
      <!-- Jobs Section -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Jobs</h2>
        
        {#if customerJobs.length === 0}
          <EmptyState 
            message="No jobs found" 
            description="This customer doesn't have any jobs yet"
            showAction={true}
            on:action={createNewJob}
            title="No jobs found"
          />
        {:else}
          <Card>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each customerJobs as job}
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{job.title}</div>
                            <div class="text-sm text-gray-500">{job.type || 'Unknown Type'}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <Badge color={
                          String(job.status).toLowerCase().includes('complet') ? 'green' :
                          String(job.status).toLowerCase().includes('progress') ? 'blue' :
                          String(job.status).toLowerCase().includes('pend') ? 'yellow' :
                          String(job.status).toLowerCase().includes('cancel') ? 'red' : 'gray'
                        }>
                          {job.status}
                        </Badge>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(job.createdAt)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(job.estimatedCost)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button color="blue" on:click={() => viewJob(job.id)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </Card>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <EmptyState 
    message="Customer not found" 
    description="We couldn't find the customer you're looking for"
    icon="users"
  />
{/if} 