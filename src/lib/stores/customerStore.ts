import { writable } from 'svelte/store';
import type { Customer } from '$lib/types/Customer';
import mockCustomersData from '$lib/mock/customers.json';

// Convert dates in the imported JSON data
const mockCustomers = mockCustomersData.map(customer => ({
  ...customer,
  createdAt: new Date(customer.createdAt)
})) as Customer[];

// Create stores
export const customers = writable<Customer[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);

// Load customers data
export async function loadCustomers(): Promise<void> {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, this would be an API call
    customers.set(mockCustomers);
  } catch (err) {
    console.error('Error loading customers:', err);
    error.set('Failed to load customers');
  } finally {
    isLoading.set(false);
  }
} 