<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore, jobs as jobsStore } from '$lib/stores/jobStore';
  import { getTechnicians } from '$lib/services/users';
  import type { User } from '$lib/types/User';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import GanttJobCard from './GanttJobCard.svelte';
  import { goto } from '$app/navigation';
  
  // Chart data
  let technicians: User[] = [];
  let jobs: Job[] = [];
  
  // View type (daily or weekly)
  let viewType: 'daily' | 'weekly' = 'weekly';
  
  // Subscribe to the jobs store to keep data updated
  $: if ($jobsStore) {
    jobs = Array.isArray($jobsStore) ? $jobsStore : [];
    console.log(`Jobs updated from store: ${jobs.length} jobs`);
  }
  
  // Show all statuses except NEW (since those aren't scheduled yet)
  const visibleStatuses = [
    JobStatus.SCHEDULED,
    JobStatus.IN_PROGRESS,
    JobStatus.ON_HOLD,
    JobStatus.PENDING_COMPLETION,
    JobStatus.COMPLETED,
    JobStatus.INVOICE_APPROVAL,
    JobStatus.INVOICED,
    JobStatus.PAID,
    JobStatus.CANCELLED
  ];
  
  // Date range for the chart
  const daysInWeek = 7;
  
  // Selected date - in daily view, this is the single date to show
  // in weekly view, this is the start of the week
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Generate date range based on view type
  $: dateRange = generateDateRange(selectedDate, viewType === 'daily' ? 1 : daysInWeek);
  
  // Mapped data for display - ensure all inputs are properly defined
  $: technicianJobs = technicians && Array.isArray(jobs) && dateRange ? 
      mapJobsToTechnicians(technicians, jobs, dateRange) : [];
  
  // Generate array of dates from start date to specified number of days
  function generateDateRange(start: Date, days: number): Date[] {
    const dates: Date[] = [];
    const startDateCopy = new Date(start);
    startDateCopy.setHours(0, 0, 0, 0); // Normalize to start of day
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDateCopy);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }
  
  // Get style based on job status
  function getStatusStyle(status: JobStatus): { bgClass: string; textClass: string } {
    switch(status) {
      case JobStatus.SCHEDULED:
        return { bgClass: "bg-blue-100 border-blue-300", textClass: "text-blue-800" };
      case JobStatus.IN_PROGRESS:
        return { bgClass: "bg-green-100 border-green-300", textClass: "text-green-800" };
      case JobStatus.ON_HOLD:
        return { bgClass: "bg-yellow-100 border-yellow-300", textClass: "text-yellow-800" };
      case JobStatus.PENDING_COMPLETION:
        return { bgClass: "bg-purple-100 border-purple-300", textClass: "text-purple-800" };
      case JobStatus.COMPLETED:
        return { bgClass: "bg-emerald-100 border-emerald-300", textClass: "text-emerald-800" };
      case JobStatus.INVOICE_APPROVAL:
      case JobStatus.INVOICED:
        return { bgClass: "bg-pink-100 border-pink-300", textClass: "text-pink-800" };
      case JobStatus.PAID:
        return { bgClass: "bg-teal-100 border-teal-300", textClass: "text-teal-800" };
      case JobStatus.CANCELLED:
        return { bgClass: "bg-gray-100 border-gray-300", textClass: "text-gray-800" };
      case JobStatus.NEW:
        return { bgClass: "bg-blue-50 border-blue-200", textClass: "text-blue-700" };
      default:
        return { bgClass: "bg-gray-100 border-gray-300", textClass: "text-gray-800" };
    }
  }
  
  // Format date for display
  function formatDate(date: Date, detailed = false): string {
    if (detailed) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    return `${day} ${monthDay}`;
  }
  
  // Check if a job is scheduled for a specific date
  function isJobScheduledForDate(job: Job, date: Date): boolean {
    if (!job || !job.scheduledStartDate) return false;
    
    // Create new date objects to avoid modifying the originals
    // Parse the job date and ensure we're normalizing to UTC to avoid timezone issues
    const jobStartDateStr = new Date(job.scheduledStartDate).toISOString().split('T')[0];
    const jobStartDate = new Date(jobStartDateStr + 'T00:00:00.000Z');
    
    // Do the same with the calendar date we're checking against
    const dateStr = new Date(date).toISOString().split('T')[0];
    const dateToCheck = new Date(dateStr + 'T00:00:00.000Z');
    
    // Debug log to check date comparisons
    console.log(`Comparing job ${job.jobNumber} date: ${jobStartDate.toLocaleDateString()} with calendar date: ${dateToCheck.toLocaleDateString()}`);
    console.log(`  Raw job date: ${new Date(job.scheduledStartDate).toISOString()}, Raw calendar date: ${date.toISOString()}`);
    
    // Compare the dates using their UTC time values
    return jobStartDate.getTime() === dateToCheck.getTime();
  }
  
  // Map jobs to technicians for easier rendering
  function mapJobsToTechnicians(techs: User[], allJobs: Job[], dates: Date[]): any[] {
    // Handle case when allJobs is undefined or not an array
    if (!allJobs || !Array.isArray(allJobs)) {
      return techs.map(tech => ({
        technician: tech,
        dates: dates.map(date => ({ date, jobs: [] }))
      }));
    }
    
    return techs.map(tech => {
      // Get jobs assigned to this technician
      const techJobs = allJobs.filter(job => 
        job && 
        job.assignedUserIds && 
        Array.isArray(job.assignedUserIds) &&
        job.assignedUserIds.includes(tech.id) && 
        job.status &&
        visibleStatuses.includes(job.status)
      );
      
      // Map jobs to dates
      const dateJobs = dates.map(date => {
        const jobsForDate = techJobs.filter(job => isJobScheduledForDate(job, date));
        return {
          date,
          jobs: jobsForDate
        };
      });
      
      return {
        technician: tech,
        dates: dateJobs
      };
    });
  }
  
  // Navigate to previous date or week
  function navigatePrevious() {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - daysInWeek);
    }
    selectedDate = newDate;
  }
  
  // Navigate to next date or week
  function navigateNext() {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + daysInWeek);
    }
    selectedDate = newDate;
  }
  
  // Set date to today
  function goToToday() {
    selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
  }
  
  // Switch to daily view
  function setDailyView() {
    viewType = 'daily';
  }
  
  // Switch to weekly view
  function setWeeklyView() {
    viewType = 'weekly';
  }
  
  // Load data on component mount
  onMount(async () => {
    try {
      // Load technicians
      technicians = await getTechnicians();
      
      // Load jobs
      await jobStore.loadJobs();
      
      // Safely extract jobs from store and ensure it's an array
      if ($jobStore && typeof $jobStore === 'object' && 'jobs' in $jobStore) {
        const storeJobs = $jobStore.jobs;
        jobs = Array.isArray(storeJobs) ? storeJobs : [];
      } else {
        jobs = [];
      }
      
      // Log for debugging
      console.log(`Loaded ${technicians.length} technicians and ${jobs.length} jobs`);
      
      // Check if we have jobs scheduled in the visible range
      const scheduledJobs = jobs.filter(job => 
        job && 
        job.scheduledStartDate && 
        job.status && 
        visibleStatuses.includes(job.status)
      );
      
      console.log(`Found ${scheduledJobs.length} scheduled/in-progress jobs`);
    } catch (error) {
      console.error('Error loading Gantt chart data:', error);
      jobs = []; // Ensure jobs is at least an empty array on error
    }
  });
