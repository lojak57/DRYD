/**
 * Represents a payment recorded for an invoice
 */
export interface InvoicePayment {
  date: Date;
  amount: number;
  method: string;
  referenceNumber: string | null;
  notes: string | null;
  timestamp: Date;
} 