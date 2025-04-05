import { loadJobs } from '$lib/stores/jobStore';
import { browser } from '$app/environment';

// Keep track of the refresh interval ID globally to prevent multiple intervals
let globalIntervalId: ReturnType<typeof setInterval> | null = null;

/** @type {import('./$types').PageLoad} */
export async function load() {
  console.log('Dashboard loading at', new Date().toISOString());
  
  // Reload jobs data whenever the dashboard is loaded
  await loadJobs();
  
  // Force a reload of data every 5 minutes when in browser
  // This ensures the data stays fresh even if the user leaves the tab open
  if (browser) {
    console.log('Forcing reload of dashboard data');
    
    // Clear any cached data for this page
    sessionStorage.removeItem('dashboard_data');
    localStorage.removeItem('dashboard_data');
    
    // Clear any existing interval to prevent multiple refreshes
    if (globalIntervalId) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
    
    // Schedule regular data refreshes when page is open
    globalIntervalId = setInterval(async () => {
      console.log('Auto-refreshing job data at', new Date().toISOString());
      await loadJobs();
    }, 300000); // 5 minutes (300000 ms)
    
    // Clean up interval on page navigation
    return {
      destroy() {
        if (globalIntervalId) {
          clearInterval(globalIntervalId);
          globalIntervalId = null;
        }
      }
    };
  }
  
  return {
    // Return an empty object, as we're using stores directly in the component
  };
} 