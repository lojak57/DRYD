<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { customers, loadCustomers, isLoading } from '$lib/stores/customerStore';
  import type { Customer } from '$lib/types/Customer';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import SearchInput from '$lib/components/ui/SearchInput.svelte';
  import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
  
  // Local state
  let searchQuery = '';
  let filteredCustomers: Customer[] = [];
  let sortField = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let showAddCustomerModal = false;
  
  // New customer form
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
  
  // Form validation errors
  let formErrors: Record<string, string> = {};
  
  // Filter customers based on search query
  $: {
    if (searchQuery.trim() === '') {
      filteredCustomers = [...$customers];
    } else {
      const query = searchQuery.toLowerCase();
      filteredCustomers = $customers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        (customer.contactPerson && customer.contactPerson.toLowerCase().includes(query)) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.primaryAddress.street.toLowerCase().includes(query) ||
        customer.primaryAddress.city.toLowerCase().includes(query) ||
        customer.primaryAddress.state.toLowerCase().includes(query) ||
        customer.primaryAddress.zip.includes(query) ||
        (customer.notes && customer.notes.toLowerCase().includes(query))
      );
    }
    
    // Sort customers
    sortCustomers();
  }
  
  // Handle sort
  function sortCustomers() {
    filteredCustomers.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Extract the values to compare based on sort field
      switch (sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'contactPerson':
          valueA = a.contactPerson || '';
          valueB = b.contactPerson || '';
          break;
        case 'email':
          valueA = a.email;
          valueB = b.email;
          break;
        case 'phone':
          valueA = a.phone;
          valueB = b.phone;
          break;
        case 'address':
          valueA = `${a.primaryAddress.city}, ${a.primaryAddress.state}`;
          valueB = `${b.primaryAddress.city}, ${b.primaryAddress.state}`;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      // Compare the values
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Change sort
  function changeSort(field: string) {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and reset direction to ascending
      sortField = field;
      sortDirection = 'asc';
    }
    
    sortCustomers();
  }
  
  // Navigate to customer detail page
  function viewCustomer(id: string) {
    goto(`/customers/${id}`);
  }
  
  // Toggle add customer modal
  function toggleAddCustomerModal() {
    showAddCustomerModal = !showAddCustomerModal;
    if (!showAddCustomerModal) {
      // Reset form when closing
      resetForm();
    }
  }
  
  // Reset form
  function resetForm() {
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
    formErrors = {};
  }
  
  // Validate form
  function validateForm(): boolean {
    formErrors = {};
    let isValid = true;
    
    if (!newCustomer.name.trim()) {
      formErrors.name = 'Customer name is required';
      isValid = false;
    }
    
    if (!newCustomer.email.trim()) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newCustomer.email)) {
      formErrors.email = 'Invalid email format';
      isValid = false;
    }
    
    if (!newCustomer.phone.trim()) {
      formErrors.phone = 'Phone number is required';
      isValid = false;
    }
    
    if (!newCustomer.primaryAddress.street.trim()) {
      formErrors.street = 'Street address is required';
      isValid = false;
    }
    
    if (!newCustomer.primaryAddress.city.trim()) {
      formErrors.city = 'City is required';
      isValid = false;
    }
    
    if (!newCustomer.primaryAddress.state.trim()) {
      formErrors.state = 'State is required';
      isValid = false;
    }
    
    if (!newCustomer.primaryAddress.zip.trim()) {
      formErrors.zip = 'ZIP code is required';
      isValid = false;
    }
    
    return isValid;
  }
  
  // Create customer
  async function createCustomer() {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Simulate API call to create customer
      // In a real app, this would call a backend API
      const newId = `customer-${Date.now()}`;
      const customer: Customer = {
        id: newId,
        ...newCustomer,
        isActive: true,
        createdAt: new Date()
      };
      
      // Add to store
      $customers = [...$customers, customer];
      
      // Close modal
      toggleAddCustomerModal();
      
      // Navigate to new customer
      viewCustomer(newId);
    } catch (error) {
      console.error('Error creating customer:', error);
      // Handle error (in a real app, this would show an error toast)
    }
  }
  
  // Load customers on mount
  onMount(() => {
    if ($customers.length === 0) {
      loadCustomers();
    }
  });
</script>

<PageHeader title="Customers" subtitle="Manage customer information">
  <div slot="actions">
    <Button color="primary" on:click={toggleAddCustomerModal}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      Add Customer
    </Button>
  </div>
</PageHeader>

