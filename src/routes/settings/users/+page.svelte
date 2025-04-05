<script lang="ts">
  import { onMount } from 'svelte';
  import { getUsers } from '$lib/services/users';
  import type { User } from '$lib/types/User';
  import { Role } from '$lib/types/User';
  import PageHeading from '$lib/components/common/PageHeading.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';

  let users: User[] = [];
  let loading = true;
  let error = '';

  // Check permissions - only admin can view user management
  $: if ($currentUser && $currentUser.role !== Role.ADMIN) {
    goto('/unauthorized');
  }

  onMount(async () => {
    try {
      users = await getUsers();
    } catch (err) {
      error = 'Failed to load users';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  // Format role for display
  function formatRole(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Administrator';
      case Role.OFFICE:
        return 'Office Staff';
      case Role.TECH:
        return 'Technician';
      default:
        return role;
    }
  }

  function navigateToAddUser() {
    goto('/settings/users/add');
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <PageHeading title="User Management" backUrl="/settings" />
    
    <button 
      on:click={navigateToAddUser}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      Add User
    </button>
  </div>

  {#if loading}
    <div class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded mb-4">
      {error}
    </div>
  {:else}
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {#each users as user}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {user.role === Role.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 
                   user.role === Role.TECH ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 
                   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}">
                  {formatRole(user.role)}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 
                   'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>