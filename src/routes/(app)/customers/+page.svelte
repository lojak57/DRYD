<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { customers, loadCustomers, isLoading } from '$lib/stores/customerStore';
  import type { Customer } from '$lib/types/Customer';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import SearchInput from '$lib/components/ui/SearchInput.svelte';

  // Local state
  let searchQuery = '';
  let filteredCustomers: Customer[] = [];
  let sortField: keyof Customer | '' = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let showNewCustomerModal = false;
  
  // New customer form state
  let newCustomer = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    primaryAddress: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    notes: ''
  };
  let isCreating = false;
  
  // Define a simple Plus icon inline instead of importing
  const plusIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
  </svg>`;
  
  // Add this type utility for safely accessing fields
  function getField<T>(obj: T, field: keyof T | ''): string {
    if (!field) return '';
    return String(obj[field] || '');
  }
  
  // Process customers when they change or search/sort changes
  $: {
    // Filter customers based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCustomers = $customers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        (customer.contactPerson && customer.contactPerson.toLowerCase().includes(query)) ||
        (customer.email && customer.email.toLowerCase().includes(query)) ||
        (customer.phone && customer.phone.toLowerCase().includes(query)) ||
        (customer.primaryAddress && 
          (customer.primaryAddress.street.toLowerCase().includes(query) ||
           customer.primaryAddress.city.toLowerCase().includes(query) ||
           customer.primaryAddress.state.toLowerCase().includes(query) ||
           customer.primaryAddress.zip.toLowerCase().includes(query)))
      );
    } else {
      filteredCustomers = [...$customers];
    }
    
    // Sort customers if sort field is specified
    if (sortField) {
      filteredCustomers.sort((a, b) => {
        const valueA = getField(a, sortField as keyof Customer);
        const valueB = getField(b, sortField as keyof Customer);
        
        if (valueA === valueB) return 0;
        
        // Handle null/undefined values
        if (valueA == null) return sortDirection === 'asc' ? -1 : 1;
        if (valueB == null) return sortDirection === 'asc' ? 1 : -1;
        
        // Compare values based on sort direction
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return sortDirection === 'asc'
            ? valueA < valueB ? -1 : 1
            : valueA < valueB ? 1 : -1;
        }
      });
    }
  }
  
  // Reset the new customer form
  function resetNewCustomerForm() {
    newCustomer = {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      primaryAddress: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      notes: ''
    };
  }
  
  // Sort customers by the specified field
  function sortCustomers(field: keyof Customer) {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to ascending
      sortField = field;
      sortDirection = 'asc';
    }
  }
  
  // Navigate to customer detail page
  function viewCustomer(customerId: string) {
    goto(`/customers/${customerId}`);
  }
  
  // Validate form before submission
  function validateForm() {
    return !!newCustomer.name.trim();
  }
  
  // Get validation state
  $: isFormValid = validateForm();
  
  // Create a new customer
  async function createCustomer() {
    if (!isFormValid) return;
    
    isCreating = true;
    
    try {
      // In a real app, we would send this to an API
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a unique ID
      const newId = `customer-${Date.now()}`;
      
      // Create new customer object
      const customerToAdd: Customer = {
        id: newId,
        name: newCustomer.name,
        contactPerson: newCustomer.contactPerson,
        email: newCustomer.email,
        phone: newCustomer.phone,
        primaryAddress: newCustomer.primaryAddress,
        notes: newCustomer.notes,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      // Add to store
      customers.update(existingCustomers => [customerToAdd, ...existingCustomers]);
      
      // Close modal and reset form
      showNewCustomerModal = false;
      resetNewCustomerForm();
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      isCreating = false;
    }
  }
  
  // Load customers on mount if not already loaded
  onMount(async () => {
    if ($customers.length === 0 && !$isLoading) {
      await loadCustomers();
    }
  });
</script>

<div class="container mx-auto px-4 py-6">
  <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold">Customers</h1>
      <p class="text-gray-600 mt-1">Manage your customer relationships</p>
    </div>
    <Button color="blue" on:click={() => (showNewCustomerModal = true)}>
      {@html plusIconSvg}
      Add New Customer
    </Button>
  </div>
  
  <div class="mb-6">
    <SearchInput 
      placeholder="Search customers by name, contact, email, phone, or address..." 
      bind:value={searchQuery} 
    />
  </div>
  
  {#if $isLoading}
    <div class="flex justify-center py-8">
      <LoadingSpinner size="lg" color="blue" />
    </div>
  {:else if $customers.length === 0}
    <EmptyState 
      message="No customers yet" 
      description="Add your first customer to get started"
      showAction={true}
      on:action={() => (showNewCustomerModal = true)}
      title="No customers found"
    />
  {:else if filteredCustomers.length === 0}
    <EmptyState 
      message="No matching customers" 
      description="Try a different search term"
      icon="search"
    />
  {:else}
    <!-- Mobile view with cards -->
    <div class="block md:hidden space-y-4">
      {#each filteredCustomers as customer (customer.id)}
        <Card class_="hover:shadow-lg transition-all cursor-pointer bg-white border-2 border-blue-100 rounded-lg shadow-md" on:click={() => viewCustomer(customer.id)}>
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-lg text-gray-900">{customer.name}</h3>
                {#if customer.contactPerson}
                  <p class="text-gray-700 text-sm mt-1">{customer.contactPerson}</p>
                {/if}
              </div>
              <div on:click={(e) => e.stopPropagation()} role="button" tabindex="0" on:keydown={(e) => {
                if (e.key === 'Enter') viewCustomer(customer.id);
              }}>
                <Button color="primary" size="sm" on:click={() => viewCustomer(customer.id)}>
                  View
                </Button>
              </div>
            </div>
            
            <div class="mt-3 space-y-1 text-sm">
              {#if customer.phone}
                <p class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </p>
              {/if}
              
              {#if customer.email}
                <p class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {customer.email}
                </p>
              {/if}
              
              {#if customer.primaryAddress?.street}
                <p class="flex items-center text-gray-600">
                  <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {customer.primaryAddress.street}, {customer.primaryAddress.city}
                </p>
              {/if}
            </div>
            
            <div class="mt-3 pt-3 border-t border-blue-100 flex justify-between items-center">
              <div class="text-xs text-gray-500">
                Customer since {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <div class="flex space-x-2">
                {#if customer.phone}
                  <div on:click={(e) => e.stopPropagation()} role="button" tabindex="0" on:keydown={(e) => {
                    if (e.key === 'Enter') window.location.href = `tel:${customer.phone}`;
                  }}>
                    <a 
                      href={`tel:${customer.phone}`} 
                      class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      aria-label="Call customer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                {/if}
                
                {#if customer.email}
                  <div on:click={(e) => e.stopPropagation()} role="button" tabindex="0" on:keydown={(e) => {
                    if (e.key === 'Enter') window.location.href = `mailto:${customer.email}`;
                  }}>
                    <a 
                      href={`mailto:${customer.email}`} 
                      class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      aria-label="Email customer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
    
    <!-- Desktop view with table -->
    <div class="hidden md:block">
      <Card>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortCustomers('name')}
                >
                  <div class="flex items-center">
                    <span>Name</span>
                    {#if sortField === 'name'}
                      <span class="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    {/if}
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortCustomers('contactPerson')}
                >
                  <div class="flex items-center">
                    <span>Contact Person</span>
                    {#if sortField === 'contactPerson'}
                      <span class="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    {/if}
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortCustomers('email')}
                >
                  <div class="flex items-center">
                    <span>Email</span>
                    {#if sortField === 'email'}
                      <span class="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    {/if}
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  on:click={() => sortCustomers('phone')}
                >
                  <div class="flex items-center">
                    <span>Phone</span>
                    {#if sortField === 'phone'}
                      <span class="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    {/if}
                  </div>
                </th>
                <th 
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each filteredCustomers as customer (customer.id)}
                <tr class="hover:bg-gray-50 cursor-pointer" on:click={() => viewCustomer(customer.id)}>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{customer.contactPerson || 'N/A'}</div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      {#if customer.email}
                        <div on:click={(e) => e.stopPropagation()}>
                          <a href="mailto:{customer.email}" class="text-blue-600 hover:underline">{customer.email}</a>
                        </div>
                      {:else}
                        N/A
                      {/if}
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      {#if customer.phone}
                        <div on:click={(e) => e.stopPropagation()}>
                          <a href="tel:{customer.phone}" class="text-blue-600 hover:underline">{customer.phone}</a>
                        </div>
                      {:else}
                        N/A
                      {/if}
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      {#if customer.primaryAddress}
                        {customer.primaryAddress.city}, {customer.primaryAddress.state}
                      {:else}
                        N/A
                      {/if}
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div on:click={(e) => e.stopPropagation()} role="button" tabindex="0" on:keydown={(e) => {
                      if (e.key === 'Enter') viewCustomer(customer.id);
                    }}>
                      <Button color="primary" size="sm" on:click={() => viewCustomer(customer.id)}>
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  {/if}
</div>

<!-- Add Customer Modal -->
{#if showNewCustomerModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Add New Customer</h2>
          <button 
            class="text-gray-500 hover:text-gray-700" 
            on:click={() => (showNewCustomerModal = false)}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form on:submit|preventDefault={createCustomer}>
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Company/Customer Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                bind:value={newCustomer.name}
                required
              />
            </div>
            
            <div>
              <label for="contactPerson" class="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                id="contactPerson"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                bind:value={newCustomer.contactPerson}
              />
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                bind:value={newCustomer.email}
              />
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                bind:value={newCustomer.phone}
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Primary Address
              </label>
              
              <div class="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  bind:value={newCustomer.primaryAddress.street}
                />
                
                <div class="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    bind:value={newCustomer.primaryAddress.city}
                  />
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="State"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      bind:value={newCustomer.primaryAddress.state}
                    />
                    
                    <input
                      type="text"
                      placeholder="ZIP"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      bind:value={newCustomer.primaryAddress.zip}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                bind:value={newCustomer.notes}
              ></textarea>
            </div>
          </div>
          
          <div class="mt-6 space-y-3">
            <Button type="submit" color="blue" disabled={isCreating || !isFormValid} class_="w-full">
              {isCreating ? 'Creating...' : 'Create Customer'}
            </Button>
            
            <Button color="gray" on:click={() => (showNewCustomerModal = false)} class_="w-full">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if} 