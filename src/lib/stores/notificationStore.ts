import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,
    
    /**
     * Add a notification to the store
     */
    addNotification: (notification: Omit<Notification, 'id'>) => {
      const id = crypto.randomUUID();
      const newNotification = { 
        id, 
        ...notification,
        // Default duration of 5000ms if not specified
        duration: notification.duration || 5000
      };
      
      update(notifications => [...notifications, newNotification]);
      
      // Auto-remove after duration
      if (newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
      
      return id;
    },
    
    /**
     * Remove a notification from the store
     */
    removeNotification: (id: string) => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    
    /**
     * Clear all notifications
     */
    clearNotifications: () => {
      update(() => []);
    }
  };
}

export const notificationStore = createNotificationStore();
export const { addNotification, removeNotification, clearNotifications } = notificationStore;

// Helper functions for common notification types
export function addSuccessNotification(message: string, duration = 5000) {
  return addNotification({ type: 'success', message, duration });
}

export function addErrorNotification(message: string, duration = 7000) {
  return addNotification({ type: 'error', message, duration });
}

export function addInfoNotification(message: string, duration = 5000) {
  return addNotification({ type: 'info', message, duration });
}

export function addWarningNotification(message: string, duration = 6000) {
  return addNotification({ type: 'warning', message, duration });
} 