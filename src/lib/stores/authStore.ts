import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types/User';
import mockUsers from '$lib/mock/users.json';
import { goto } from '$app/navigation';

// Authentication state stores
export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, $user => !!$user);
export const isLoading = writable(false);
export const error = writable<string | null>(null);

/**
 * Switch to a different user by their ID
 * @param userId The ID of the user to switch to
 */
export async function switchUser(userId: string): Promise<void> {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Find the user in the mock data
    const user = (mockUsers as any[]).find(user => user.id === userId);
    
    if (user) {
      // Parse dates from string to Date objects
      if (typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
      }
      
      // Set the user directly
      currentUser.set(user as User);
      
      // Redirect to dashboard after successful user switch
      await goto('/dashboard');
    } else {
      console.error(`User with ID ${userId} not found`);
      error.set(`User with ID ${userId} not found`);
    }
  } catch (err) {
    console.error('Error switching user:', err);
    error.set(err instanceof Error ? err.message : 'An error occurred switching user');
  } finally {
    isLoading.set(false);
  }
} 