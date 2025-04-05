import type { Address } from './Customer';
import type { InvoicePayment } from './Invoice';

/**
 * Represents the current status of a job
 */
export enum JobStatus {
  NEW = 'NEW',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  PENDING_COMPLETION = 'PENDING_COMPLETION',
  COMPLETED = 'COMPLETED',
  INVOICE_APPROVAL = 'INVOICE_APPROVAL',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

/**
 * Represents the type of damage/restoration
 */
export enum JobType {
  WATER = 'WATER',
  FIRE = 'FIRE',
  MOLD = 'MOLD',
  SMOKE = 'SMOKE',
  STORM = 'STORM',
  OTHER = 'OTHER'
}

/**
 * Represents insurance information for a job
 */
export interface InsuranceInfo {
  /** Name of the insurance company */
  company: string;
  /** Insurance policy number */
  policyNumber: string;
  /** Insurance claim number */
  claimNumber: string;
  /** Insurance adjustor's name */
  adjustorName?: string;
  /** Insurance adjustor's phone number */
  adjustorPhone?: string;
  /** Insurance adjustor's email */
  adjustorEmail?: string;
  /** Whether the job is an insurance claim */
  isInsuranceClaim: boolean;
  /** Deductible amount in dollars */
  deductible?: number;
}

/**
 * Represents the completion tasks that must be done before a job can be marked as complete
 */
export interface CompletionTasks {
  /** Flag indicating that final moisture readings have been logged */
  finalReadingsLogged: boolean;
  /** Flag indicating that after photos have been taken */
  afterPhotosTaken: boolean;
  /** Flag indicating that the job has been submitted for office review */
  mark_ready_for_review: boolean;
}

/**
 * Represents a job in the system
 */
export interface Job {
  /** Unique identifier for the job */
  id: string;
  /** Job number (format: J-XXXX) */
  jobNumber: string;
  /** Title or name of the job */
  title: string;
  /** Current status of the job */
  status: JobStatus;
  /** Type of damage/restoration */
  type: JobType;
  /** Detailed description of the job */
  description: string;
  /** ID of the customer associated with this job */
  customerId: string;
  /** Physical address where the job is located */
  location: Address;
  /** IDs of technicians assigned to the job */
  assignedUserIds: string[];
  /** Date when the job was created */
  createdAt: Date;
  /** Date when the job is scheduled to start */
  scheduledStartDate?: Date | null;
  /** Estimated date of job completion */
  estimatedCompletionDate?: Date | null;
  /** Date when the job was completed */
  completedDate?: Date | null;
  /** IDs of equipment used for the job */
  equipmentIds: string[];
  /** Priority level of the job (1-5, where 5 is highest) */
  priority: number;
  /** Total estimated cost of the job */
  estimatedCost?: number;
  /** Special access instructions for the site */
  accessInstructions?: string;
  /** Tags for categorizing the job */
  tags?: string[];
  /** ID of the quote this job was created from */
  originatingQuoteId?: string | null;
  /** ID of the office user or admin who owns the account */
  accountOwnerId?: string;
  /** Optional tasks that must be completed before job can be marked complete */
  completionTasks?: CompletionTasks;
  /** Flag indicating that "before" photos have been taken for the job */
  hasBeforePhotos?: boolean;
  /** Final labor cost for the job */
  laborCost?: number;
  /** Final materials cost for the job */
  materialsCost?: number;
  /** Final equipment cost for the job */
  equipmentCost?: number;
  /** Final line items for the job */
  lineItems?: CustomLineItem[];
  /** Final notes added during job finalization */
  finalNotes?: string;
  /** Invoice number for the job */
  invoiceNumber?: string;
  /** Date the invoice was created */
  invoiceDate?: Date;
  /** Due date for the invoice */
  invoiceDueDate?: Date;
  /** Total amount for the invoice (calculated from costs) */
  total?: number;
  /** Payment information if the invoice has been paid */
  payment?: InvoicePayment;
  /** Enhanced payment details with additional metadata */
  paymentDetails?: {
    amount: number;
    date: string; // Keep as ISO string from date input
    method: string;
    notes?: string;
    recordedAt: string; // Add timestamp when payment was recorded
    recordedBy: string; // Add userId who recorded it
  };
}

/** Represents a custom line item for a job invoice */
export interface CustomLineItem {
  /** Unique identifier for the line item */
  id: string;
  /** Description of the line item */
  description: string;
  /** Quantity of the item */
  quantity: number;
  /** Unit price of the item */
  unitPrice: number;
  /** Internal cost of the item (for margin tracking) */
  internalCost?: number;
  /** Total price of the line item (quantity * unitPrice) */
  total: number;
  /** Category of the line item (e.g., LABOR, MATERIALS, EQUIPMENT) */
  category: string;
} 