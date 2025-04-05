/**
 * Utility functions for working with dates in the application
 */

/**
 * Format a date to show relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format
 * @returns A string representing the relative time
 */
export function formatDateDistance(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 30) {
    return formatDateTime(date, true);
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays > 1) {
    return `${diffInDays} days ago`;
  } else if (diffInHours === 1) {
    return '1 hour ago';
  } else if (diffInHours > 1) {
    return `${diffInHours} hours ago`;
  } else if (diffInMinutes === 1) {
    return '1 minute ago';
  } else if (diffInMinutes > 1) {
    return `${diffInMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format a date to a readable datetime string
 * @param date - The date to format
 * @param shortFormat - Whether to use short format (omit time)
 * @returns A formatted date string
 */
export function formatDateTime(date: Date, shortFormat = false): string {
  if (!(date instanceof Date)) {
    // Try to convert to Date if it's not already
    date = new Date(date);
  }
  
  // Return short date format if requested
  if (shortFormat) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Return full date and time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a date to MM/DD/YYYY format
 * @param date - The date to format
 * @returns A formatted date string
 */
export function formatDateShort(date: Date): string {
  if (!(date instanceof Date)) {
    // Try to convert to Date if it's not already
    date = new Date(date);
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
} 