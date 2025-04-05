<!-- Layout for authenticated routes -->
<script lang="ts">
    import Nav from '$lib/components/layout/Nav.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
    import { fade } from 'svelte/transition';
    import { page } from '$app/stores';
    import { currentUser, switchUser } from '$lib/stores/authStore';
    import { users, loadUsers } from '$lib/stores/userStore';
    import { goto } from '$app/navigation';
    import { Role } from '$lib/types/User';
    
    // Import the job store functions and stores
    import { jobs, loadJobs } from '$lib/stores/jobStore';
    import AppSidebar from '$lib/components/navigation/AppSidebar.svelte';
    
    let loaded = false;
    let scrollY = 0;
    let innerHeight = 0;
    
    // Images for parallax effect
    const backgroundImages = [
        '/images/construction-site.jpg',
        '/images/restoration-work.jpg',
        '/images/flood-damage.jpg'
    ];
    
    let currentBgIndex = 0;
    
    // Load data when the component mounts
    onMount(async () => {
        if (browser) {
            // Load jobs if not already loaded
            if ($jobs.length === 0) {
                await loadJobs();
            }
            
            // Load users if not already loaded
            if ($users.length === 0) {
                await loadUsers();
            }
            
            // Set a default user if no one is logged in yet
            if (!$currentUser) {
                // Use an office staff user ID from your mock data
                await switchUser('office-01'); // Updated ID
            }
            
            loaded = true;
            
            // Check if user is authenticated
            if (browser && !$currentUser) {
                goto('/login');
            }
        }
    });
    
    // Update background image based on scroll position
    $: {
        if (scrollY && innerHeight) {
            const scrollPercentage = scrollY / (document.body.scrollHeight - innerHeight);
            currentBgIndex = Math.min(
                backgroundImages.length - 1,
                Math.floor(scrollPercentage * backgroundImages.length)
            );
        }
    }
</script>

<svelte:window bind:scrollY bind:innerHeight />

<!-- Notification toasts -->
<ToastContainer />

<div class="app">
    {#if loaded}
        <div 
            class="background-container fixed inset-0 z-[-1] transition-opacity duration-1000"
            style="background-image: url('{backgroundImages[currentBgIndex]}'); 
                   background-size: cover; 
                   background-position: center; 
                   background-attachment: fixed;"
        ></div>
        
        <div class="overlay fixed inset-0 z-[-1] bg-white/75 backdrop-blur-sm"></div>
        
        <div in:fade={{ duration: 500 }} class="flex flex-col h-full">
            {#if $currentUser}
                <Nav />
                <div class="flex flex-1 overflow-hidden">
                    <!-- Sidebar on desktop, hidden on mobile unless toggle is active -->
                    <div class="hidden md:block md:w-64 flex-shrink-0">
                        <AppSidebar />
                    </div>
                    <!-- Main content -->
                    <main class="flex-grow overflow-auto px-4 py-2 relative z-10">
                        <slot />
                    </main>
                </div>
            {:else}
                <main class="flex-grow container mx-auto px-4 py-2 relative z-10">
                    <slot />
                </main>
            {/if}
        </div>
    {/if}
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .background-container {
        transition: opacity 1s ease;
    }
    
    :global(body) {
        background-color: #f7f9fc;
        margin: 0;
        padding: 0;
    }
</style> 