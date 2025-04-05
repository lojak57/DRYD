import type { LogEntry } from '$lib/types/LogEntry';
import mockLogEntries from '$lib/mock/logEntries.json';
import { allLogEntries } from '$lib/stores/logEntryStore';

// Simulate API delay
const SIMULATED_DELAY_MS = 300;

/**
 * Retrieves all log entries for a specific job
 * @param jobId The ID of the job to get log entries for
 * @returns A promise resolving to an array of log entries
 */
export async function getLogEntriesByJobId(jobId: string): Promise<LogEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Convert timestamps from strings to Date objects and type cast the JSON data
  const entries = (mockLogEntries as any[])
    .filter(entry => entry.jobId === jobId)
    .map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })) as LogEntry[];
  
  // Sort by timestamp, newest first
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Adds a new log entry
 * @param entry The log entry to add
 * @returns A promise resolving to the added log entry with a generated ID
 */
export async function addLogEntry(entry: Omit<LogEntry, 'id' | 'synced'>): Promise<LogEntry> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Generate a unique ID (in a real app, this would be done server-side)
  const newId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create the new entry
  const newEntry: LogEntry = {
    ...entry,
    id: newId,
    synced: false
  };
  
  // In a real app, we would persist this to a database
  // For our prototype, add it to both the mock data and the central store
  (mockLogEntries as any[]).unshift({
    ...newEntry,
    // Convert Date back to ISO string for storage
    timestamp: newEntry.timestamp instanceof Date ? newEntry.timestamp.toISOString() : newEntry.timestamp
  });
  
  // Update the central store with the new entry
  allLogEntries.update(currentEntries => [newEntry, ...currentEntries]);
  
  console.log('New log entry created:', newEntry);
  
  return newEntry;
} 