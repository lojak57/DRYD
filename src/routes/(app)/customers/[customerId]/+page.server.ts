import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Get customer ID from route params
  const { customerId } = params;
  
  // In a real application, this would fetch data from a backend API
  // Currently using client-side loading via stores
  
  return {
    customerId
  };
}; 