<Card className="mb-6">
  <div class="p-4">
    <SearchInput
      bind:value={searchQuery}
      placeholder="Search customers by name, contact, email, phone or address..."
    />
  </div>
  
  {#if $isLoading}
    <div class="flex justify-center py-8">
      <LoadingSpinner size="lg" color="blue" />
    </div>
  {:else if $customers.length === 0}
    <EmptyState
      message="No customers found"
      icon="users"
      showAction={true}
    >
      <Button slot="action" on:click={toggleAddCustomerModal}>
        Add Your First Customer
      </Button>
    </EmptyState>
  {:else if filteredCustomers.length === 0}
    <EmptyState
      message="No matching customers"
      icon="search"
      showAction={true}
    >
      <Button slot="action" on:click={() => searchQuery = ''}>
        Clear Search
      </Button>
    </EmptyState>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              on:click={() => changeSort('name')}
            >
              <div class="flex items-center">
                <span>Customer</span>
                {#if sortField === 'name'}
                  <svg 
                    class="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    {#if sortDirection === 'asc'}
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                {/if}
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              on:click={() => changeSort('contactPerson')}
            >
              <div class="flex items-center">
                <span>Contact Person</span>
                {#if sortField === 'contactPerson'}
                  <svg 
                    class="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    {#if sortDirection === 'asc'}
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                {/if}
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              on:click={() => changeSort('email')}
            >
              <div class="flex items-center">
                <span>Email</span>
                {#if sortField === 'email'}
                  <svg 
                    class="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    {#if sortDirection === 'asc'}
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                {/if}
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              on:click={() => changeSort('phone')}
            >
              <div class="flex items-center">
                <span>Phone</span>
                {#if sortField === 'phone'}
                  <svg 
                    class="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    {#if sortDirection === 'asc'}
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                {/if}
              </div>
            </th>
            <th 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              on:click={() => changeSort('address')}
            >
              <div class="flex items-center">
                <span>Address</span>
                {#if sortField === 'address'}
                  <svg 
                    class="ml-1 h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    {#if sortDirection === 'asc'}
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                {/if}
              </div>
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredCustomers as customer}
            <tr class="hover:bg-gray-50 cursor-pointer" on:click={() => viewCustomer(customer.id)}>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-dryd-blue rounded-full flex items-center justify-center text-white font-medium">
                    {customer.name.charAt(0)}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{customer.name}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.contactPerson || '-'}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 truncate max-w-[200px]">
                  <a href="mailto:{customer.email}" class="text-dryd-blue hover:underline" on:click|stopPropagation>
                    {customer.email}
                  </a>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  <a href="tel:{customer.phone}" class="text-dryd-blue hover:underline" on:click|stopPropagation>
                    {customer.phone}
                  </a>
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="text-sm truncate max-w-[200px]">
                  {customer.primaryAddress.city}, {customer.primaryAddress.state} {customer.primaryAddress.zip}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div on:click|stopPropagation>
                  <Button color="primary" on:click={() => viewCustomer(customer.id)}>
                    View
                  </Button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</Card>

<!-- Add Customer Modal -->
{#if showAddCustomerModal}
  <div class="fixed inset-0 overflow-y-auto z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={toggleAddCustomerModal}></div>
      
      <div class="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-2xl z-10">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-900">Add New Customer</h2>
          <button type="button" class="text-gray-400 hover:text-gray-500" on:click={toggleAddCustomerModal}>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form class="p-6" on:submit|preventDefault={createCustomer}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Customer Name -->
            <div class="col-span-2">
              <label for="name" class="block text-sm font-medium text-gray-700">Customer Name *</label>
              <input 
                type="text" 
                id="name" 
                bind:value={newCustomer.name}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.name ? 'border-red-500' : ''}"
              />
              {#if formErrors.name}
                <p class="mt-1 text-sm text-red-600">{formErrors.name}</p>
              {/if}
            </div>
            
            <!-- Contact Person -->
            <div>
              <label for="contactPerson" class="block text-sm font-medium text-gray-700">Contact Person</label>
              <input 
                type="text" 
                id="contactPerson" 
                bind:value={newCustomer.contactPerson}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue"
              />
            </div>
            
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
              <input 
                type="email" 
                id="email" 
                bind:value={newCustomer.email}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.email ? 'border-red-500' : ''}"
              />
              {#if formErrors.email}
                <p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
              {/if}
            </div>
            
            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone *</label>
              <input 
                type="tel" 
                id="phone" 
                bind:value={newCustomer.phone}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.phone ? 'border-red-500' : ''}"
              />
              {#if formErrors.phone}
                <p class="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              {/if}
            </div>
            
            <!-- Address Section -->
            <div class="col-span-2">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Primary Address</h3>
              
              <!-- Street -->
              <div class="mb-4">
                <label for="street" class="block text-sm font-medium text-gray-700">Street *</label>
                <input 
                  type="text" 
                  id="street" 
                  bind:value={newCustomer.primaryAddress.street}
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.street ? 'border-red-500' : ''}"
                />
                {#if formErrors.street}
                  <p class="mt-1 text-sm text-red-600">{formErrors.street}</p>
                {/if}
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- City -->
                <div>
                  <label for="city" class="block text-sm font-medium text-gray-700">City *</label>
                  <input 
                    type="text" 
                    id="city" 
                    bind:value={newCustomer.primaryAddress.city}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.city ? 'border-red-500' : ''}"
                  />
                  {#if formErrors.city}
                    <p class="mt-1 text-sm text-red-600">{formErrors.city}</p>
                  {/if}
                </div>
                
                <!-- State -->
                <div>
                  <label for="state" class="block text-sm font-medium text-gray-700">State *</label>
                  <input 
                    type="text" 
                    id="state" 
                    bind:value={newCustomer.primaryAddress.state}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.state ? 'border-red-500' : ''}"
                  />
                  {#if formErrors.state}
                    <p class="mt-1 text-sm text-red-600">{formErrors.state}</p>
                  {/if}
                </div>
              </div>
              
              <!-- ZIP -->
              <div>
                <label for="zip" class="block text-sm font-medium text-gray-700">ZIP Code *</label>
                <input 
                  type="text" 
                  id="zip" 
                  bind:value={newCustomer.primaryAddress.zip}
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue {formErrors.zip ? 'border-red-500' : ''}"
                />
                {#if formErrors.zip}
                  <p class="mt-1 text-sm text-red-600">{formErrors.zip}</p>
                {/if}
              </div>
            </div>
            
            <!-- Notes -->
            <div class="col-span-2">
              <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
              <textarea 
                id="notes" 
                rows="3" 
                bind:value={newCustomer.notes}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dryd-blue focus:ring-dryd-blue"
              ></textarea>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <Button type="button" color="secondary" on:click={toggleAddCustomerModal}>
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if} 