import type { Customer } from '$lib/types/Customer';
import mockCustomersData from '$lib/mock/customers.json';

// Convert dates in the imported JSON data
const mockCustomers = mockCustomersData.map(customer => ({
  ...customer,
  createdAt: new Date(customer.createdAt)
})) as Customer[];

/**
 * Get all customers
 * @returns Promise resolving to an array of Customer objects
 */
export async function getCustomers(): Promise<Customer[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockCustomers]; // Return a copy to prevent direct mutation
}

/**
 * Get a customer by ID
 * @param id The customer ID to look up
 * @returns Promise resolving to a Customer object or null if not found
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  const customer = mockCustomers.find(c => c.id === id);
  return customer ? { ...customer } : null; // Return a copy to prevent direct mutation
}

/**
 * Search customers by name
 * @param query The search query
 * @returns Promise resolving to an array of matching Customer objects
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  if (!query) return [];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simple search implementation that looks for substring match in name
  const normalizedQuery = query.toLowerCase().trim();
  return mockCustomers
    .filter(customer => 
      customer.name.toLowerCase().includes(normalizedQuery) ||
      (customer.contactPerson && customer.contactPerson.toLowerCase().includes(normalizedQuery)) ||
      customer.email.toLowerCase().includes(normalizedQuery)
    )
    .map(customer => ({ ...customer })); // Return copies to prevent direct mutation
} 