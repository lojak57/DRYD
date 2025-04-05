import { JobStatus } from '$lib/types/Job';
import type { Job } from '$lib/types/Job';
import { Role } from '$lib/types/User';
import type { WorkflowTask } from '$lib/config/workflowConfig';

/**
 * Determines if a job is completed from a specific technician's perspective.
 * A job is considered "completed by technician" if:
 * 1. The job status is past technician involvement (COMPLETED, INVOICE_APPROVAL, INVOICED, PAID), OR
 * 2. All tasks required from technicians for the job have been completed
 * 
 * @param job The job to check
 * @param technicianId The ID of the technician to check
 * @param workflowConfig Configuration containing tasks by status
 * @returns Boolean indicating if the job is completed from the technician's perspective
 */
export function isJobCompletedByTechnician(
  job: Job, 
  technicianId: string, 
  workflowConfig: Record<JobStatus, WorkflowTask[]>
): boolean {
  // Check if job exists
  if (!job) return false;

  // Check if technician is assigned to this job
  if (!job.assignedUserIds?.includes(technicianId)) {
    return false; // Not assigned, so not relevant for completion
  }

  // Define statuses past technician involvement
  const pastTechStatusesArr = [
    JobStatus.COMPLETED,
    JobStatus.INVOICE_APPROVAL, 
    JobStatus.INVOICED, 
    JobStatus.PAID,
    JobStatus.CANCELLED
  ];

  // If job is already in one of these statuses, it's completed from technician perspective
  if (pastTechStatusesArr.includes(job.status)) {
    return true;
  }

  // Check if job is in PENDING_COMPLETION status, which means tech work is done
  if (job.status === JobStatus.PENDING_COMPLETION) {
    return true;
  }

  // If job is in IN_PROGRESS status, check if all technician tasks are completed
  if (job.status === JobStatus.IN_PROGRESS && job.completionTasks) {
    // Check specific completion tasks for technicians
    return (
      job.completionTasks.finalReadingsLogged === true &&
      job.completionTasks.afterPhotosTaken === true &&
      job.completionTasks.mark_ready_for_review === true
    );
  }

  // Find all tasks that require technician role across all relevant statuses
  const technicianTasks: WorkflowTask[] = [];

  // Collect tasks from workflow steps up to PENDING_COMPLETION
  // This covers all statuses where techs might have tasks
  const relevantStatuses = [
    JobStatus.NEW,
    JobStatus.SCHEDULED,
    JobStatus.IN_PROGRESS
  ];

  relevantStatuses.forEach(status => {
    const statusTasks = workflowConfig[status] || [];
    
    // Filter for tasks that require technician role
    const techTasks = statusTasks.filter(task => 
      task.requiredRole?.includes(Role.TECH)
    );
    
    technicianTasks.push(...techTasks);
  });

  // If there are no technician tasks, consider it complete
  if (technicianTasks.length === 0) {
    return true;
  }

  // For IN_PROGRESS jobs, look for completion tasks instead of completedTaskIds
  // which isn't in the Job type
  if (job.status === JobStatus.IN_PROGRESS && job.completionTasks) {
    // Check if each completion task that corresponds to a tech task is complete
    // Map workflow task IDs to completion task properties
    const taskToCompletionMap: Record<string, keyof typeof job.completionTasks> = {
      'log_final_readings': 'finalReadingsLogged',
      'upload_after_photos': 'afterPhotosTaken',
      'mark_ready_for_review': 'mark_ready_for_review'
    };
    
    // Check if all tech tasks have corresponding completion tasks marked as true
    return technicianTasks.every(task => {
      const completionKey = taskToCompletionMap[task.id];
      return completionKey ? job.completionTasks?.[completionKey] === true : true;
    });
  }

  // If we reach here, the job is not completed from the technician's perspective
  return false;
}

/**
 * Groups jobs into technician-specific categories:
 * - Unscheduled: Jobs assigned but not yet scheduled or in progress
 * - Active: Jobs that are scheduled or in progress
 * - Completed: Jobs completed from the technician's perspective
 * 
 * @param jobs Array of jobs to categorize
 * @param technicianId ID of the technician
 * @param workflowConfig Configuration containing tasks by status
 * @returns Object with categorized job arrays
 */
export function categorizeTechnicianJobs(
  jobs: Job[], 
  technicianId: string, 
  workflowConfig: Record<JobStatus, WorkflowTask[]>
): { unscheduled: Job[], active: Job[], completed: Job[] } {
  // Filter only jobs assigned to this technician
  const techJobs = jobs.filter(job => job.assignedUserIds?.includes(technicianId));
  
  return {
    // Unscheduled: NEW jobs
    unscheduled: techJobs.filter(job => job.status === JobStatus.NEW),
    
    // Active: SCHEDULED or IN_PROGRESS, but not completed by technician
    active: techJobs.filter(job => 
      (job.status === JobStatus.SCHEDULED || job.status === JobStatus.IN_PROGRESS) &&
      !isJobCompletedByTechnician(job, technicianId, workflowConfig)
    ),
    
    // Completed: Completed from technician perspective
    completed: techJobs.filter(job => 
      isJobCompletedByTechnician(job, technicianId, workflowConfig)
    )
  };
} 