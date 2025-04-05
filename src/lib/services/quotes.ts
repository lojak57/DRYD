import { error } from '@sveltejs/kit';
import type { Quote } from '$lib/types/Quote';
import { getCustomerById } from './customers';
import mockQuotes from '$lib/mock/quotes.json';

// In-memory store for quotes during development
let quotes: Quote[] = [...mockQuotes];

/**
 * Get all quotes
 */
export async function getQuotes(): Promise<Quote[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...quotes];
  } catch (err) {
    console.error('Error fetching quotes:', err);
    throw error(500, 'Failed to fetch quotes');
  }
}

/**
 * Get quote by ID
 */
export async function getQuoteById(id: string): Promise<Quote | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const quote = quotes.find(q => q.id === id);
    return quote || null;
  } catch (err) {
    console.error(`Error fetching quote ${id}:`, err);
    throw error(500, 'Failed to fetch quote');
  }
}

/**
 * Get quotes by customer ID
 */
export async function getQuotesByCustomer(customerId: string): Promise<Quote[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return quotes.filter(q => q.customerId === customerId);
  } catch (err) {
    console.error(`Error fetching quotes for customer ${customerId}:`, err);
    throw error(500, 'Failed to fetch customer quotes');
  }
}

/**
 * Create a new quote
 */
export async function createQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'dateCreated'>): Promise<Quote> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if the customer exists
    const customer = await getCustomerById(quoteData.customerId);
    if (!customer) {
      throw error(400, 'Invalid customer ID');
    }
    
    // Create a new quote ID
    const newId = `q${String(quotes.length + 1).padStart(3, '0')}`;
    
    // Generate quote number (format: Q-YYYY-MM-XXXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = String(quotes.length + 1).padStart(4, '0');
    const quoteNumber = `Q-${year}-${month}-${count}`;
    
    // Create the new quote
    const newQuote: Quote = {
      id: newId,
      quoteNumber,
      dateCreated: new Date().toISOString(),
      ...quoteData
    };
    
    // Add to quotes array
    quotes = [...quotes, newQuote];
    
    return newQuote;
  } catch (err) {
    console.error('Error creating quote:', err);
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Failed to create quote');
  }
}

/**
 * Update an existing quote
 */
export async function updateQuote(id: string, quoteData: Partial<Quote>): Promise<Quote> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    
    if (quoteIndex === -1) {
      throw error(404, 'Quote not found');
    }
    
    // Update quote
    const updatedQuote = {
      ...quotes[quoteIndex],
      ...quoteData
    };
    
    // Replace in array
    quotes = [
      ...quotes.slice(0, quoteIndex),
      updatedQuote,
      ...quotes.slice(quoteIndex + 1)
    ];
    
    return updatedQuote;
  } catch (err) {
    console.error(`Error updating quote ${id}:`, err);
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Failed to update quote');
  }
}

/**
 * Delete a quote by ID
 */
export async function deleteQuote(id: string): Promise<void> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const quoteIndex = quotes.findIndex(q => q.id === id);
    
    if (quoteIndex === -1) {
      throw error(404, 'Quote not found');
    }
    
    // Remove from array
    quotes = [
      ...quotes.slice(0, quoteIndex),
      ...quotes.slice(quoteIndex + 1)
    ];
    
  } catch (err) {
    console.error(`Error deleting quote ${id}:`, err);
    throw error(500, 'Failed to delete quote');
  }
}

/**
 * Convert a quote to a job
 */
export async function convertQuoteToJob(quoteId: string, jobId: string): Promise<Quote> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) {
      throw error(404, 'Quote not found');
    }
    
    // Update quote status and associate with job
    const updatedQuote = {
      ...quotes[quoteIndex],
      status: 'CONVERTED_TO_JOB',
      associatedJobId: jobId
    };
    
    // Replace in array
    quotes = [
      ...quotes.slice(0, quoteIndex),
      updatedQuote,
      ...quotes.slice(quoteIndex + 1)
    ];
    
    return updatedQuote;
  } catch (err) {
    console.error(`Error converting quote ${quoteId} to job:`, err);
    throw error(500, 'Failed to convert quote to job');
  }
}