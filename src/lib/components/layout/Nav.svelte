<!-- Basic Navigation Placeholder -->
<script lang="ts">
  import UserSwitcher from '$lib/components/common/UserSwitcher.svelte';
  import Logo from '$lib/components/common/Logo.svelte';
  import { currentUser, switchUser } from '$lib/stores/authStore';
  import { page } from '$app/stores';
  import { Role } from '$lib/types/User';
  import { getFullName } from '$lib/types/User';
  import mockUsers from '$lib/mock/users.json';
  import { onMount } from 'svelte';
  
  let sidebarOpen = false;
  
  // Track if a link is active based on the current path
  function isActive(path: string): boolean {
    return $page.url.pathname.startsWith(path);
  }
  
  // Prepare users for dropdown
  let availableUsers: any[] = [];
  
  onMount(() => {
    // Group users by role for the dropdown
    availableUsers = (mockUsers as any[])
      .filter(user => user.isActive)
      .sort((a, b) => {
        // Sort by role (ADMIN first, then OFFICE, then TECH)
        const roleOrder: Record<string, number> = { 'ADMIN': 1, 'OFFICE': 2, 'TECH': 3, 'TECHNICIAN': 3, 'CUSTOMER': 4 };
        const roleA = roleOrder[a.role] || 999;
        const roleB = roleOrder[b.role] || 999;
        
        if (roleA !== roleB) return roleA - roleB;
        
        // Then by name
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
  });
  
  // Handle user change
  function handleUserChange(userId: string) {
    switchUser(userId);
  }
</script>

<div class="sticky top-0 z-40 flex-shrink-0 flex h-16 border-b-2 border-dryd-grayblue-dark bg-dryd-gradient shadow-lg">
  <div class="flex-1 px-4 flex justify-between">
    <div class="flex items-center">
      <div class="flex-shrink-0 flex items-center">
        <Logo size="md" linkToDashboard={true} showText={false} />
      </div>
      
      <div class="hidden md:ml-6 md:flex md:items-center md:space-x-2">
        <a href="/dashboard" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/dashboard') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
          Dashboard
        </a>
        
        <a href="/jobs" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/jobs') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
          Jobs
        </a>
        
        {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
          <a href="/schedule" 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/schedule') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
            Schedule
          </a>
        {/if}
        
        <a href="/quotes" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/quotes') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
          Quotes
        </a>
        
        <a href="/customers" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/customers') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
          Customers
        </a>
        
        {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
          <a href="/reports" 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/reports') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
            Reports
          </a>
        {/if}
        
        {#if $currentUser && $currentUser.role === Role.ADMIN}
          <a href="/settings" 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/settings') ? 'bg-white border-white text-dryd-grayblue-dark font-bold' : 'bg-transparent border-transparent text-white hover:bg-white/20 hover:border-white/30'}">
            Settings
          </a>
        {/if}
      </div>
    </div>
    
    <div class="flex items-center">
      <!-- User Switcher (for demo) -->
      <UserSwitcher />
      
      <!-- Mobile menu button -->
      <button 
        type="button" 
        class="md:hidden ml-2 p-2 rounded-md text-white hover:bg-white/20"
        on:click={() => sidebarOpen = !sidebarOpen}
        aria-label="Open main menu"
      >
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</div>

<!-- Mobile menu, show/hide based on menu state -->
{#if sidebarOpen}
  <div class="md:hidden card-glass shadow-lg absolute top-16 left-0 right-0 z-30">
    <div class="pt-4 pb-4 space-y-1 px-2">
      <a href="/dashboard" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/dashboard') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
        Dashboard
      </a>
      
      <a href="/jobs" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/jobs') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
        Jobs
      </a>
      
      {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
        <a href="/schedule" 
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/schedule') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
          Schedule
        </a>
      {/if}
      
      <a href="/quotes" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/quotes') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
        Quotes
      </a>
      
      <a href="/customers" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/customers') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
        Customers
      </a>
      
      {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
        <a href="/reports" 
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/reports') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
          Reports
        </a>
      {/if}
      
      {#if $currentUser && $currentUser.role === Role.ADMIN}
        <a href="/settings" 
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/settings') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100/70'}">
          Settings
        </a>
      {/if}
    </div>
  </div>
{/if}

<!-- Add bottom padding for mobile viewport to prevent content from being hidden by navigation -->
<div class="block md:hidden h-16"></div> 