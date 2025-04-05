<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore } from '$lib/stores/jobStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import type { Job } from '$lib/types/Job';
  import { JobStatus, JobType } from '$lib/types/Job';
  
  // Financial data
  let totalRevenue = 0;
  let pendingRevenue = 0;
  let paidRevenue = 0;
  let invoicedRevenue = 0;
  let jobsByType: Record<string, { count: number; revenue: number }> = {};
  let revenueByMonth: Record<string, number> = {};
  let monthlyComparisons: Record<string, { thisYear: number; lastYear: number; change: number }> = {};
  let topJobs: Job[] = [];
  let isLoading = true;
  
  // Chart data
  let revenueChartData: { month: string; amount: number }[] = [];
  let jobTypeChartData: { type: string; count: number }[] = [];
  
  onMount(async () => {
    // Load data
    await jobStore.loadJobs();
    calculateFinancialMetrics();
    isLoading = false;
  });
  
  // Calculate all financial metrics from job data
  function calculateFinancialMetrics() {
    const jobs = $jobStore || [];
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.log('No jobs data available');
      return;
    }
    
    // Initialize
    totalRevenue = 0;
    pendingRevenue = 0;
    paidRevenue = 0;
    invoicedRevenue = 0;
    jobsByType = {};
    revenueByMonth = {};
    monthlyComparisons = {};
    topJobs = [];
    
    // Initialize job types
    Object.values(JobType).forEach(type => {
      jobsByType[type] = { count: 0, revenue: 0 };
    });
    
    // Process each job
    jobs.forEach(job => {
      // Skip jobs with no total
      if (!job.total) return;
      
      // Add to total revenue
      totalRevenue += job.total;
      
      // Add to job type statistics
      if (job.type && jobsByType[job.type]) {
        jobsByType[job.type].count++;
        jobsByType[job.type].revenue += job.total || 0;
      }
      
      // Add to revenue by status
      if (job.status === JobStatus.PAID && job.total) {
        paidRevenue += job.total;
      } else if (job.status === JobStatus.INVOICED && job.total) {
        invoicedRevenue += job.total;
      } else if (job.status !== JobStatus.CANCELLED && job.status !== JobStatus.NEW && job.total) {
        pendingRevenue += job.total;
      }
      
      // Add to monthly revenue (for jobs that have an invoice date)
      if (job.invoiceDate) {
        const date = new Date(job.invoiceDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!revenueByMonth[monthYear]) {
          revenueByMonth[monthYear] = 0;
        }
        
        revenueByMonth[monthYear] += job.total || 0;
      }
    });
    
    // Sort months chronologically and prepare chart data
    const sortedMonths = Object.keys(revenueByMonth).sort();
    revenueChartData = sortedMonths.map(month => {
      // Format month for display (convert YYYY-MM to MMM YYYY)
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const displayMonth = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      return {
        month: displayMonth,
        amount: revenueByMonth[month]
      };
    });
    
    // Prepare job type chart data
    jobTypeChartData = Object.entries(jobsByType)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        type,
        count: data.count
      }));
    
    // Calculate monthly comparisons
    // This would compare revenue for the same month across years
    // Simplified example that compares only if we have 2+ years of data
    if (sortedMonths.length > 12) {
      for (let i = 12; i < sortedMonths.length; i++) {
        const currentMonth = sortedMonths[i];
        const previousYearMonth = sortedMonths[i - 12]; // Same month, previous year
        
        const [currentYear, currentMonthNum] = currentMonth.split('-');
        const displayMonth = new Date(parseInt(currentYear), parseInt(currentMonthNum) - 1, 1)
          .toLocaleDateString('en-US', { month: 'short' });
        
        const currentValue = revenueByMonth[currentMonth];
        const previousValue = revenueByMonth[previousYearMonth];
        
        const change = previousValue > 0 
          ? ((currentValue - previousValue) / previousValue) * 100 
          : 100;
        
        monthlyComparisons[displayMonth] = {
          thisYear: currentValue,
          lastYear: previousValue,
          change
        };
      }
    }
    
    // Find top revenue-generating jobs
    topJobs = [...jobs]
      .filter(job => job.total)
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 5);
  }
</script>

<svelte:head>
  <title>Financial Reports | DRYAD Restoration</title>
</svelte:head>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Financial Dashboard</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-dryd-blue"></div>
    </div>
  {:else}
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Total Revenue</h3>
        <p class="text-2xl font-bold text-dryd-blue">{formatCurrency(totalRevenue)}</p>
        <p class="text-sm text-gray-500 mt-2">Across all jobs</p>
      </div>
      
      <!-- Paid Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Paid Revenue</h3>
        <p class="text-2xl font-bold text-green-600">{formatCurrency(paidRevenue)}</p>
        <p class="text-sm text-gray-500 mt-2">{((paidRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
      </div>
      
      <!-- Invoiced Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Invoiced (Unpaid)</h3>
        <p class="text-2xl font-bold text-amber-600">{formatCurrency(invoicedRevenue)}</p>
        <p class="text-sm text-gray-500 mt-2">{((invoicedRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
      </div>
      
      <!-- Pending Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Pending Revenue</h3>
        <p class="text-2xl font-bold text-gray-600">{formatCurrency(pendingRevenue)}</p>
        <p class="text-sm text-gray-500 mt-2">{((pendingRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
      </div>
    </div>
    
    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue by Month -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Revenue by Month</h3>
        <div class="h-64">
          {#if revenueChartData.length === 0}
            <div class="flex justify-center items-center h-full text-gray-400">
              No revenue data available
            </div>
          {:else}
            <!-- Simple bar chart visualization -->
            <div class="flex items-end h-48 space-x-2">
              {#each revenueChartData as item}
                {@const percentage = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0}
                {@const height = Math.max(5, percentage * 2)}
                <div class="flex flex-col items-center flex-1">
                  <div class="w-full bg-dryd-blue rounded-t" style="height: {height}%"></div>
                  <div class="text-xs mt-2 text-gray-600 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {item.month}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Job Types -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Jobs by Type</h3>
        <div class="h-64">
          {#if jobTypeChartData.length === 0}
            <div class="flex justify-center items-center h-full text-gray-400">
              No job type data available
            </div>
          {:else}
            <div class="grid grid-cols-2 gap-4">
              <!-- Simple visualization -->
              {#each jobTypeChartData as item}
                <div class="flex flex-col">
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium">{item.type}</span>
                    <span class="text-sm font-medium">{item.count} jobs</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-dryd-blue h-2.5 rounded-full" style="width: {(item.count / Math.max(...jobTypeChartData.map(d => d.count))) * 100}%"></div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Top Jobs and Financial Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Revenue Jobs -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">Top Revenue Jobs</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#if topJobs.length === 0}
                <tr>
                  <td colspan="4" class="px-6 py-4 text-center text-gray-400">No jobs available</td>
                </tr>
              {:else}
                {#each topJobs as job}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-dryd-blue">{job.jobNumber}</div>
                      <div class="text-sm text-gray-500">{job.title}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${job.status === JobStatus.PAID ? 'bg-green-100 text-green-800' : 
                          job.status === JobStatus.INVOICED ? 'bg-amber-100 text-amber-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(job.total || 0)}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Revenue by Job Type -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">Revenue by Job Type</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each Object.entries(jobsByType).filter(([_, data]) => data.count > 0) as [type, data]}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{type}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.count}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.revenue)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(data.count > 0 ? data.revenue / data.count : 0)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div> 