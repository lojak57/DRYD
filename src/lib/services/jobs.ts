import mockJobs from '$lib/mock/jobs.json';
import type { Job } from '$lib/types/Job';
import { JobStatus, type JobType, type CompletionTasks } from '$lib/types/Job';
import { getCustomers } from '$lib/services/customers';
import { customers } from '$lib/stores/customerStore';
import { get } from 'svelte/store';
import { _jobs } from '$lib/stores/jobStore';

// Simulate API delay (between 100-500ms)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));

/**
 * Convert ISO date strings to Date objects
 */
function parseJobDates(job: any): Job {
  // Create a copy and convert date strings to Date objects
  const parsedJob = { ...job };
  
  if (typeof parsedJob.incidentDate === 'string') {
    parsedJob.incidentDate = new Date(parsedJob.incidentDate);
  }
  
  if (typeof parsedJob.createdAt === 'string') {
    parsedJob.createdAt = new Date(parsedJob.createdAt);
  }
  
  if (typeof parsedJob.scheduledStartDate === 'string') {
    parsedJob.scheduledStartDate = new Date(parsedJob.scheduledStartDate);
  }
  
  if (typeof parsedJob.estimatedCompletionDate === 'string') {
    parsedJob.estimatedCompletionDate = new Date(parsedJob.estimatedCompletionDate);
  }
  
  if (typeof parsedJob.completedDate === 'string') {
    parsedJob.completedDate = new Date(parsedJob.completedDate);
  }
  
  return parsedJob as Job;
}

/**
 * Get all jobs with optional filtering
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobs(): Promise<Job[]> {
  await simulateDelay();
  
  // Dynamically import the jobs.json to avoid caching
  const jobsModule = await import('$lib/mock/jobs.json');
  return (jobsModule.default as any[]).map(job => parseJobDates(job));
}

/**
 * Get a specific job by its ID
 * @param id The job ID to look for
 * @returns Promise resolving to a Job object or undefined if not found
 */
export async function getJobById(id: string): Promise<Job | undefined> {
  await simulateDelay();
  
  // Dynamically import the jobs.json to avoid caching
  const jobsModule = await import('$lib/mock/jobs.json');
  const job = (jobsModule.default as any[]).find(job => job.id === id);
  return job ? parseJobDates(job) : undefined;
}

