import { writable } from 'svelte/store';
import type { User } from '$lib/types/User';
import { Role } from '$lib/types/User';
import { getUsers, getUserById, getTechnicians } from '$lib/services/users';

// Mock current user (for demo purposes)
const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  role: Role.ADMIN,
  phoneNumber: '555-123-4567',
  profileImageUrl: null,
  createdAt: new Date(),
  isActive: true
};

// Create a writable store for the current user
export const userStore = writable<User | null>(mockUser);

// Create a writable store for all users
export const users = writable<User[]>([]);
export const isLoadingUsers = writable<boolean>(false);

/**
 * Load all users into the users store
 */
export async function loadUsers(): Promise<void> {
  isLoadingUsers.set(true);
  try {
    const allUsers = await getUsers();
    users.set(allUsers);
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    isLoadingUsers.set(false);
  }
}

/**
 * Get only technicians
 */
export async function loadTechnicians(): Promise<User[]> {
  isLoadingUsers.set(true);
  try {
    const technicians = await getTechnicians();
    return technicians;
  } catch (error) {
    console.error('Error loading technicians:', error);
    return [];
  } finally {
    isLoadingUsers.set(false);
  }
}

// Get current user from API/auth service
export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would fetch from an API or auth service
  return mockUser;
}

// Set the current user in the store
export function setCurrentUser(user: User | null) {
  userStore.set(user);
} 