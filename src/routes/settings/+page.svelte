<script lang="ts">
  import { Role } from '$lib/types/User';
  import { currentUser } from '$lib/stores/authStore';
  import PageHeading from '$lib/components/common/PageHeading.svelte';
</script>

<div class="container mx-auto p-4">
  <PageHeading title="Settings" backUrl="/" />
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    <!-- User Management Card - Only visible to admins -->
    {#if $currentUser && $currentUser.role === Role.ADMIN}
      <a href="/settings/users" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">User Management</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Manage users, roles, and permissions</p>
          </div>
        </div>
      </a>
    {/if}
    
    <!-- Profile Settings Card - Visible to all -->
    <a href="/settings/profile" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center">
        <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Profile Settings</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
        </div>
      </div>
    </a>
    
    <!-- Preferences Card - Visible to all -->
    <a href="/settings/preferences" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center">
        <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">App Preferences</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Customize application settings</p>
        </div>
      </div>
    </a>
  </div>
</div> 