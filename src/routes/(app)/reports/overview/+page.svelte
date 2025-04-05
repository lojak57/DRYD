<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { getFinancialJobs, getFinancialMetrics, calculateYearOverYearGrowth } from '$lib/services/financialData';
  import { formatCurrency } from '$lib/utils/formatters';
  
  // Basic reports data
  let jobCount = 0;
  let totalRevenue = 0;
  let yearOverYearGrowth = 0;
  let activeCustomers = 0;
  let avgJobValue = 0;
  let completionRate = 0;
  
  onMount(() => {
    const jobs = getFinancialJobs();
    const metrics = getFinancialMetrics(jobs);
    
    jobCount = jobs.length;
    totalRevenue = metrics.totalRevenue;
    yearOverYearGrowth = calculateYearOverYearGrowth();
    
    // Count unique customers
    const uniqueCustomers = new Set();
    jobs.forEach(job => {
      if (job.customerId) {
        uniqueCustomers.add(job.customerId);
      }
    });
    activeCustomers = uniqueCustomers.size;
    
    // Calculate average job value
    avgJobValue = metrics.averageJobValue;
    
    // Calculate job completion rate (completed + paid / total excluding cancelled)
    const completedJobs = jobs.filter(job => job.status === 'COMPLETED' || job.status === 'PAID').length;
    const totalJobsExcludingCancelled = jobs.filter(job => job.status !== 'CANCELLED').length;
    completionRate = totalJobsExcludingCancelled > 0 
      ? (completedJobs / totalJobsExcludingCancelled) * 100 
      : 0;
  });
</script>

<PageHeader title="Reports Overview" subtitle="Key performance metrics and reports" />

<div class="p-4">
  <!-- KPI Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Total Jobs</h3>
        <p class="text-2xl font-bold text-gray-900">{jobCount}</p>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Total Revenue</h3>
        <p class="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        {#if yearOverYearGrowth !== 0}
          <p class="text-sm {yearOverYearGrowth > 0 ? 'text-green-600' : 'text-red-600'}">
            {yearOverYearGrowth > 0 ? '+' : ''}{yearOverYearGrowth.toFixed(1)}% YoY
          </p>
        {/if}
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Active Customers</h3>
        <p class="text-2xl font-bold text-gray-900">{activeCustomers}</p>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Avg. Job Value</h3>
        <p class="text-2xl font-bold text-gray-900">{formatCurrency(avgJobValue)}</p>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Completion Rate</h3>
        <p class="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
      </div>
    </Card>
    
    <Card>
      <div class="text-center p-4">
        <h3 class="text-gray-500 text-sm font-medium">Report Types</h3>
        <p class="text-2xl font-bold text-gray-900">2</p>
        <p class="text-sm text-gray-500">Available reports</p>
      </div>
    </Card>
  </div>
  
  <!-- Report Links -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Financial Reports</h3>
        <p class="text-gray-600 mb-4">
          View detailed financial metrics, revenue trends, and profit analysis.
        </p>
        <a 
          href="/reports/financial"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Financial Reports
        </a>
      </div>
    </Card>
    
    <Card>
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p class="text-gray-600 mb-4">
          Additional report types will be available in future updates.
        </p>
        <button 
          disabled
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
        >
          Not Available Yet
        </button>
      </div>
    </Card>
  </div>
</div> 