import type { Address } from './Customer';

/**
 * Status options for a quote
 */
export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CONVERTED_TO_JOB = 'CONVERTED_TO_JOB'
}

/**
 * Types of quotes
 */
export enum QuoteType {
  FIXED_PRICE = 'FIXED_PRICE',
  T_AND_E = 'T_AND_E' // Time & Expense
}

/**
 * Structure for scope of work details
 */
export interface ScopeOfWorkData {
  /** Optional brief overview */
  summary?: string;
  /** Extraction, initial steps */
  waterMitigation?: string;
  /** Setup, negative air, etc. */
  containment?: string;
  /** What needs demo/treatment (drywall, carpet, etc.) */
  affectedMaterials?: string;
  /** Equipment setup, monitoring plan */
  dryingProcess?: string;
  /** Specific demo tasks */
  demolition?: string;
  /** Post-demo/drying cleaning */
  cleaningSanitizing?: string;
  /** PUT-BACK / REBUILD SCOPE (Optional for initial quote maybe) */
  reconstruction?: string;
  /** What is NOT included */
  exclusions?: string;
}

/**
 * Represents a line item within a quote
 */
export interface QuoteLineItem {
  /** Unique identifier for the line item within a quote */
  id: string;
  /** Description of the product or service */
  description: string;
  /** Quantity of items or hours */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Calculated as quantity * unitPrice */
  total: number;
  /** Flag indicating if this is an estimate (used for T&E quotes) */
  isEstimate?: boolean;
  /** Optional category for grouping line items */
  category?: string;
  /** Internal cost for profit margin tracking */
  internalCost?: number;
}

/**
 * Represents a quote for restoration services
 */
export interface Quote {
  /** Unique identifier for the quote */
  id: string;
  /** Human-readable reference number */
  quoteNumber: string;
  /** Current status of the quote */
  status: QuoteStatus;
  /** Type of quote (fixed price or time and expense) */
  quoteType: QuoteType;
  /** ID of the customer this quote is for */
  customerId: string;
  /** Address where the work will be performed */
  siteAddress: Address;
  /** Detailed description of the work to be performed */
  scopeOfWork: ScopeOfWorkData | string;
  /** Individual line items making up the quote */
  lineItems: QuoteLineItem[];
  /** Sum of all line item totals */
  subtotal: number;
  /** Optional tax rate (e.g., 0.08 for 8%) */
  taxRate?: number;
  /** Calculated tax amount based on subtotal and tax rate */
  taxAmount?: number;
  /** Final quote amount (subtotal + taxAmount) */
  total: number;
  /** When the quote was created */
  dateCreated: string;
  /** When the quote was sent to the customer */
  dateSent?: string | null;
  /** When the quote expires */
  dateExpires?: string | null;
  /** Additional notes about the quote */
  notes?: string;
  /** ID of the user who prepared the quote */
  preparedByUserId: string;
  /** ID of associated job if quote has been converted */
  associatedJobId?: string | null;
}