/**
 * Get jobs for a specific customer
 * @param customerId The customer ID to filter by
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByCustomer(customerId: string): Promise<Job[]> {
  await simulateDelay();
  
  // Dynamically import the jobs.json to avoid caching
  const jobsModule = await import('$lib/mock/jobs.json');
  const jobs = (jobsModule.default as any[]).filter(job => job.customerId === customerId);
  return jobs.map(job => parseJobDates(job));
}

/**
 * Get jobs assigned to a specific technician
 * @param userId The technician's user ID
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByTechnician(userId: string): Promise<Job[]> {
  await simulateDelay();
  
  // Dynamically import the jobs.json to avoid caching
  const jobsModule = await import('$lib/mock/jobs.json');
  const jobs = (jobsModule.default as any[]).filter(job => job.assignedUserIds.includes(userId));
  return jobs.map(job => parseJobDates(job));
}

/**
 * Get jobs filtered by status
 * @param status The job status to filter by
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  await simulateDelay();
  
  // Dynamically import the jobs.json to avoid caching
  const jobsModule = await import('$lib/mock/jobs.json');
  const jobs = (jobsModule.default as any[]).filter(job => job.status === status);
  return jobs.map(job => parseJobDates(job));
}

/**
 * Update a job's status
 * @param jobId The ID of the job to update
 * @param status The new job status
 * @returns Promise resolving to the updated job
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
  console.log(`%c updateJobStatus - Updating job ${jobId} to status: ${status} %c`, 
    'background: #2196F3; color: white; padding: 2px 5px; border-radius: 3px;', '');
  
  // Enhanced logging for PAID status specifically
  if (status === JobStatus.PAID) {
    console.log(`%c CRITICAL: Setting job ${jobId} to PAID status %c`, 
      'background: #E91E63; color: white; font-weight: bold; padding: 4px 8px; border-radius: 3px;', '');
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Find the job in the mock data
    const jobsData = get(_jobs);
    const jobIndex = jobsData.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
      console.error(`Job with ID ${jobId} not found.`);
      return null;
    }
    
    // Create updated job with new status
    const updatedJob = {
      ...jobsData[jobIndex],
      status,
      // If setting to completed, set completion date
      ...(status === JobStatus.COMPLETED ? { completedDate: new Date() } : {})
    };
    
    console.log(`updateJobStatus - Created updated job with status ${status}:`, updatedJob);
    
    // Update our local mock data
    mockJobs[jobIndex] = { ...mockJobs[jobIndex], status };
    
    // Update the store - THIS IS CRITICAL!
    _jobs.update(currentJobs => {
      const newJobs = [...currentJobs];
      newJobs[jobIndex] = updatedJob;
      console.log(`updateJobStatus - Updating job store with updated job (status: ${status})`);
      return newJobs;
    });
    
    // Force notification of subscribers that job data has changed
    // This is important for reactive UI updates
    setTimeout(() => {
      _jobs.update(jobs => {
        console.log('Forcing job store refresh to ensure UI updates');
        return [...jobs];
      });
    }, 100);
    
    // Return a copy of the updated job
    return JSON.parse(JSON.stringify(updatedJob));
  } catch (error) {
    console.error('Error in updateJobStatus:', error);
    return null;
  }
}

/**
 * Create a new job with the provided job data
 * @param jobData The data for the new job
 * @returns The newly created job
 */
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status' | 'jobNumber' | 'equipmentIds'>): Promise<Job> {
  // Simulate API delay
  await simulateDelay();
  
  // Validate customer ID exists
  const customers = await getCustomers();
  const customerExists = customers.some(customer => customer.id === jobData.customerId);
  if (!customerExists) {
    throw new Error(`Customer with ID ${jobData.customerId} not found`);
  }
  
  // Dynamically get the latest mock jobs data
  const jobsModule = await import('$lib/mock/jobs.json');
  const mockJobsData = jobsModule.default as any[];
  
  // Generate a unique job ID
  const jobId = `job-${Date.now()}`;
  
  // Generate a job number
  const jobNumber = `J-${new Date().getFullYear()}-${String(mockJobsData.length + 1).padStart(3, '0')}`;
  
  // Create the new job object
  const newJob = {
    ...jobData,
    id: jobId,
    jobNumber,
    status: JobStatus.NEW,
    createdAt: new Date().toISOString(),
    equipmentIds: [],
    completedDate: null,
    completionTasks: {
      finalReadingsLogged: false,
      afterPhotosTaken: false,
      allEquipmentRemoved: false
    }
  };
  
  // Add the new job to the mock data
  mockJobsData.unshift(newJob);
  
  // Also update the store directly to ensure it's visible immediately
  const parsedJob = parseJobDates(newJob);
  _jobs.update(currentJobs => [parsedJob, ...currentJobs]);
  
  // Return the new job with dates parsed
  return parsedJob;
}

/**
 * Update a job
 */
export async function updateJob(jobId: string, updateData: Partial<Job>): Promise<Job | null> {
  console.log('updateJob - Updating job with data:', updateData);
  
  if (!jobId) {
    console.error('Job ID is undefined or empty. Cannot update job.');
    return null;
  }
  
  try {
    // Simulate API delay
    await simulateDelay();
    
    // Find the job in our data
    const jobsData = get(_jobs);
    const jobIndex = jobsData.findIndex(j => j.id === jobId);
    
    if (jobIndex === -1) {
      console.error(`Job with ID ${jobId} not found.`);
      return null;
    }
    
    // Convert date strings to Date objects
    if (updateData.scheduledStartDate && typeof updateData.scheduledStartDate === 'string') {
      console.log('Converting scheduledStartDate from string to Date:', updateData.scheduledStartDate);
      updateData.scheduledStartDate = new Date(updateData.scheduledStartDate);
    }
    
    if (updateData.estimatedCompletionDate && typeof updateData.estimatedCompletionDate === 'string') {
      updateData.estimatedCompletionDate = new Date(updateData.estimatedCompletionDate);
    }
    
    if (updateData.completedDate && typeof updateData.completedDate === 'string') {
      updateData.completedDate = new Date(updateData.completedDate);
    }
    
    // Create updated job object
    const updatedJob: Job = {
      ...jobsData[jobIndex],
      ...updateData
    };
    
    console.log('updateJob - Updated job:', updatedJob, 'scheduledStartDate:', updatedJob.scheduledStartDate);
    
    // Update in the mock data
    const mockIndex = mockJobs.findIndex(j => j.id === jobId);
    if (mockIndex !== -1) {
      mockJobs[mockIndex] = {
        ...mockJobs[mockIndex],
        ...updateData
      } as any;
    }
    
    // Update the store
    _jobs.update(currentJobs => {
      const newJobs = [...currentJobs];
      newJobs[jobIndex] = updatedJob;
      return newJobs;
    });
    
    // Return a copy of the updated job
    return JSON.parse(JSON.stringify(updatedJob));
  } catch (err) {
    console.error('Error updating job:', err);
    return null;
  }
}

