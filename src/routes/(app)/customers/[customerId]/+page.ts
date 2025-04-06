import { loadCustomers } from '$lib/stores/customerStore';
import { loadJobs } from '$lib/stores/jobStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // Load all data in parallel
  await Promise.all([
    loadCustomers(),
    loadJobs()
  ]);
  
  return {
    customerId: params.customerId,
    pageTitle: 'Customer Details'
  };
}; 