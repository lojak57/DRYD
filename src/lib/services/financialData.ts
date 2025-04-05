import type { Job } from '$lib/types/Job';
import type { Customer } from '$lib/types/Customer';
import financialJobs from '$lib/mock/financial_jobs.json';
import financialCustomers from '$lib/mock/financial_customers.json';

/**
 * Service to provide financial data for reporting and analytics
 */

// Type the imported JSON data
const typedFinancialJobs = financialJobs as unknown as Job[];
const typedFinancialCustomers = financialCustomers as unknown as Customer[];

/**
 * Get all financial jobs data
 * @returns Array of jobs with financial data
 */
export function getFinancialJobs(): Job[] {
  return typedFinancialJobs;
}

/**
 * Get all financial customers data
 * @returns Array of customers
 */
export function getFinancialCustomers(): Customer[] {
  return typedFinancialCustomers;
}

/**
 * Get jobs for a specific date range
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of jobs within the date range
 */
export function getJobsByDateRange(startDate: Date, endDate: Date): Job[] {
  return typedFinancialJobs.filter(job => {
    // Use invoice date for INVOICED and PAID jobs, completion date for COMPLETED jobs, scheduled date for others
    let jobDate: Date | null = null;
    if (job.invoiceDate) {
      jobDate = new Date(job.invoiceDate);
    } else if (job.completedDate) {
      jobDate = new Date(job.completedDate);
    } else if (job.scheduledStartDate) {
      jobDate = new Date(job.scheduledStartDate);
    } else if (job.createdAt) {
      jobDate = new Date(job.createdAt);
    }
    
    if (!jobDate) return false;
    
    return jobDate >= startDate && jobDate <= endDate;
  });
}

/**
 * Get financial metrics for a set of jobs
 * @param jobs The jobs to analyze
 * @returns Object with financial metrics
 */
export function getFinancialMetrics(jobs: Job[]) {
  const metrics = {
    totalRevenue: 0,
    paidRevenue: 0,
    invoicedRevenue: 0,
    pendingRevenue: 0,
    averageJobValue: 0,
    totalProfit: 0,
    profitMargin: 0,
    jobsByType: {} as Record<string, { count: number; revenue: number; profit: number }>,
    jobsByStatus: {} as Record<string, { count: number; revenue: number }>,
    revenueByMonth: {} as Record<string, number>,
    monthlyComparisons: {} as Record<string, { thisYear: number; lastYear: number; change: number }>
  };
  
  if (!jobs.length) return metrics;
  
  // Process each job
  jobs.forEach(job => {
    const total = job.total || 0;
    
    // Skip jobs with no revenue
    if (total <= 0) return;
    
    // Total revenue
    metrics.totalRevenue += total;
    
    // Revenue by status
    if (!metrics.jobsByStatus[job.status]) {
      metrics.jobsByStatus[job.status] = { count: 0, revenue: 0 };
    }
    metrics.jobsByStatus[job.status].count++;
    metrics.jobsByStatus[job.status].revenue += total;
    
    // Categorize by payment status
    if (job.status === 'PAID') {
      metrics.paidRevenue += total;
    } else if (job.status === 'INVOICED') {
      metrics.invoicedRevenue += total;
    } else if (job.status !== 'CANCELLED') {
      metrics.pendingRevenue += total;
    }
    
    // Revenue by type
    if (job.type) {
      if (!metrics.jobsByType[job.type]) {
        metrics.jobsByType[job.type] = { count: 0, revenue: 0, profit: 0 };
      }
      metrics.jobsByType[job.type].count++;
      metrics.jobsByType[job.type].revenue += total;
      
      // Calculate profit
      const costs = (job.laborCost || 0) + (job.materialsCost || 0) + (job.equipmentCost || 0);
      const profit = total - costs;
      metrics.totalProfit += profit;
      metrics.jobsByType[job.type].profit += profit;
    }
    
    // Revenue by month (for jobs with dates)
    if (job.invoiceDate) {
      const date = new Date(job.invoiceDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!metrics.revenueByMonth[monthYear]) {
        metrics.revenueByMonth[monthYear] = 0;
      }
      
      metrics.revenueByMonth[monthYear] += total;
    }
  });
  
  // Calculate average job value
  metrics.averageJobValue = metrics.totalRevenue / jobs.length;
  
  // Calculate profit margin percentage
  metrics.profitMargin = metrics.totalRevenue > 0 
    ? (metrics.totalProfit / metrics.totalRevenue) * 100 
    : 0;
    
  // Calculate month-over-month comparisons
  const months = Object.keys(metrics.revenueByMonth).sort();
  if (months.length > 1) {
    for (let i = 1; i < months.length; i++) {
      const currentMonth = months[i];
      const previousMonth = months[i - 1];
      
      // Extract month name for display
      const [currentYear, currentMonthNum] = currentMonth.split('-');
      const monthName = new Date(parseInt(currentYear), parseInt(currentMonthNum) - 1, 1)
        .toLocaleDateString('en-US', { month: 'short' });
      
      const currentValue = metrics.revenueByMonth[currentMonth];
      const previousValue = metrics.revenueByMonth[previousMonth];
      
      // Calculate percentage change
      const change = previousValue > 0 
        ? ((currentValue - previousValue) / previousValue) * 100 
        : 100;
      
      metrics.monthlyComparisons[monthName] = {
        thisYear: currentValue,
        lastYear: previousValue,
        change
      };
    }
  }
  
  return metrics;
}

/**
 * Get top revenue-generating jobs
 * @param jobs The jobs to analyze
 * @param limit Maximum number of jobs to return
 * @returns Array of top jobs by revenue
 */
export function getTopRevenueJobs(jobs: Job[], limit = 10): Job[] {
  return [...jobs]
    .filter(job => job.total && job.total > 0)
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .slice(0, limit);
}

/**
 * Calculate year-over-year growth
 * @returns Percentage growth compared to previous year
 */
export function calculateYearOverYearGrowth(): number {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  // Sum revenue for current year
  const currentYearRevenue = typedFinancialJobs
    .filter(job => {
      const jobDate = job.invoiceDate ? new Date(job.invoiceDate) : null;
      return jobDate && jobDate.getFullYear() === currentYear;
    })
    .reduce((sum, job) => sum + (job.total || 0), 0);
  
  // Sum revenue for last year
  const lastYearRevenue = typedFinancialJobs
    .filter(job => {
      const jobDate = job.invoiceDate ? new Date(job.invoiceDate) : null;
      return jobDate && jobDate.getFullYear() === lastYear;
    })
    .reduce((sum, job) => sum + (job.total || 0), 0);
  
  // Calculate growth percentage
  return lastYearRevenue > 0 
    ? ((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 
    : 0;
} 