/**
 * Basic notification utilities for displaying messages
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Simple notify function that uses console and alerts
export function showNotification(type: NotificationType, message: string, duration = 5000) {
  console.log(`[${type.toUpperCase()}]: ${message}`);
  
  // Only use alerts for errors by default
  if (type === 'error') {
    // Simple alert for errors
    alert(`${message}`);
  }
  
  return true;
} 