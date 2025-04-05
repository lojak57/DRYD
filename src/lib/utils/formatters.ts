/**
 * Format a number as currency (USD)
 * @param amount The amount to format
 * @returns Formatted currency string (e.g. $1,234.56)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a date in a readable format
 * @param date The date to format
 * @returns Formatted date string (e.g. Jan 1, 2022)
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
} 