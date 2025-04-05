<script lang="ts">
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import { addUser } from '$lib/services/users';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import PageHeading from '$lib/components/common/PageHeading.svelte';
  import AddUserForm from '$lib/components/users/AddUserForm.svelte';
  import { currentUser } from '$lib/stores/authStore';

  let loading = false;
  let error = '';

  // Get the return URL from query parameter or default to users list
  const returnUrl = $page.url.searchParams.get('returnUrl') || '/settings/users';

  // Check permissions - only admin can create users
  $: if ($currentUser && $currentUser.role !== Role.ADMIN) {
    goto('/unauthorized');
  }

  async function handleSubmit(event: CustomEvent<Omit<User, 'id' | 'createdAt'>>) {
    loading = true;
    error = '';
    
    try {
      const userData = event.detail;
      await addUser(userData);
      // Toast is removed since svelte-sonner might not be installed
      goto(returnUrl);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create user';
      console.error(error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto p-4 max-w-3xl">
  <PageHeading title="Add New User" backUrl={returnUrl} />
  
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    {#if error}
      <div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded mb-4">
        {error}
      </div>
    {/if}
    
    <AddUserForm
      isLoading={loading}
      allowedRoles={[Role.TECH, Role.OFFICE, Role.ADMIN]}
      on:submit={handleSubmit}
    />
  </div>
</div> 