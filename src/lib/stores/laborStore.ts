import { writable } from 'svelte/store';
import type { LaborEntry } from '$lib/types/LaborEntry';
import { getLaborEntriesByJobId } from '$lib/services/laborEntries';

// Store for loading state
export const isLoading = writable<boolean>(false);

// Store for error state
export const error = writable<string | null>(null);

// Store for labor entries
export const laborEntries = writable<LaborEntry[]>([]);

/**
 * Load labor entries for a job
 * @param jobId The job ID to load labor entries for
 */
export async function loadLaborEntriesByJobId(jobId: string): Promise<void> {
  if (!jobId) return;
  
  isLoading.set(true);
  error.set(null);
  
  try {
    const entries = await getLaborEntriesByJobId(jobId);
    laborEntries.set(entries);
  } catch (err) {
    console.error('Error loading labor entries:', err);
    error.set('Failed to load labor entries');
  } finally {
    isLoading.set(false);
  }
} 