<script lang="ts">
  import { currentUser, switchUser } from '$lib/stores/authStore';
  import { users, isLoadingUsers } from '$lib/stores/userStore';
  import { getFullName } from '$lib/types/User';
  import { Role } from '$lib/types/User';
  import { createEventDispatcher } from 'svelte';
  
  // Create event dispatcher
  const dispatch = createEventDispatcher();
  
  // Track the selected user ID locally to avoid binding issues
  let selectedUserId = $currentUser?.id || '';
  
  // Track whether dropdown is open
  let isDropdownOpen = false;
  
  // Track if user is hovering settings button
  let settingsHover = false;
  
  // Update the local variable when the current user changes
  $: if ($currentUser?.id) {
    selectedUserId = $currentUser.id;
  }
  
  // Get the current user's role icon
  $: roleIcon = getRoleIcon($currentUser?.role as Role | undefined);
  
  // Handle user selection change
  async function handleUserChange(userId: string) {
    if (userId && userId !== $currentUser?.id) {
      await switchUser(userId);
      isDropdownOpen = false;
    }
  }
  
  // Toggle dropdown
  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }
  
  // Clear selection and go back to default view
  function clearUserView() {
    if ($currentUser && $currentUser.role === Role.ADMIN) {
      switchUser('admin-01');
    } else if ($currentUser && $currentUser.role === Role.OFFICE) {
      switchUser('office-01');
    } else {
      switchUser('tech-01');
    }
    settingsHover = false;
    dispatch('clear');
  }
  
  // Get icon based on role
  function getRoleIcon(role: Role | undefined): string {
    switch(role) {
      case Role.ADMIN:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>`;
      case Role.OFFICE:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>`;
      case Role.TECH:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>`;
    }
  }
</script>

<div class="relative">
  <!-- User Switcher Button -->
  <div class="flex gap-2">
    <button 
      type="button" 
      on:click={toggleDropdown}
      class="flex items-center gap-2 btn-light-blue border-2 border-blue-400 text-white px-3 py-2 rounded-md font-medium text-sm transition-colors duration-150"
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
      aria-label="Change user view"
    >
      <!-- Current user role icon -->
      {#if $currentUser}
        <span class="flex items-center justify-center">
          {@html roleIcon}
        </span>
      {/if}
      <span class="whitespace-nowrap">
        {$currentUser ? getFullName($currentUser) : 'Select User'}
      </span>
      <svg class="h-4 w-4 transition-transform duration-150 {isDropdownOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Clear Button -->
    <button 
      type="button"
      on:click={clearUserView}
      on:mouseenter={() => settingsHover = true}
      on:mouseleave={() => settingsHover = false}
      class="bg-dryd-burgundy border-2 border-dryd-burgundy/80 hover:bg-dryd-burgundy/80 text-white p-2 rounded-md transition-colors duration-150 flex items-center justify-center"
      title="Clear User View"
      aria-label="Reset to default user"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <!-- Dropdown Content -->
  {#if isDropdownOpen}
    <div 
      class="absolute z-50 mt-2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 w-72 overflow-hidden"
      role="menu"
    >
      <!-- Loading State -->
      {#if $isLoadingUsers}
        <div class="p-4 flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-500 dark:text-gray-400">Loading users...</span>
        </div>
      {:else}
        <!-- Header -->
        <div class="bg-dryd-gradient text-white p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold">View Application As</h3>
          <p class="text-xs text-white/80">Change your perspective to any user role</p>
        </div>
        
        <!-- User Groups -->
        <div class="p-2 max-h-[600px] overflow-y-auto">
          {#if $users.length > 0}
            <!-- Admin Group -->
            <div class="mb-3">
              <div class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 px-3 pb-1">
                Administrators
              </div>
              <div class="space-y-1">
                {#each $users.filter(user => user.role === Role.ADMIN && user.isActive) as user (user.id)}
                  <button
                    class="w-full text-left px-3 py-2 rounded-md {user.id === $currentUser?.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'} transition-colors duration-150"
                    on:click={() => handleUserChange(user.id)}
                  >
                    <div class="flex items-center">
                      <span class="w-7 h-7 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full mr-2">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                      <div>
                        <div class="font-medium">{getFullName(user)}</div>
                        <div class="text-xs {user.id === $currentUser?.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}">{user.email}</div>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Office Group -->
            <div class="mb-3">
              <div class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 px-3 pb-1">
                Office Staff
              </div>
              <div class="space-y-1">
                {#each $users.filter(user => user.role === Role.OFFICE && user.isActive) as user (user.id)}
                  <button
                    class="w-full text-left px-3 py-2 rounded-md {user.id === $currentUser?.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'} transition-colors duration-150"
                    on:click={() => handleUserChange(user.id)}
                  >
                    <div class="flex items-center">
                      <span class="w-7 h-7 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300 rounded-full mr-2">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                      <div>
                        <div class="font-medium">{getFullName(user)}</div>
                        <div class="text-xs {user.id === $currentUser?.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}">{user.email}</div>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
            
            <!-- Technicians Group -->
            <div>
              <div class="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 px-3 pb-1 sticky top-0 bg-white dark:bg-gray-800">
                Technicians
              </div>
              <div class="space-y-1">
                {#each $users.filter(user => (user.role === Role.TECH || user.role === 'TECHNICIAN') && user.isActive) as user (user.id)}
                  <button
                    class="w-full text-left px-3 py-2 rounded-md {user.id === $currentUser?.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'} transition-colors duration-150"
                    on:click={() => handleUserChange(user.id)}
                  >
                    <div class="flex items-center">
                      <span class="w-7 h-7 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full mr-2">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                      <div>
                        <div class="font-medium">{getFullName(user)}</div>
                        <div class="text-xs {user.id === $currentUser?.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}">{user.email}</div>
                      </div>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {:else}
            <div class="p-4 text-center text-gray-500">
              No users available
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Show tooltip explaining the clear button when hovered -->
{#if settingsHover}
  <div class="absolute mt-1 bg-gray-900 text-white text-xs rounded py-1 px-2 z-50 w-48 pointer-events-none">
    Return to your default user view
  </div>
{/if} 