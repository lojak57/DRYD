/**
 * Represents a task in the application
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  
  /** Human-readable label for the task */
  label: string;
  
  /** Description of what the task entails */
  description?: string;
  
  /** Whether the task is required to proceed */
  required: boolean;
  
  /** Roles that can perform this task */
  requiredRoles?: string[];
  
  /** Current status of the task */
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
} 