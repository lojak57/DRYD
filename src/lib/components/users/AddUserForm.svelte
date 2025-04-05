<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  
  // Props
  export let isLoading: boolean = false;
  export let allowedRoles: Role[] = [Role.TECH];
  export let error: string = '';
  
  // Define the dispatcher for form submission
  const dispatch = createEventDispatcher<{
    submit: Omit<User, 'id' | 'createdAt'>;
  }>();
  
  // Form state
  let firstName: string = '';
  let lastName: string = '';
  let email: string = '';
  let phoneNumber: string = '';
  let role: Role = Role.TECH;
  
  // Form validation errors
  let validationErrors: Record<string, string> = {};
  
  // Submit form handler
  function handleSubmit() {
    // Reset validation errors
    validationErrors = {};
    
    // Validate required fields
    if (!firstName) validationErrors.firstName = 'First name is required';
    if (!lastName) validationErrors.lastName = 'Last name is required';
    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    // Check if we have any validation errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    // Create user data object
    const userData: Omit<User, 'id' | 'createdAt'> = {
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      isActive: true
    };
    
    // Dispatch the submit event with the user data
    dispatch('submit', userData);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- First Name and Last Name - Side by Side -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- First Name Field -->
    <div>
      <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        First Name*
      </label>
      <input
        type="text"
        id="firstName"
        bind:value={firstName}
        disabled={isLoading}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
      />
      {#if validationErrors.firstName}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
      {/if}
    </div>
    
    <!-- Last Name Field -->
    <div>
      <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Last Name*
      </label>
      <input
        type="text"
        id="lastName"
        bind:value={lastName}
        disabled={isLoading}
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
      />
      {#if validationErrors.lastName}
        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
      {/if}
    </div>
  </div>
  
  <!-- Email Field -->
  <div>
    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Email*
    </label>
    <input
      type="email"
      id="email"
      bind:value={email}
      disabled={isLoading}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
    />
    {#if validationErrors.email}
      <p class="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
    {/if}
  </div>
  
  <!-- Phone Number Field -->
  <div>
    <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Phone Number
    </label>
    <input
      type="tel"
      id="phoneNumber"
      bind:value={phoneNumber}
      disabled={isLoading}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
    />
  </div>
  
  <!-- Role Selector -->
  <div>
    <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Role*
    </label>
    <select
      id="role"
      bind:value={role}
      disabled={isLoading}
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
    >
      {#each allowedRoles as allowedRole}
        <option value={allowedRole}>
          {allowedRole === Role.TECH 
            ? 'Technician' 
            : allowedRole === Role.OFFICE 
              ? 'Office Staff' 
              : allowedRole === Role.ADMIN 
                ? 'Administrator' 
                : allowedRole}
        </option>
      {/each}
    </select>
  </div>
  
  <!-- Form Error Display -->
  {#if error}
    <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded">
      {error}
    </div>
  {/if}
  
  <!-- Submit Button -->
  <div>
    <button
      type="submit"
      disabled={isLoading}
      class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isLoading}
        <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2 align-[-0.125em]"></div>
        Saving...
      {:else}
        Add User
      {/if}
    </button>
  </div>
</form> 