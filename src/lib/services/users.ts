import mockUsers from '$lib/mock/users.json';
import type { User } from '$lib/types/User';
import { Role } from '$lib/types/User';

// Import user store (optional) - add if we need to update the store directly
import { users } from '$lib/stores/userStore';

// Simulate API delay (between 100-300ms)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

/**
 * Convert ISO date strings to Date objects
 */
function parseUserDates(user: any): User {
  const parsedUser = { ...user };
  
  if (typeof parsedUser.createdAt === 'string') {
    parsedUser.createdAt = new Date(parsedUser.createdAt);
  }
  
  return parsedUser as User;
}

/**
 * Get all users
 * @returns Promise resolving to an array of User objects
 */
export async function getUsers(): Promise<User[]> {
  await simulateDelay();
  return (mockUsers as any[]).map(user => parseUserDates(user));
}

/**
 * Get a specific user by ID
 * @param id The user ID to look for
 * @returns Promise resolving to a User object or undefined if not found
 */
export async function getUserById(id: string): Promise<User | undefined> {
  await simulateDelay();
  const user = (mockUsers as any[]).find(user => user.id === id);
  return user ? parseUserDates(user) : undefined;
}

/**
 * Get users by role
 * @param role The user role to filter by
 * @returns Promise resolving to an array of matching User objects
 */
export async function getUsersByRole(role: Role): Promise<User[]> {
  await simulateDelay();
  const users = (mockUsers as any[]).filter(user => user.role === role);
  return users.map(user => parseUserDates(user));
}

/**
 * Get active users
 * @returns Promise resolving to an array of active User objects
 */
export async function getActiveUsers(): Promise<User[]> {
  await simulateDelay();
  const users = (mockUsers as any[]).filter(user => user.isActive);
  return users.map(user => parseUserDates(user));
}

/**
 * Get technicians
 * @returns Promise resolving to an array of active technician User objects
 */
export async function getTechnicians(): Promise<User[]> {
  console.log('getTechnicians called!');
  await simulateDelay();
  
  try {
    // Make a local copy of mockUsers to avoid cached stale data
    const currentMockUsers = [...mockUsers];
    console.log('Original mockUsers data:', currentMockUsers.length, 'users in total');
    
    // WORKAROUND: Transform any users with 'TECHNICIAN' role to match enum 'TECH'
    const normalizedUsers = currentMockUsers.map(user => {
      if (user.role === 'TECHNICIAN') {
        console.log(`Normalizing user ${user.firstName} ${user.lastName} from TECHNICIAN to TECH`);
        return { ...user, role: Role.TECH };
      }
      return user;
    });
    
    // Check if there are any technicians in the data
    const allTechs = normalizedUsers.filter(user => 
      user.role === Role.TECH || user.role === 'TECHNICIAN'
    );
    console.log('All technicians in data (before active filter):', allTechs.length);
    console.log('Technician roles present:', allTechs.map(t => t.role));
    
    // Check how many active technicians we have
    const activeTechs = allTechs.filter(user => user.isActive === true);
    console.log('Active technicians in data:', activeTechs.length);
    
    // Final filtering with detailed logging
    const users = normalizedUsers.filter(user => {
      const isTech = user.role === Role.TECH || user.role === 'TECHNICIAN';
      const isActive = user.isActive === true;
      console.log(`User ${user.firstName} ${user.lastName}: role=${user.role}, isTech=${isTech}, isActive=${isActive}`);
      return isTech && isActive;
    });
    
    console.log('Final filtered technicians:', users.length);
    console.log('Technician details:', users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role,
      isActive: u.isActive
    })));
    
    // Convert to User objects with proper date handling
    return users.map(user => parseUserDates(user));
  } catch (error) {
    console.error('Error in getTechnicians:', error);
    throw error;
  }
}

/**
 * Add a new user
 * @param userData User data without ID and created date
 * @returns Promise resolving to the created User object
 */
export async function addUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  await simulateDelay();
  
  // Check if email already exists
  const existingUser = (mockUsers as any[]).find(
    user => user.email.toLowerCase() === userData.email.toLowerCase()
  );
  
  if (existingUser) {
    throw new Error(`User with email ${userData.email} already exists`);
  }
  
  // Generate a unique ID based on role
  const rolePrefix = userData.role === Role.TECH ? 'tech-' : 
                    userData.role === Role.ADMIN ? 'admin-' : 
                    userData.role === Role.OFFICE ? 'office-' : 'user-';
  
  // Find highest existing ID with this prefix
  const existingIds = (mockUsers as any[])
    .filter(user => user.id.startsWith(rolePrefix))
    .map(user => {
      const numPart = user.id.replace(rolePrefix, '');
      return parseInt(numPart, 10);
    })
    .filter(num => !isNaN(num));
  
  const highestId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  const newIdNum = highestId + 1;
  const newId = `${rolePrefix}${String(newIdNum).padStart(2, '0')}`;
  
  // Create the new user object
  const newUser: User = {
    id: newId,
    createdAt: new Date(),
    ...userData
  };
  
  // Add to mock data array
  (mockUsers as any[]).push(newUser);
  
  // Update the store if applicable
  users.update(currentUsers => [...currentUsers, newUser]);
  
  return newUser;
} 