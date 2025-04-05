import { writable } from 'svelte/store';
import type { Quote } from '$lib/types/Quote';
import { getQuotes, getQuoteById, createQuote, updateQuote, deleteQuote } from '$lib/services/quotes';

type QuoteStore = {
  quotes: Quote[];
  selected: Quote | null;
  loading: boolean;
  error: string | null;
};

// Create the initial store
const initialState: QuoteStore = {
  quotes: [],
  selected: null,
  loading: false,
  error: null
};

function createQuoteStore() {
  const { subscribe, set, update } = writable<QuoteStore>(initialState);

  return {
    subscribe,
    
    // Reset the store to initial state
    reset: () => set(initialState),
    
    // Fetch all quotes
    fetchQuotes: async () => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const quotes = await getQuotes();
        update(state => ({ ...state, quotes, loading: false }));
      } catch (error) {
        console.error('Error fetching quotes:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch quotes'
        }));
      }
    },
    
    // Fetch a single quote by ID
    fetchQuoteById: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const quote = await getQuoteById(id);
        update(state => ({ ...state, selected: quote, loading: false }));
        return quote;
      } catch (error) {
        console.error(`Error fetching quote ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : `Failed to fetch quote ${id}`
        }));
        return null;
      }
    },
    
    // Create a new quote
    addQuote: async (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'dateCreated'>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const newQuote = await createQuote(quoteData);
        update(state => ({ 
          ...state, 
          quotes: [...state.quotes, newQuote],
          selected: newQuote,
          loading: false 
        }));
        return newQuote;
      } catch (error) {
        console.error('Error creating quote:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to create quote'
        }));
        return null;
      }
    },
    
    // Update an existing quote
    updateQuote: async (id: string, quoteData: Partial<Quote>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const updatedQuote = await updateQuote(id, quoteData);
        update(state => ({ 
          ...state, 
          quotes: state.quotes.map(q => q.id === id ? updatedQuote : q),
          selected: state.selected?.id === id ? updatedQuote : state.selected,
          loading: false 
        }));
        return updatedQuote;
      } catch (error) {
        console.error(`Error updating quote ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : `Failed to update quote ${id}`
        }));
        return null;
      }
    },
    
    // Delete a quote
    deleteQuote: async (id: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await deleteQuote(id);
        update(state => ({ 
          ...state, 
          quotes: state.quotes.filter(q => q.id !== id),
          selected: state.selected?.id === id ? null : state.selected,
          loading: false 
        }));
        return true;
      } catch (error) {
        console.error(`Error deleting quote ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error instanceof Error ? error.message : `Failed to delete quote ${id}`
        }));
        return false;
      }
    },
    
    // Set selected quote without fetching
    selectQuote: (quote: Quote | null) => {
      update(state => ({ ...state, selected: quote }));
    },
    
    // Clear any errors
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

// Export a singleton instance of the store
export const quoteStore = createQuoteStore();