<script lang="ts">
  import { switchUser, currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';

  // Match these IDs with actual IDs from your mock/users.json
  const techUserId = 'u002'; // Taylor Smith (TECH role)
  const officeUserId = 'u005'; // Morgan Williams (OFFICE role)
  const adminUserId = 'u001'; // Alex Rodriguez (ADMIN role)

  // Helper to get button styles based on current user
  function getButtonClass(role: Role): string {
    let base = 'px-4 py-2 text-sm rounded-md shadow-md font-bold transition-all duration-200 ease-in-out border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[.98] ';
    if ($currentUser?.role === role) {
      return base + 'bg-dryd-burgundy text-white border-dryd-burgundy focus:ring-dryd-burgundy';
    } else {
      return base + 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100 focus:ring-gray-400';
    }
  }
</script>

<div class="flex items-center space-x-2 bg-gray-800 p-3 rounded-md shadow-lg border border-gray-700">
  <span class="text-sm font-bold mr-2 text-white">View as:</span>
  <button
    class={getButtonClass(Role.TECH)}
    on:click={() => switchUser(techUserId)}
  >
    Tech
  </button>
  <button
    class={getButtonClass(Role.OFFICE)}
    on:click={() => switchUser(officeUserId)}
  >
    Office
  </button>
  <button
    class={getButtonClass(Role.ADMIN)}
    on:click={() => switchUser(adminUserId)}
  >
    Admin
  </button>
</div> 