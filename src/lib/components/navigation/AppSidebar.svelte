<script lang="ts">
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import SidebarItem from './SidebarItem.svelte';
  import SidebarSubItem from './SidebarSubItem.svelte';
  
  // Track if sidebar is open on mobile
  export let isOpen = false;
  
  // Check user role for conditional navigation
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  $: isOffice = $currentUser?.role === Role.OFFICE || isAdmin;
</script>

<aside class="bg-white shadow-lg rounded-lg p-4 w-full">
  <div class="space-y-1">
    <!-- Dashboard -->
    <SidebarItem href="/dashboard" icon="DashboardIcon" label="Dashboard" />
    
    <!-- Jobs -->
    <SidebarItem href="/jobs" icon="BriefcaseIcon" label="Jobs" />
    
    <!-- Schedule - only for admin and office -->
    {#if isOffice}
      <SidebarItem href="/schedule" icon="CalendarIcon" label="Schedule" />
    {/if}
    
    <!-- Quotes -->
    <SidebarItem href="/quotes" icon="DocumentIcon" label="Quotes" />
    
    <!-- Customers -->
    <SidebarItem href="/customers" icon="UsersIcon" label="Customers" />
    
    <!-- Reports - only for admin and office -->
    {#if isOffice}
      <SidebarItem href="/reports" icon="ChartBarIcon" label="Reports">
        <SidebarSubItem href="/reports/overview" label="Overview" />
        <SidebarSubItem href="/reports/financial" label="Financial" />
      </SidebarItem>
    {/if}
    
    <!-- Settings - admin only -->
    {#if isAdmin}
      <SidebarItem href="/settings" icon="CogIcon" label="Settings" />
    {/if}
  </div>
</aside> 