/**
 * Update a job's completion tasks with a complete tasks object
 */
export async function updateJobCompletionTask(
  jobId: string,
  tasks: CompletionTasks
): Promise<Job | null>;

/**
 * Update a job's completion task
 * @param jobId The ID of the job to update
 * @param taskKey The key of the completion task to update
 * @param value The new value for the task
 * @returns Promise resolving to the updated job
 */
export async function updateJobCompletionTask(
  jobId: string, 
  taskKeyOrTasks: keyof CompletionTasks | CompletionTasks, 
  value?: boolean
): Promise<Job | null> {
  // Simulate API delay
  await simulateDelay();
  
  // Find the job in our data
  const jobsData = get(_jobs);
  const jobIndex = jobsData.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    console.error(`Job with ID ${jobId} not found.`);
    return null;
  }
  
  const job = jobsData[jobIndex];
  
  // If completionTasks doesn't exist yet, initialize it
  if (!job.completionTasks) {
    job.completionTasks = {
      finalReadingsLogged: false,
      afterPhotosTaken: false,
      mark_ready_for_review: false
    };
  }
  
  // Handle the case where a full CompletionTasks object is provided
  if (typeof taskKeyOrTasks === 'object') {
    // Create updated job with the updated tasks object
    const updatedJob = {
      ...job,
      completionTasks: {
        ...job.completionTasks,
        ...taskKeyOrTasks
      }
    };
    
    // Update in the mock data
    const mockIndex = mockJobs.findIndex(job => job.id === jobId);
    if (mockIndex !== -1) {
      if (!(mockJobs as any[])[mockIndex].completionTasks) {
        (mockJobs as any[])[mockIndex].completionTasks = {
          finalReadingsLogged: false,
          afterPhotosTaken: false,
          mark_ready_for_review: false
        };
      }
      
      (mockJobs as any[])[mockIndex].completionTasks = {
        ...(mockJobs as any[])[mockIndex].completionTasks,
        ...taskKeyOrTasks
      };
    }
    
    // Update the store
    _jobs.update(currentJobs => {
      const newJobs = [...currentJobs];
      newJobs[jobIndex] = updatedJob;
      return newJobs;
    });
    
    // Return a copy of the updated job
    return JSON.parse(JSON.stringify(updatedJob));
  } 
  // Handle the case where a single task key and value are provided
  else if (typeof value === 'boolean') {
    const taskKey = taskKeyOrTasks as keyof CompletionTasks;
    
    // Create updated job with the updated task
    const updatedJob = {
      ...job,
      completionTasks: {
        ...job.completionTasks,
        [taskKey]: value
      }
    };
    
    // Update in the mock data
    const mockIndex = mockJobs.findIndex(job => job.id === jobId);
    if (mockIndex !== -1) {
      if (!(mockJobs as any[])[mockIndex].completionTasks) {
        (mockJobs as any[])[mockIndex].completionTasks = {
          finalReadingsLogged: false,
          afterPhotosTaken: false,
          mark_ready_for_review: false
        };
      }
      
      (mockJobs as any[])[mockIndex].completionTasks[taskKey] = value;
    }
    
    // Update the store
    _jobs.update(currentJobs => {
      const newJobs = [...currentJobs];
      newJobs[jobIndex] = updatedJob;
      return newJobs;
    });
    
    // Return a copy of the updated job
    return JSON.parse(JSON.stringify(updatedJob));
  }
  
  return null;
} 