import { writable } from 'svelte/store';
import type { LogEntry } from '$lib/types/LogEntry';
import { LogEntryType } from '$lib/types/LogEntry';
import initialLogEntries from '$lib/mock/logEntries.json';

// Parse mock data with proper types
const parsedLogEntries: LogEntry[] = (initialLogEntries as any[]).map(entry => ({
  ...entry,
  timestamp: new Date(entry.timestamp),
  // Ensure type is cast to the enum
  type: entry.type as LogEntryType
}));

// Store holding ALL log entries for the session
export const allLogEntries = writable<LogEntry[]>(parsedLogEntries);

// Loading and error states
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null); 