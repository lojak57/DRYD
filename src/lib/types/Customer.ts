/**
 * Represents a physical address
 */
export interface Address {
  /** Street address including house/building number */
  street: string;
  /** City name */
  city: string;
  /** State or province */
  state: string;
  /** ZIP or postal code */
  zip: string;
}

/**
 * Represents a customer in the system
 */
export interface Customer {
  /** Unique identifier for the customer */
  id: string;
  /** Customer name (individual or business) */
  name: string;
  /** Primary contact person */
  contactPerson?: string;
  /** Primary email address */
  email: string;
  /** Primary phone number */
  phone: string;
  /** Primary physical address of the customer */
  primaryAddress: Address;
  /** Billing address if different from primary */
  billingAddress?: Address;
  /** Physical address of the customer (legacy field) */
  address?: Address;
  /** Customer notes */
  notes?: string;
  /** When the customer was created */
  createdAt: Date;
  /** Whether the customer is active */
  isActive?: boolean;
} 