</script>

<style>
  /* Mobile-first base styling */
  .gantt-chart {
    width: 100%;
    overflow-x: auto;
  }
  
  /* Schedule containers */
  .schedule-container {
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  /* Ensure consistent card spacing and appearance */
  .gantt-card-wrapper {
    margin-bottom: 2px;
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    display: flex;
  }
  
  /* Square cells for weekly view - mobile first - REDUCED SIZE FOR MOBILE */
  td.cell-square {
    height: 60px;
    width: 50px;
    min-width: 50px;
    max-width: 50px;
    padding: 1px !important;
    vertical-align: top;
    position: relative;
  }
  
  /* Rectangular cells for daily view */
  td.cell-daily {
    height: 60px;
    width: 100%;
    padding: 2px !important;
  }
  
  /* Square header cells */
  th.header-square {
    width: 50px;
    min-width: 50px;
    max-width: 50px;
    padding: 4px 1px !important;
  }
  
  /* Daily view header cell */
  th.header-daily {
    width: 100%;
  }
  
  /* Technician column width - REDUCED WIDTH FOR MOBILE */
  .tech-column {
    width: 60px;
    min-width: 60px;
    max-width: 60px;
    background-color: #f8fafc !important;
    border-right: 1px solid #e2e8f0;
  }
  
  /* Vertical technician name for mobile */
  .tech-name-vertical {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 0.65rem;
    padding: 4px 0;
  }
  
  /* Card styling for compact squares */
  :global(.gantt-card-wrapper .job-card) {
    padding: 0.15rem !important;
    font-size: 0.65rem !important;
    line-height: 0.85rem !important;
    height: 100% !important;
    width: 100% !important;
    margin-bottom: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    overflow: hidden !important;
  }
  
  /* Card styling for daily view */
  :global(.gantt-card-wrapper .job-card-daily) {
    padding: 0.25rem !important;
    font-size: 0.75rem !important;
    line-height: 1rem !important;
    height: 100% !important;
    width: 100% !important;
    margin-bottom: 0 !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  
  /* Date display styling */
  .date-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.6rem;
  }
  
  .date-day {
    font-weight: 600;
  }
  
  .date-date {
    font-size: 0.6rem;
  }
  
  /* Today highlight */
  .today-column {
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .today-header {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  /* Empty cell styling */
  .empty-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
    font-size: 0.65rem;
  }
  
  /* Responsive design for larger screens */
  @media (min-width: 480px) {
    td.cell-square {
      height: 70px;
      width: 60px;
      min-width: 60px;
      max-width: 60px;
    }
    
    th.header-square {
      width: 60px;
      min-width: 60px;
      max-width: 60px;
    }
    
    .tech-column {
      width: 70px;
      min-width: 70px;
      max-width: 70px;
    }
    
    .date-display {
      font-size: 0.65rem;
    }
    
    .date-date {
      font-size: 0.65rem;
    }
    
    :global(.gantt-card-wrapper .job-card) {
      font-size: 0.7rem !important;
      line-height: 0.9rem !important;
      padding: 0.2rem !important;
    }
    
    .tech-name-vertical {
      font-size: 0.7rem;
    }
  }
  
  @media (min-width: 640px) {
    td.cell-square {
      height: 80px;
      width: 70px;
      min-width: 70px;
      max-width: 70px;
      padding: 2px !important;
    }
    
    th.header-square {
      width: 70px;
      min-width: 70px;
      max-width: 70px;
    }
    
    .tech-column {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    
    .date-display {
      font-size: 0.7rem;
    }
    
    .date-date {
      font-size: 0.7rem;
    }
    
    :global(.gantt-card-wrapper .job-card) {
      padding: 0.2rem !important;
    }
    
    .tech-name-vertical {
      font-size: 0.75rem;
      writing-mode: horizontal-tb;
      transform: rotate(0);
      padding: 0;
    }
  }
  
  @media (min-width: 768px) {
    td.cell-square {
      height: 90px;
      width: 90px;
      min-width: 90px;
      max-width: 90px;
    }
    
    th.header-square {
      width: 90px;
      min-width: 90px;
      max-width: 90px;
    }
    
    .tech-column {
      width: 90px;
      min-width: 90px;
      max-width: 90px;
    }
    
    .date-display {
      font-size: 0.75rem;
    }
    
    .date-date {
      font-size: 0.75rem;
    }
    
    :global(.gantt-card-wrapper .job-card) {
      font-size: 0.75rem !important;
      line-height: 1rem !important;
    }
  }
  
  @media (min-width: 1024px) {
    td.cell-square {
      height: 110px;
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }
    
    th.header-square {
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }
    
    .tech-column {
      width: 120px;
      min-width: 120px;
      max-width: 120px;
    }
  }
</style>

<div class="gantt-chart">
  <!-- Chart Header - Mobile-first design -->
  <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-2 md:space-y-0">
    <h2 class="text-xl font-bold">Technician Schedule</h2>
    
    <!-- Navigation and view controls -->
    <div class="flex flex-wrap gap-2 items-center">
      <!-- Navigation controls - simplified on mobile -->
      <div class="flex items-center space-x-1">
        <button class="btn btn-sm bg-white shadow-sm border border-gray-300 hover:bg-gray-50 p-1" on:click={navigatePrevious} aria-label="Previous">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button class="btn btn-sm bg-white shadow-sm border border-gray-300 hover:bg-gray-50 text-xs px-2 py-1" on:click={goToToday}>
          {viewType === 'weekly' ? 'Current Week' : 'Today'}
        </button>
        
        <button class="btn btn-sm bg-white shadow-sm border border-gray-300 hover:bg-gray-50 p-1" on:click={navigateNext} aria-label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Current date display -->
      <div class="px-2 font-medium text-xs md:text-sm whitespace-nowrap">
        {#if viewType === 'daily'}
          <span class="font-bold">{formatDate(selectedDate, true)}</span>
        {:else}
          <span class="font-bold">Week of {formatDate(dateRange[0], false)}</span>
        {/if}
      </div>
      
      <!-- View type toggles -->
      <div class="md:ml-2 md:border-l md:pl-2">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button 
            class="px-2 py-1 text-xs border {viewType === 'daily' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-gray-300 text-gray-700'} rounded-l-md"
            on:click={setDailyView}
          >
            Daily
          </button>
          <button 
            class="px-2 py-1 text-xs border {viewType === 'weekly' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-gray-300 text-gray-700'} rounded-r-md border-l-0"
            on:click={setWeeklyView}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="ml-auto mr-0 flex gap-1">
        <button class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs px-2.5 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
            <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
          Assign
        </button>
        <button class="btn btn-sm bg-green-600 hover:bg-green-700 text-white shadow-sm text-xs px-2.5 py-1 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Export
        </button>
      </div>
    </div>
  </div>
  
  <!-- Weekly View (Grid) - Special mobile optimization -->
  {#if viewType === 'weekly'}
    <div class="schedule-container">
      <div class="bg-gray-50 px-4 py-3 border-b">
        <h3 class="text-sm md:text-lg font-medium">Week of <span class="font-semibold">{formatDate(dateRange[0], true)}</span></h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b">
              <!-- Header for technician column -->
              <th class="tech-column px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r sticky left-0 z-10">
                Tech
              </th>
              
              <!-- Headers for date columns -->
              {#each dateRange as date, i}
                {@const isToday = new Date().toDateString() === date.toDateString()}
                <th class="header-square px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b {isToday ? 'today-header' : ''}">
                  <div class="date-display">
                    <span class="date-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span class="date-date">{date.getMonth() + 1}/{date.getDate()}</span>
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#if !technicians || technicians.length === 0}
              <tr>
                <td colspan={dateRange.length + 1} class="px-4 py-8 text-center text-gray-500">
                  No technicians available.
                </td>
              </tr>
            {:else}
              {#each technicianJobs as row}
                <tr class="border-b border-gray-100">
                  <!-- Technician name column - sticky on mobile with vertical text -->
                  <td class="tech-column px-1 py-1 text-left text-xs font-medium border-r sticky left-0 z-10 bg-gray-50">
                    <div class="tech-name-vertical truncate max-w-full" title={row.technician.firstName + ' ' + row.technician.lastName}>
                      {row.technician.firstName} {row.technician.lastName.charAt(0)}
                    </div>
                  </td>
                  
                  <!-- Cell for each date -->
                  {#each row.dates as dateData, i}
                    {@const isToday = new Date().toDateString() === dateData.date.toDateString()}
                    <td class="cell-square border-r border-dashed border-gray-100 align-top overflow-hidden {isToday ? 'today-column' : ''}">
                      <div class="h-full w-full">
                        {#if dateData.jobs && dateData.jobs.length > 0}
                          {#if dateData.jobs.length === 1}
                            <!-- Single job fills the whole cell -->
                            <div class="gantt-card-wrapper">
                              <GanttJobCard job={dateData.jobs[0]} small={true} />
                            </div>
                          {:else}
                            <!-- Multiple jobs in a cell get split into a grid -->
                            <div class="grid grid-cols-{Math.min(2, dateData.jobs.length)} grid-rows-{Math.ceil(dateData.jobs.length/2)} gap-1 h-full">
                              {#each dateData.jobs as job}
                                <div class="gantt-card-wrapper">
                                  <GanttJobCard {job} small={true} />
                                </div>
                              {/each}
                            </div>
                          {/if}
                        {:else}
                          <div class="empty-cell">
                            -
                          </div>
                        {/if}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  <!-- Daily View (Grid) -->
  {:else}
    <div class="schedule-container">
      <div class="bg-gray-50 px-4 py-3 border-b">
        <h3 class="text-lg font-medium">Jobs Scheduled for <span class="font-semibold">{formatDate(dateRange[0], true)}</span></h3>
      </div>
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <!-- Header for technician column -->
            <th class="tech-column px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
              Technician
            </th>
            
            <!-- Header for the single date column -->
            <th class="header-daily px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Show loading state when technicians are not loaded yet -->
          {#if technicians.length === 0}
            {#each Array(3) as _, i}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td class="px-2 py-2 cell-daily border-r border-dashed border-gray-100">
                </td>
              </tr>
            {/each}
          {:else}
            <!-- Render rows for each technician -->
            {#each technicianJobs as row}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="text-sm font-medium text-gray-900 truncate">{row.technician.firstName} {row.technician.lastName}</div>
                </td>
                
                <!-- Render cell for the single date -->
                <td class="cell-daily border-r border-dashed border-gray-100 align-top overflow-hidden">
                  <div class="h-full w-full">
                    {#if row.dates[0].jobs && row.dates[0].jobs.length > 0}
                      <div class="space-y-1 h-full">
                        {#each row.dates[0].jobs as job}
                          <div class="gantt-card-wrapper">
                            <div 
                              class="job-card-daily {getStatusStyle(job.status).bgClass} border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex"
                              on:click={() => goto(`/jobs/${job.id}`)}
                              on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && goto(`/jobs/${job.id}`)}
                              tabindex="0"
                              role="button"
                              aria-label="View job {job.jobNumber}"
                            >
                              <div class="text-xs font-bold {getStatusStyle(job.status).textClass} mr-2">{job.jobNumber}</div>
                              <div class="text-xs {getStatusStyle(job.status).textClass} truncate flex-grow">{job.title || 'Untitled Job'}</div>
                              <div class="text-xs {getStatusStyle(job.status).textClass} opacity-75">
                                {job.status}
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <div class="empty-cell">
                        No jobs scheduled
                      </div>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
          
          <!-- Empty state row when no technicians have jobs on this date -->
          {#if technicianJobs.length > 0 && technicianJobs.every(tech => !tech.dates[0].jobs || tech.dates[0].jobs.length === 0)}
            <tr>
              <td colspan="2" class="px-6 py-8 text-center text-gray-500">
                No jobs scheduled for this date.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</div>
