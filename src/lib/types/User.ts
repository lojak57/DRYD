/**
 * User roles in the system
 */
export enum Role {
  ADMIN = 'ADMIN',
  OFFICE = 'OFFICE',
  TECH = 'TECH',
  CUSTOMER = 'CUSTOMER'
}

/**
 * Represents a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's name */
  name: string;
  /** User's role in the system */
  role: Role;
  /** User's email address */
  email: string;
  /** User's phone number */
  phone?: string;
  /** Whether the user account is active */
  isActive: boolean;
  /** When the user was created */
  createdAt: Date;
  /** When the user was last updated */
  updatedAt: Date;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's phone number */
  phoneNumber?: string;
  /** URL to the user's profile image */
  profileImageUrl?: string | null;
  /** Indicates if this user is a technician */
  isTech?: boolean;
}

/**
 * Returns the user's full name
 */
export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

/**
 * Checks if the user has admin permissions
 */
export function isAdmin(user: User): boolean {
  return user.role === Role.ADMIN;
}

/**
 * Checks if the user has office permissions
 */
export function isOffice(user: User): boolean {
  return user.role === Role.OFFICE || user.role === Role.ADMIN;
}

/**
 * Checks if the user has technician permissions
 */
export function isTech(user: User): boolean {
  return user.role === Role.TECH || isOffice(user);
} 