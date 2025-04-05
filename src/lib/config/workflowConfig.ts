import { JobStatus } from '$lib/types/Job';
import { Role } from '$lib/types/User';
import type { CompletionTasks } from '$lib/types/Job';

export const JOB_WORKFLOW_STEPS: { status: JobStatus, label: string }[] = [
    // Assuming Quote Acceptance implicitly means we start at 'NEW' or 'SCHEDULED'
    // Let's represent the *start* as the quote being accepted implicitly.
    // We'll display the *first real job status* as the initial active step.
    { status: JobStatus.NEW, label: 'New Job' },
    { status: JobStatus.SCHEDULED, label: 'Scheduled' },
    { status: JobStatus.IN_PROGRESS, label: 'Work In Progress' },
    { status: JobStatus.PENDING_COMPLETION, label: 'Review & Approval' },
    { status: JobStatus.COMPLETED, label: 'Job Complete' },
    { status: JobStatus.INVOICE_APPROVAL, label: 'Invoice Approval' },
    { status: JobStatus.INVOICED, label: 'Invoiced' },
    { status: JobStatus.PAID, label: 'Paid' }
];

// Define the order for comparison
export const statusOrder: JobStatus[] = JOB_WORKFLOW_STEPS.map(s => s.status);

// Add exports for WORKFLOW_ORDER and WORKFLOW_LABELS to fix imports
export const WORKFLOW_ORDER: JobStatus[] = statusOrder;
export const WORKFLOW_LABELS: Record<JobStatus, string> = Object.fromEntries(
    JOB_WORKFLOW_STEPS.map(step => [step.status, step.label])
) as Record<JobStatus, string>;

export interface WorkflowTask {
    id: string;           // Unique ID for this task type
    label: string;        // User-facing text
    requiredRole: Role[]; // Roles that can/must perform this task
    // Optional: Link to the relevant checklist item key if applicable
    checklistKey?: keyof CompletionTasks;
    // Optional: Description for the task
    description?: string;
    // Optional: Dependencies for the task
    dependsOn?: string[];
}

export const TASKS_BY_STATUS: { [key in JobStatus]?: WorkflowTask[] } = {
    [JobStatus.NEW]: [
        { id: 'schedule_job', label: 'Schedule Job Date', requiredRole: [Role.OFFICE, Role.ADMIN] },
        { id: 'assign_techs', label: 'Assign Technician(s)', requiredRole: [Role.OFFICE, Role.ADMIN] },
    ],
    [JobStatus.SCHEDULED]: [
        { id: 'confirm_dispatch', label: 'Confirm Technician Dispatched', requiredRole: [Role.OFFICE, Role.ADMIN] }
    ],
    [JobStatus.IN_PROGRESS]: [
        { id: 'log_final_readings', label: 'Log Final Moisture Readings', requiredRole: [Role.TECH], checklistKey: 'finalReadingsLogged' },
        { id: 'upload_after_photos', label: 'Upload "After" Photos', requiredRole: [Role.TECH], checklistKey: 'afterPhotosTaken' },
        { id: 'mark_ready_for_review', label: 'Submit for Office Review', requiredRole: [Role.TECH], dependsOn: ['log_final_readings', 'upload_after_photos'] }
    ],
    [JobStatus.PENDING_COMPLETION]: [
        { id: 'review_checklist', label: 'Review Technician Checklist', requiredRole: [Role.OFFICE, Role.ADMIN] },
        { id: 'enter_labor', label: 'Enter/Confirm Labor Hours', requiredRole: [Role.OFFICE, Role.ADMIN] },
        { id: 'finalize_job', label: 'Finalize Job & Costs', requiredRole: [Role.OFFICE, Role.ADMIN] }
    ],
    [JobStatus.COMPLETED]: [
        { id: 'create_invoice', label: 'Create & Submit Invoice', requiredRole: [Role.OFFICE, Role.ADMIN], description: 'Create an invoice and submit it for approval' }
    ],
    [JobStatus.INVOICE_APPROVAL]: [
        { id: 'review_invoice', label: 'Review & Approve Invoice', requiredRole: [Role.OFFICE, Role.ADMIN], description: 'Review the invoice before sending it to the customer' }
    ],
    [JobStatus.INVOICED]: [
        { id: 'apply_payment', label: 'Apply Customer Payment', requiredRole: [Role.OFFICE, Role.ADMIN], description: 'Record payment received for the generated invoice.' }
    ]
}; 