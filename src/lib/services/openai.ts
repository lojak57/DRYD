/**
 * Services for interacting with OpenAI APIs
 */

/**
 * Represents the parsed receipt data from OpenAI
 */
interface ParsedReceiptData {
  vendor: string;
  amount: string;
  date: string;
  description?: string;
  category?: string;
  items?: string[];
}

/**
 * Parse a receipt image using OpenAI's Vision API
 * @param base64Image - Base64-encoded image data
 * @returns Parsed receipt data
 */
export async function parseReceiptWithOpenAI(base64Image: string): Promise<ParsedReceiptData> {
  console.log('Starting receipt parsing with OpenAI');
  
  // In a production app, this would make an actual API call to OpenAI
  // For this prototype, we'll simulate a response
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return simulated response
  console.log('Returning simulated OpenAI response');
  return {
    vendor: "Home Depot",
    amount: "127.85",
    date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    description: "Construction materials for water damage repair",
    items: [
      "Drywall sheets (2)",
      "Joint compound",
      "Sandpaper",
      "Paint primer"
    ]
  };
}

/**
 * Categorize an expense based on vendor and description
 * @param vendor - The vendor/merchant name
 * @param description - The expense description
 * @returns The appropriate expense category
 */
export async function categorizeExpense(vendor: string, description: string): Promise<string> {
  console.log('Categorizing expense based on:', { vendor, description });
  
  // In a production app, this would use AI to categorize
  // For this prototype, we'll use some simple rules
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const vendorLower = vendor.toLowerCase();
  const descLower = description.toLowerCase();
  
  if (vendorLower.includes('home depot') || 
      vendorLower.includes('lowes') || 
      descLower.includes('material') ||
      descLower.includes('supply') ||
      descLower.includes('tool')) {
    return 'materials';
  }
  
  if (vendorLower.includes('rental') || 
      descLower.includes('equipment') ||
      descLower.includes('rental')) {
    return 'equipment';
  }
  
  if (vendorLower.includes('gas') || 
      vendorLower.includes('shell') ||
      vendorLower.includes('chevron') ||
      descLower.includes('travel') ||
      descLower.includes('mile')) {
    return 'travel';
  }
  
  if (vendorLower.includes('restaurant') || 
      vendorLower.includes('cafe') ||
      vendorLower.includes('food') ||
      descLower.includes('meal') ||
      descLower.includes('lunch')) {
    return 'meals';
  }
  
  // Default
  return 'other';
}

/**
 * Generate a description for an expense based on receipt items
 * @param items - Array of items from the receipt
 * @returns Generated description
 */
export async function generateExpenseDescription(items: string[]): Promise<string> {
  console.log('Generating description for items:', items);
  
  // In a production app, this would use AI to generate a good description
  // For this prototype, we'll do something simple
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (items.length === 0) {
    return "Business expense";
  }
  
  if (items.length <= 2) {
    return items.join(' and ');
  }
  
  // For more items, summarize them
  const categories = new Set<string>();
  
  // Try to extract categories from items
  items.forEach(item => {
    if (item.toLowerCase().includes('drywall') || item.toLowerCase().includes('sheet')) {
      categories.add('drywall materials');
    } else if (item.toLowerCase().includes('paint') || item.toLowerCase().includes('primer')) {
      categories.add('painting supplies');
    } else if (item.toLowerCase().includes('tool')) {
      categories.add('tools');
    } else if (item.toLowerCase().includes('lumber') || item.toLowerCase().includes('wood')) {
      categories.add('lumber');
    } else if (item.toLowerCase().includes('hardware') || item.toLowerCase().includes('screw') || item.toLowerCase().includes('nail')) {
      categories.add('hardware');
    }
  });
  
  if (categories.size > 0) {
    return `Purchase of ${Array.from(categories).join(', ')}`;
  }
  
  // Generic fallback
  return `Purchase of ${items.length} items for job`;
} 