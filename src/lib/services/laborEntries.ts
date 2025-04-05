import type { LaborEntry } from '$lib/types/LaborEntry';
import mockLaborEntries from '$lib/mock/laborEntries.json';

// Cast the imported JSON to the correct type
const laborEntries: LaborEntry[] = mockLaborEntries as LaborEntry[];

/**
 * Add labor entries for a job
 * @param entriesData Array of labor entry data without id and dateSubmitted
 * @returns Promise resolving to the created labor entries
 */
export async function addLaborEntries(
  entriesData: Omit<LaborEntry, 'id' | 'dateSubmitted'>[]
): Promise<LaborEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const createdEntries: LaborEntry[] = [];
  
  // Only process entries with hours > 0
  const validEntries = entriesData.filter(entry => entry.hours > 0);
  
  validEntries.forEach((entry, index) => {
    const newEntry: LaborEntry = {
      ...entry,
      id: `labor-${Date.now()}-${index}`,
      dateSubmitted: new Date().toISOString()
    };
    
    // Add to mock data
    laborEntries.push(newEntry);
    
    // Add to return array
    createdEntries.push(newEntry);
  });
  
  return createdEntries;
}

/**
 * Get labor entries for a specific job
 * @param jobId The job ID to filter by
 * @returns Promise resolving to an array of labor entries
 */
export async function getLaborEntriesByJobId(jobId: string): Promise<LaborEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter entries by jobId
  const entries = laborEntries.filter(entry => entry.jobId === jobId);
  
  // Return a deep copy to avoid unintended mutations
  return JSON.parse(JSON.stringify(entries));
}

/**
 * Get total labor hours for a job
 * @param jobId The job ID
 * @returns Promise resolving to the total hours
 */
export async function getTotalLaborHoursByJobId(jobId: string): Promise<number> {
  const entries = await getLaborEntriesByJobId(jobId);
  
  // Sum up all hours
  return entries.reduce((total, entry) => total + entry.hours, 0);
} 