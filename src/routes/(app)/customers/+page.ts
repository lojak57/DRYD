import { loadCustomers } from '$lib/stores/customerStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  await loadCustomers();
  
  return {
    pageTitle: 'Customers'
  };
}; 