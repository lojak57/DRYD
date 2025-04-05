<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Chart from 'chart.js/auto';
  import { getFinancialJobs, getFinancialMetrics, getTopRevenueJobs, calculateYearOverYearGrowth } from '$lib/services/financialData';
  import { formatCurrency } from '$lib/utils/formatters';
  import dayjs from 'dayjs';
  
  // Date range filters
  let startDate = dayjs().startOf('year').toDate();
  let endDate = dayjs().endDate('year').toDate();
  let dateRange = 'year';
  
  // Financial data
  let jobs = [];
  let metrics = null;
  let topJobs = [];
  let yearOverYearGrowth = 0;
  let revenueChart: Chart;
  let jobTypeChart: Chart;
  
  // Set date range based on selection
  function updateDateRange(range) {
    dateRange = range;
    
    if (range === 'month') {
      startDate = dayjs().startOf('month').toDate();
      endDate = dayjs().endOf('month').toDate();
    } else if (range === 'quarter') {
      startDate = dayjs().startOf('quarter').toDate();
      endDate = dayjs().endOf('quarter').toDate();
    } else if (range === 'year') {
      startDate = dayjs().startOf('year').toDate();
      endDate = dayjs().endOf('year').toDate();
    } else if (range === 'all') {
      // Set to a wide range that should cover all data
      startDate = dayjs().subtract(10, 'year').toDate();
      endDate = dayjs().add(1, 'year').toDate();
    }
    
    loadData();
  }
  
  // Load data based on current filters
  function loadData() {
    const allJobs = getFinancialJobs();
    jobs = allJobs.filter(job => {
      const jobDate = job.invoiceDate 
        ? new Date(job.invoiceDate) 
        : job.completedDate 
          ? new Date(job.completedDate)
          : new Date(job.createdAt);
      
      return jobDate >= startDate && jobDate <= endDate;
    });
    
    metrics = getFinancialMetrics(jobs);
    topJobs = getTopRevenueJobs(jobs, 5);
    yearOverYearGrowth = calculateYearOverYearGrowth();
    
    renderCharts();
  }
  
  // Render charts with the current data
  function renderCharts() {
    if (!metrics) return;
    
    // Destroy existing charts if they exist
    if (revenueChart) revenueChart.destroy();
    if (jobTypeChart) jobTypeChart.destroy();
    
    // Render revenue by month chart
    const monthlyData = Object.entries(metrics.revenueByMonth).sort();
    
    const revenueChartCanvas = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueChartCanvas) {
      revenueChart = new Chart(revenueChartCanvas, {
        type: 'line',
        data: {
          labels: monthlyData.map(([month]) => {
            const [year, monthNum] = month.split('-');
            return new Date(parseInt(year), parseInt(monthNum) - 1, 1)
              .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          }),
          datasets: [{
            label: 'Revenue',
            data: monthlyData.map(([, value]) => value),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Revenue'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Revenue: ${formatCurrency(context.raw as number)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return formatCurrency(value as number);
                }
              }
            }
          }
        }
      });
    }
    
    // Render job type distribution chart
    const jobTypeData = Object.entries(metrics.jobsByType);
    
    const jobTypeChartCanvas = document.getElementById('jobTypeChart') as HTMLCanvasElement;
    if (jobTypeChartCanvas) {
      jobTypeChart = new Chart(jobTypeChartCanvas, {
        type: 'pie',
        data: {
          labels: jobTypeData.map(([type]) => type),
          datasets: [{
            data: jobTypeData.map(([, data]) => data.count),
            backgroundColor: [
              '#4f46e5', // Indigo
              '#ef4444', // Red
              '#10b981', // Green
              '#f59e0b', // Amber
              '#8b5cf6', // Purple
              '#14b8a6', // Teal
              '#f43f5e', // Pink
              '#6366f1'  // Indigo
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Job Type Distribution'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} jobs (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }
  
  onMount(() => {
    loadData();
  });
</script>

<PageHeader title="Financial Reports" subtitle="View financial metrics and performance" />

<div class="p-4">
  <!-- Date Range Controls -->
  <div class="mb-6 flex items-center">
    <span class="mr-4 text-gray-700 font-medium">Date Range:</span>
    <div class="space-x-2">
      <button 
        class="px-3 py-1 rounded {dateRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
        on:click={() => updateDateRange('month')}>
        Month
      </button>
      <button 
        class="px-3 py-1 rounded {dateRange === 'quarter' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
        on:click={() => updateDateRange('quarter')}>
        Quarter
      </button>
      <button 
        class="px-3 py-1 rounded {dateRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
        on:click={() => updateDateRange('year')}>
        Year
      </button>
      <button 
        class="px-3 py-1 rounded {dateRange === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
        on:click={() => updateDateRange('all')}>
        All Time
      </button>
    </div>
    
    <div class="ml-auto">
      <span class="text-sm text-gray-500">
        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
      </span>
    </div>
  </div>
  
  <!-- Financial KPIs -->
  {#if metrics}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <div class="text-center p-4">
          <h3 class="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p class="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
          {#if yearOverYearGrowth !== 0}
            <p class="text-sm {yearOverYearGrowth > 0 ? 'text-green-600' : 'text-red-600'}">
              {yearOverYearGrowth > 0 ? '+' : ''}{yearOverYearGrowth.toFixed(1)}% YoY
            </p>
          {/if}
        </div>
      </Card>
      
      <Card>
        <div class="text-center p-4">
          <h3 class="text-gray-500 text-sm font-medium">Avg. Job Value</h3>
          <p class="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageJobValue)}</p>
          <p class="text-sm text-gray-500">{jobs.length} jobs total</p>
        </div>
      </Card>
      
      <Card>
        <div class="text-center p-4">
          <h3 class="text-gray-500 text-sm font-medium">Profit Margin</h3>
          <p class="text-2xl font-bold text-gray-900">{metrics.profitMargin.toFixed(1)}%</p>
          <p class="text-sm text-gray-500">{formatCurrency(metrics.totalProfit)} total profit</p>
        </div>
      </Card>
      
      <Card>
        <div class="text-center p-4">
          <h3 class="text-gray-500 text-sm font-medium">Outstanding</h3>
          <p class="text-2xl font-bold text-gray-900">{formatCurrency(metrics.invoicedRevenue)}</p>
          <p class="text-sm text-gray-500">
            {((metrics.invoicedRevenue / metrics.totalRevenue) * 100).toFixed(1)}% of total
          </p>
        </div>
      </Card>
    </div>
  {/if}
  
  <!-- Charts Section -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
        <canvas id="revenueChart" height="300"></canvas>
      </div>
    </Card>
    
    <Card>
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Job Type Distribution</h3>
        <canvas id="jobTypeChart" height="300"></canvas>
      </div>
    </Card>
  </div>
  
  <!-- Top Jobs Table -->
  <Card>
    <div class="p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Top Revenue Jobs</h3>
      
      {#if topJobs.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job ID
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each topJobs as job}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    <a href="/jobs/{job.id}" class="hover:underline">{job.id.substring(0, 8)}</a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.customer?.name || 'Unknown'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.invoiceDate 
                      ? new Date(job.invoiceDate).toLocaleDateString() 
                      : job.completedDate 
                        ? new Date(job.completedDate).toLocaleDateString()
                        : ''}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.type || 'N/A'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      {job.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                        job.status === 'INVOICED' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'COMPLETED' ? 'bg-yellow-100 text-yellow-800' :
                        job.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}">
                      {job.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(job.total || 0)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-gray-500 text-center py-4">No jobs found for the selected date range.</p>
      {/if}
    </div>
  </Card>
</div> 