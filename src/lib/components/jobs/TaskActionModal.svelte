<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import type { WorkflowTask } from '$lib/config/workflowConfig';
  import type { User } from '$lib/types/User';
  import { Role } from '$lib/types/User';
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry, MoistureReadingData } from '$lib/types/LogEntry';
  import type { Address } from '$lib/types/Customer';
  import { addLogEntry } from '$lib/services/logEntries';
  import mockUsers from '$lib/mock/users.json'; // Direct import for troubleshooting
  import { getTechnicians } from '$lib/services/users';
  import ReadingForm from './ReadingForm.svelte';
  import PhotoUpload from './PhotoUpload.svelte';
  import TechnicianPicker from './TechnicianPicker.svelte';
  import JobSubmissionForm from './JobSubmissionForm.svelte';
  import ReviewChecklistForm from './ReviewChecklistForm.svelte';
  import LaborEntryForm from './LaborEntryForm.svelte';
  import JobFinalizeForm from './JobFinalizeForm.svelte';
  import InvoicePreview from '../invoice/InvoicePreview.svelte';
  import type { Task } from '$lib/types/Task';
  import AssignTechnicianForm from '../field/AssignTechnicianForm.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { updateJob, getJobById } from '$lib/services/jobs';
  import type { CustomLineItem } from '$lib/types/Job';
  import { type CompletionTasks } from '$lib/types/Job';
  import type { InvoicePayment } from '$lib/types/Invoice';
  import { updateJobStatus } from '$lib/services/jobs';
  import PaymentForm from '../invoice/PaymentForm.svelte';
  import ScheduleAndAssignForm from './ScheduleAndAssignForm.svelte';
  import ApplyPaymentForm from '$lib/components/financials/ApplyPaymentForm.svelte';
  
  // Define field types
  interface TextField {
    type: 'text';
    label: string;
    id: string;
    value?: string;
    required: boolean;
    description?: string;
  }
  
  interface DateField {
    type: 'date';
    label: string;
    id: string;
    value?: string;
    required: boolean;
    description?: string;
  }
  
  interface CheckboxField {
    type: 'checkbox';
    label: string;
    id: string;
    required: boolean;
    description?: string;
  }
  
  type FormField = TextField | DateField | CheckboxField;
  
  interface FormContent {
    title: string;
    description?: string;
    fields?: FormField[];
    component?: string;
  }
  
  export let isOpen: boolean = false;
  export let task: WorkflowTask;
  export let job: Job;
  export let logEntries: LogEntry[] = [];
  
  // Get current user from auth store
  let userInfo: User | null = null;
  currentUser.subscribe(user => {
    userInfo = user;
  });
  
  // Debug task received
  $: console.log('TaskActionModal - Task received:', task?.id, task);
  
  // Create event dispatcher for modal actions
  const dispatch = createEventDispatcher<{
    close: void;
    taskCompleted: { taskId: string, data?: any };
  }>();
  
  // Close the modal
  function closeModal() {
    console.log('TaskActionModal - Closing modal');
    dispatch('close');
  }
  
  // Complete the task with optional data
  function completeTask(data?: any) {
    console.log('TaskActionModal - Completing task with data:', data);
    
    // Create a proper content object with meaningful information
    const contentObject = {
      taskId: task.id,
      taskLabel: task.label,
      completed: true,
      timestamp: new Date(),
      ...(data || {})
    };
    
    // Record task completion in activity log
    addLogEntry({
      jobId: job.id,
      userId: 'user-1', // In a real app, would be the current user
      timestamp: new Date(),
      type: LogEntryType.TASK_COMPLETION,
      content: contentObject
    }).catch(err => {
      console.error('Error logging task completion:', err);
    });
    
    // Dispatch event to update UI - let parent handle closing
    console.log('Dispatching taskCompleted event for task:', task.id, 'with data:', data);
    dispatch('taskCompleted', { taskId: task.id, data });
  }
  
  // Handle outside click
  function handleOutsideClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }
  
  // Handle escape key
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  
  // Get form fields based on task type
  function getFormContent(): FormContent {
    console.log('TaskActionModal - Getting form content for task:', task?.id);
    
    if (!task) {
      console.error('TaskActionModal - No task provided!');
      return {
        title: 'Error',
        description: 'No task information provided'
      };
    }
    
    switch(task.id) {
      case 'schedule_job':
        console.log('TaskActionModal - Rendering schedule job form');
        return {
          title: 'Schedule Job Date',
          fields: [
            {
              type: 'date',
              label: 'Scheduled Start Date',
              id: 'scheduledStartDate',
              value: job.scheduledStartDate ? new Date(job.scheduledStartDate).toISOString().split('T')[0] : '',
              required: true
            },
            {
              type: 'date',
              label: 'Estimated Completion Date',
              id: 'estimatedCompletionDate',
              value: job.estimatedCompletionDate ? new Date(job.estimatedCompletionDate).toISOString().split('T')[0] : '',
              required: false
            }
          ]
        };
        
      case 'assign_techs':
        return {
          title: 'Assign Technicians',
          description: 'Select technicians to assign to this job',
          component: 'TechnicianPicker'
        };
        
      case 'confirm_dispatch':
        return {
          title: 'Confirm Technician Dispatch',
          description: 'Confirm that technicians have been dispatched to the job site',
          fields: [
            {
              type: 'checkbox',
              label: 'I confirm that technicians have been dispatched to the job site',
              id: 'dispatchConfirmed',
              required: true,
              description: 'Marking this will move the job to IN_PROGRESS status'
            }
          ]
        };
        
      case 'log_final_readings':
        return {
          title: 'Log Final Moisture Readings',
          description: 'Enter the final moisture readings from the job site',
          component: 'ReadingForm'
        };
        
      case 'upload_after_photos':
        return {
          title: 'Upload "After" Photos',
          description: 'Upload photos of the completed work',
          component: 'PhotoUpload'
        };
        
      case 'mark_ready_for_review':
        return {
          title: 'Submit Job for Office Review',
          description: 'Submit this job for office staff to review and mark as complete',
          component: 'JobSubmissionForm'
        };
        
      case 'review_checklist':
        return {
          title: 'Review Technician Checklist',
          description: 'Review the technician\'s work to ensure all required tasks have been completed properly',
          component: 'ReviewChecklistForm'
        };
        
      case 'enter_labor':
        return {
          title: 'Enter Labor Hours',
          description: 'Record the hours worked by each technician on this job',
          component: 'LaborEntryForm'
        };
        
      case 'finalize_job':
        return {
          title: 'Finalize Job & Costs',
          description: 'Complete job details and finalize all costs for invoice preparation',
          component: 'JobFinalizeForm'
        };
        
      case 'create_invoice':
        return {
          title: 'Create & Submit Invoice',
          description: 'Review the invoice details and submit it for approval',
          component: 'InvoicePreview'
        };
        
      case 'review_invoice':
        return {
          title: 'Review & Approve Invoice',
          description: 'Review the invoice before sending it to the customer',
          component: 'InvoicePreview'
        };
        
      case 'record_payment':
        return {
          title: 'Record Payment',
          description: 'Record payment information for this invoice',
          component: 'PaymentForm'
        };
        
      case 'add_reading':
        return {
          title: 'Add Moisture Reading',
          description: 'Enter a new moisture reading',
          component: 'ReadingForm'
        };
        
      case 'apply_payment':
        return {
          title: 'Apply Payment',
          description: 'Apply payment to the job',
          component: 'ApplyPaymentForm'
        };
        
      default:
        return {
          title: task.label,
          description: 'Complete this task to proceed with the workflow',
          component: 'GenericForm'
        };
    }
  }
  
  const formContent = getFormContent();
  let formData: Record<string, any> = {};
  
  let technicians: User[] = [];
  let selectedTechnicians: string[] = job.assignedUserIds ? [...job.assignedUserIds] : [];
  let isLoading = true;
  let loadError: string | null = null;
  
  // Reading form fields
  let location = '';
  let customLocation = '';
  let material = '';
  let customMaterial = '';
  let readingValue = '';
  let readingSubmitting = false;
  let readingError = '';
  let showCustomLocation = false;
  let showCustomMaterial = false;
  
  // Common room/areas in a building
  const commonLocations = [
    'Kitchen',
    'Living Room',
    'Master Bedroom',
    'Bedroom 2',
    'Bedroom 3',
    'Bathroom',
    'Master Bathroom',
    'Basement',
    'Attic',
    'Hallway',
    'Dining Room',
    'Garage',
    'Laundry Room',
    'Utility Room',
    'Office',
    'Foyer/Entryway',
    'Closet',
    'Stairwell',
    'Other (specify)'
  ];
  
  // Wall locations or specific positions
  const positionOptions = [
    'North Wall',
    'South Wall',
    'East Wall',
    'West Wall',
    'Ceiling',
    'Floor',
    'Under Window',
    'Behind Cabinet',
    'Behind Appliance',
    'Inside Wall Cavity',
    'Structural Beam',
    'Floor Joist',
    'Ceiling Joist',
    'Baseboard',
    'Other (specify)'
  ];
  
  // Common materials that might be measured for moisture
  const materialOptions = [
    'Drywall/Gypsum',
    'Wood Framing',
    'Plywood',
    'Hardwood Flooring',
    'Engineered Wood',
    'Laminate Flooring',
    'Carpet Pad',
    'Carpet',
    'Tile Substrate',
    'Concrete',
    'Masonry/Brick',
    'Insulation',
    'OSB Board',
    'MDF',
    'Ceiling Tile',
    'Subfloor',
    'Furniture',
    'Cabinets',
    'Other (specify)'
  ];
  
  // Define moisture level types
  type MoistureLevel = 'dry' | 'normal' | 'wet' | 'unknown';
  
  // Define the range interface
  interface MoistureRange {
    dry: string;
    normal: string;
    wet: string;
  }
  
  // Reference ranges for different materials with index signature
  const moistureRanges: { [key: string]: MoistureRange } = {
    'Drywall/Gypsum': { dry: '0-0.5%', normal: '0.5-1%', wet: '1%+' },
    'Wood Framing': { dry: '7-10%', normal: '10-15%', wet: '16%+' },
    'Plywood': { dry: '6-10%', normal: '10-14%', wet: '15%+' },
    'Hardwood Flooring': { dry: '6-9%', normal: '9-12%', wet: '13%+' },
    'Concrete': { dry: '0-3%', normal: '3-5%', wet: '5%+' }
  };
  
  // Handle location selection
  function handleLocationChange() {
    if (location === 'Other (specify)') {
      showCustomLocation = true;
      customLocation = '';
    } else {
      showCustomLocation = false;
    }
  }
  
  // Handle material selection
  function handleMaterialChange() {
    if (material === 'Other (specify)') {
      showCustomMaterial = true;
      customMaterial = '';
    } else {
      showCustomMaterial = false;
    }
  }
  
  // Get the full location string
  function getFullLocation() {
    if (location === 'Other (specify)' && customLocation) {
      return customLocation.trim();
    }
    return location;
  }
  
  // Get the full material string
  function getFullMaterial() {
    if (material === 'Other (specify)' && customMaterial) {
      return customMaterial.trim();
    }
    return material;
  }
  
  // Determine moisture level based on value and material
  function getMoistureLevel(value: number, material: string): MoistureLevel {
    const ranges = moistureRanges[material];
    if (!ranges) return 'unknown';
    
    const numValue = parseFloat(value.toString());
    
    // Extract the upper bound of the "normal" range to use as threshold
    const wetThreshold = parseFloat(ranges.wet.split('+')[0]);
    const dryThreshold = parseFloat(ranges.dry.split('-')[1]);
    
    if (numValue >= wetThreshold) return 'wet';
    if (numValue <= dryThreshold) return 'dry';
    return 'normal';
  }
  
  // Photo upload form fields
  let selectedFile: File | null = null;
  let photoCaption = '';
  let photoSubmitting = false;
  let photoError = '';
  let photoPreviewUrl: string | null = null;
  
  // Directly access mock data for debugging
  const mockTechnicians = (mockUsers as any[]).filter(user => 
    (user.role === 'TECH' || user.role === 'TECHNICIAN') && 
    user.isActive
  );
  
  console.log('Raw mock technician data:', mockTechnicians);
  
  // Handle invoice creation 
  function handleInvoiceCreation() {
    // Create a log entry for invoice creation
    console.log('Creating invoice for job:', job);

    // Log any line items found in the job
    console.log('Job line items:', job.lineItems);
    console.log('Job costs:', { 
      laborCost: job.laborCost, 
      materialsCost: job.materialsCost, 
      equipmentCost: job.equipmentCost 
    });
    
    // Create invoice data
    const invoiceData = {
      invoiceNumber: `INV-${job.jobNumber.replace('J-', '')}-${new Date().getFullYear()}`,
      invoiceDate: new Date(),
      invoiceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      timestamp: new Date(),
      taskType: 'create_invoice'
    };
    
    // Update job with invoice information and change status
    updateJob(job.id, {
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      invoiceDueDate: invoiceData.invoiceDueDate,
      status: JobStatus.INVOICE_APPROVAL
    })
      .then(updatedJob => {
        if (updatedJob) {
          console.log('Job updated with invoice data and status changed to INVOICE_APPROVAL:', updatedJob);
          // Update local job object
          job = updatedJob;
        }
        
        // Complete the task
        completeTask(invoiceData);
      })
      .catch(error => {
        console.error('Error updating job with invoice data:', error);
        // Complete the task anyway to ensure workflow continues
        completeTask(invoiceData);
      });
  }
  
  // Function to refresh job data
  async function refreshJobData() {
    try {
      console.log('Refreshing job data for ID:', job.id);
      const refreshedJob = await getJobById(job.id);
      if (refreshedJob) {
        job = refreshedJob;
        console.log('Job refreshed, line items:', job.lineItems);
        return job;
      }
    } catch (err) {
      console.error('Error refreshing job data:', err);
      throw err;
    }
  }
  
  // Handle invoice review/approval
  function handleInvoiceApproval(event: CustomEvent) {
    console.log('Invoice approved with data:', event.detail);
    
    // Create a completion data object
    const data = {
      taskType: 'review_invoice',
      invoiceApproved: true,
      notes: 'Invoice reviewed and approved for customer',
      timestamp: new Date()
    };
    
    // Update the job status to INVOICED after approval
    updateJobStatus(job.id, JobStatus.INVOICED)
      .then(updatedJob => {
        if (updatedJob) {
          console.log('Job status updated to INVOICED:', updatedJob);
          // Update local job object
          job = updatedJob;
        }
        
        // Complete the task
        completeTask(data);
      })
      .catch(error => {
        console.error('Error updating job status to INVOICED:', error);
        // Complete the task anyway to ensure workflow continues
        completeTask(data);
      });
  }
  
  onMount(async () => {
    if (task.id === 'assign_techs') {
      console.log('TaskActionModal: Loading technicians...');
      isLoading = true;
      try {
        // Try loading from the service
        const techsFromService = await getTechnicians();
        console.log('Technicians from service:', techsFromService);
        
        if (techsFromService && techsFromService.length > 0) {
          technicians = techsFromService;
          console.log('Successfully loaded technicians from service, count:', technicians.length);
        } else {
          console.log('No technicians returned from service, falling back to direct mock data');
          // If service fails, fall back to direct access
          technicians = mockTechnicians.map(tech => ({
            ...tech,
            createdAt: new Date(tech.createdAt),
            updatedAt: new Date(tech.updatedAt)
          }));
          console.log('Loaded technicians from direct mock data, count:', technicians.length);
        }
      } catch (err) {
        console.error('Error loading technicians:', err);
        loadError = 'Failed to load technicians. Please try again.';
        
        // Final fallback - use hardcoded data
        console.log('Error occurred, falling back to hardcoded data');
        technicians = [
          {
            id: "tech-01",
            firstName: "Taylor",
            lastName: "Smith",
            name: "Taylor Smith",
            email: "taylor@dryadrestoration.com",
            role: Role.TECH,
            isActive: true,
            phoneNumber: "503-555-2222",
            createdAt: new Date("2023-01-20T09:30:00Z"),
            updatedAt: new Date("2023-01-20T09:30:00Z")
          },
          {
            id: "tech-02",
            firstName: "Jordan",
            lastName: "Chen",
            name: "Jordan Chen",
            email: "jordan@dryadrestoration.com",
            role: Role.TECH,
            isActive: true,
            phoneNumber: "503-555-3333",
            createdAt: new Date("2023-02-10T10:15:00Z"),
            updatedAt: new Date("2023-02-10T10:15:00Z")
          },
          {
            id: "tech-03",
            firstName: "Casey",
            lastName: "Johnson",
            name: "Casey Johnson",
            email: "casey@dryadrestoration.com",
            role: Role.TECH,
            isActive: true,
            phoneNumber: "503-555-4444",
            createdAt: new Date("2023-03-05T11:45:00Z"),
            updatedAt: new Date("2023-03-05T11:45:00Z")
          }
        ];
      } finally {
        isLoading = false;
      }
    }
  });
  
  function toggleTechnician(techId: string) {
    console.log('Toggling technician:', techId);
    if (selectedTechnicians.includes(techId)) {
      selectedTechnicians = selectedTechnicians.filter(id => id !== techId);
    } else {
      selectedTechnicians = [...selectedTechnicians, techId];
    }
    console.log('Selected technicians now:', selectedTechnicians);
  }
  
  // Handle generic form submission
  function handleSubmit(e: Event) {
    console.log('TaskActionModal - Form submitted for task:', task.id);
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const formElements = Array.from(form.elements) as HTMLInputElement[];
    
    // Build data object from form elements
    const data: Record<string, any> = {};
    formElements.forEach(el => {
      if (el.name) {
        if (el.type === 'checkbox') {
          data[el.name] = el.checked;
        } else {
          data[el.name] = el.value;
        }
      }
    });
    
    console.log('TaskActionModal - Form data:', data);
    
    // Handle specific tasks
    if (task.id === 'schedule_job') {
      // Update job scheduling data
      data.taskType = 'schedule';
      
      // Make sure the dates are properly formatted
      if (data.scheduledStartDate) {
        const startDate = new Date(data.scheduledStartDate);
        data.scheduledStartDate = startDate.toISOString().split('T')[0];
      }
      
      if (data.estimatedCompletionDate) {
        const endDate = new Date(data.estimatedCompletionDate);
        data.estimatedCompletionDate = endDate.toISOString().split('T')[0];
      }
      
      // Validate dates if both are set
      if (data.scheduledStartDate && data.estimatedCompletionDate) {
        const startDate = new Date(data.scheduledStartDate);
        const endDate = new Date(data.estimatedCompletionDate);
        if (endDate < startDate) {
          alert('Estimated completion date cannot be before the scheduled start date.');
          return;
        }
      }
      
      // IMPORTANT: Add job ID to ensure task is associated with the right job
      data.jobId = job.id;
      
      console.log('Completing schedule_job task with data:', data);
    } else if (task.id === 'confirm_dispatch') {
      // For dispatch confirmation, just need to confirm checkbox was checked
      if (!data.dispatchConfirmed) {
        alert('Please confirm that technicians have been dispatched.');
        return;
      }
      data.taskType = 'dispatch';
    } else if (task.id === 'mark_ready_for_review') {
      // For job submission form, we need a separate path since it needs special handling
      // But for generic forms, we can submit the data directly
      data.taskType = 'submit_for_review';
      data.notes = data.submissionNotes || 'Job submitted for office review';
    } else if (task.id === 'create_invoice') {
      // For invoice creation, now handled with the InvoicePreview component
      data.taskType = 'create_invoice';
      data.invoiceCreated = true;
      data.invoiceData = {
        invoiceNumber: `INV-${job.jobNumber.replace('J-', '')}-${new Date().getFullYear()}`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        laborCost: jobCosts.laborCost || 0,
        materialsCost: jobCosts.materialsCost || 0,
        equipmentCost: jobCosts.equipmentCost || 0
      };
      data.notes = 'Invoice created and submitted for approval';
      data.timestamp = new Date();
    }
    
    // Complete task with form data - only call this ONCE per submission
    completeTask(data);
  }
  
  // Handle moisture reading submission
  async function handleReadingSubmit(event: CustomEvent) {
    const readingData = event.detail;
    console.log('TaskActionModal - Reading submitted:', readingData);
    
    try {
      // Create a log entry from the reading data
      const logEntry = await addLogEntry({
        jobId: job.id,
        userId: userInfo?.id || job.assignedUserIds?.[0] || '', 
        timestamp: new Date(),
        type: LogEntryType.MOISTURE_READING,
        content: {
          location: readingData.location,
          material: readingData.material,
          value: readingData.value
        }
      });
      
      console.log('TaskActionModal - Log entry created:', logEntry);
      
      // Complete the task with the full reading data to ensure synchronization
      completeTask({
        ...readingData,
        notes: `Moisture reading: ${readingData.value}% in ${readingData.location} (${readingData.material})`
      });
    } catch (err) {
      console.error('Error adding moisture reading:', err);
      // You might want to show an error message to the user here
    }
  }
  
  function handlePhotoSubmit(event: CustomEvent) {
    console.log('Photo upload submitted:', event.detail);
    
    // Add specific photo task completion information - make sure we get the right key used
    const photoData = {
      ...event.detail,
      taskType: 'upload_photo',
      notes: `Photo uploaded: ${event.detail.caption || 'After photo'}`,
      isAfterPhoto: task.id === 'upload_after_photos',
      // IMPORTANT: Make sure we have the right completion task key for the page to sync
      checklistKey: 'afterPhotosTaken'
    };
    
    console.log('Completing photo task with enhanced data:', photoData);
    
    // Record the photo in activity log first
    addLogEntry({
      jobId: job.id,
      userId: userInfo?.id || job.assignedUserIds?.[0] || '',
      timestamp: new Date(),
      type: LogEntryType.PHOTO,
      content: {
        url: event.detail.url,
        caption: event.detail.caption || 'After photo',
        tags: ['after']
      }
    }).then(() => {
      console.log('Photo entry added to activity log');
      
      // Complete the task after photo is logged
      completeTask({
        ...photoData,
        alreadyLogged: true // Flag to prevent duplicate log entries
      });
    }).catch(err => {
      console.error('Error adding photo to activity log:', err);
      // Complete the task anyway to ensure workflow continues
      completeTask(photoData);
    });
  }
  
  function handleTechnicianSubmit(event: CustomEvent) {
    console.log('Technician selection submitted. Detail:', event.detail);
    if (!event.detail.assignedUserIds) {
      console.error('Missing assignedUserIds in technician submission');
      return;
    }
    
    // The AssignTechnicianForm already updates the job and creates a log entry
    // We just need to mark the task as complete and close the modal
    const data = {
      assignedUserIds: event.detail.assignedUserIds,
      taskType: 'assign_techs',
      timestamp: new Date()
    };
    
    console.log('Completing assign_techs task with data:', data);
    completeTask(data);
    closeModal();
  }
  
  function handleJobSubmissionSubmit(event: CustomEvent) {
    console.log('Job submission form submitted:', event.detail);
    
    // Create a completion data object
    const data = {
      ...event.detail,
      taskType: 'mark_ready_for_review',
      timestamp: new Date()
    };
    
    // Add a log entry for this submission
    addLogEntry({
      jobId: job.id,
      userId: userInfo?.id || 'unknown-user',
      timestamp: new Date(),
      type: LogEntryType.TASK_COMPLETION,
      content: {
        taskId: 'mark_ready_for_review',
        taskLabel: 'Submit for Office Review',
        notes: event.detail.submissionNotes,
        timestamp: new Date()
      }
    }).catch(err => {
      console.error('Error logging job submission:', err);
    });
    
    // Complete the task with the data
    completeTask(data);
  }
  
  // Handle form cancellation from child components
  function handleCancel() {
    closeModal();
  }
  
  // Clean up preview URLs
  onDestroy(() => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
  });
  
  // Store for job submission notes
  let submissionNotes = '';
  
  // Function to handle job submission
  function handleJobSubmission() {
    completeTask({
      submissionNotes,
      submittedBy: 'user-1', // Would be current user ID in production
      timestamp: new Date()
    });
  }
  
  // Add handlers for the new forms
  function handleReviewChecklistSubmit(event: CustomEvent) {
    console.log('Review checklist submitted:', event.detail);
    
    // Create a completion data object
    const data = {
      approved: event.detail.approved,
      reviewNotes: event.detail.reviewNotes,
      timestamp: new Date(),
      taskType: 'review_checklist'
    };
    
    completeTask(data);
  }
  
  function handleLaborEntrySubmit(event: CustomEvent) {
    console.log('Labor entries submitted:', event.detail);
    
    // Create a completion data object
    const data = {
      laborEntries: event.detail.laborEntries,
      totalHours: event.detail.totalHours,
      totalLaborCost: event.detail.totalLaborCost,
      timestamp: new Date(),
      taskType: 'enter_labor'
    };
    
    completeTask(data);
  }
  
  function handleJobFinalizeSubmit(event: CustomEvent) {
    console.log('Job finalized with data:', event.detail);
    
    // Store the finalized job cost data for invoice generation
    console.log('Storing job cost data for invoice:', event.detail);
    
    // Create a completion data object with all job costs
    const data = {
      ...event.detail,
      timestamp: new Date(),
      taskType: 'finalize_job'
    };
    
    // Update the job object with the finalization data
    const updatedJobData = {
      laborCost: event.detail.laborCost || 0,
      materialsCost: event.detail.materialsCost || 0,
      equipmentCost: event.detail.equipmentCost || 0,
      lineItems: event.detail.lineItems || [],
      finalNotes: event.detail.finalNotes || ''
    };
    
    // Store costs in local variable for invoice preview
    jobCosts = {
      laborCost: event.detail.laborCost || 0,
      materialsCost: event.detail.materialsCost || 0,
      equipmentCost: event.detail.equipmentCost || 0,
      lineItems: event.detail.lineItems || []
    };
    
    // Save the updated job to the database
    updateJob(job.id, updatedJobData)
      .then((updatedJob) => {
        if (updatedJob) {
          // Update the local job object
          job = updatedJob;
          console.log('Job updated with cost data:', job);
        }
        
        // Complete the task
        completeTask(data);
      })
      .catch(error => {
        console.error('Error updating job with cost data:', error);
        alert('Failed to save job cost data. Please try again.');
      });
  }
  
  // Store job costs for invoice preview
  let jobCosts = {
    laborCost: 0,
    materialsCost: 0,
    equipmentCost: 0,
    lineItems: []
  };
  
  // Format address for display
  function formatAddress(address?: Address): string {
    if (!address) return 'No address available';
    
    let addressStr = address.street;
    if (address.city) addressStr += `, ${address.city}`;
    if (address.state) addressStr += `, ${address.state}`;
    if (address.zip) addressStr += ` ${address.zip}`;
    
    return addressStr;
  }
  
  // Handle payment submission
  function handlePaymentSubmit(event: CustomEvent<InvoicePayment>) {
    console.log('Payment recorded with data:', event.detail);
    
    // Create a completion data object
    const data = {
      taskType: 'record_payment',
      payment: event.detail,
      notes: `Payment of $${event.detail.amount.toFixed(2)} received via ${event.detail.method}`,
      timestamp: new Date()
    };
    
    // Add a log entry for payment
    addLogEntry({
      jobId: job.id,
      userId: userInfo?.id || 'unknown-user',
      timestamp: new Date(),
      type: LogEntryType.PAYMENT,
      content: {
        amount: event.detail.amount,
        method: event.detail.method,
        referenceNumber: event.detail.referenceNumber,
        notes: event.detail.notes
      }
    }).catch(err => {
      console.error('Error logging payment:', err);
    });
    
    // Update the job with payment data and status
    updateJob(job.id, {
      payment: event.detail,
      status: JobStatus.PAID
    }).then((updatedJob) => {
      if (updatedJob) {
        console.log('Job updated with payment data:', updatedJob);
        job = updatedJob;
      }
      
      // Complete the task
      completeTask(data);
    }).catch(error => {
      console.error('Error updating job with payment data:', error);
      alert('Failed to save payment data. Please try again.');
    });
  }
  
  // Handle apply payment submission
  function handleApplyPaymentSubmit(event: CustomEvent) {
    console.log('ApplyPaymentForm submit event:', event.detail);
    
    // Create payment data from the form
    const paymentData = {
      amount: event.detail.amount,
      date: new Date(event.detail.date),
      method: event.detail.method,
      referenceNumber: event.detail.referenceNumber || null,
      notes: event.detail.notes || null,
      timestamp: new Date()
    };
    
    // Add a log entry for payment
    addLogEntry({
      jobId: job.id,
      userId: userInfo?.id || 'unknown-user',
      timestamp: new Date(),
      type: LogEntryType.PAYMENT,
      content: {
        amount: paymentData.amount,
        method: paymentData.method,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes
      }
    }).catch(err => {
      console.error('Error logging payment:', err);
    });
    
    // Update the job with payment data and status
    updateJob(job.id, {
      payment: paymentData,
      status: JobStatus.PAID
    }).then((updatedJob) => {
      if (updatedJob) {
        console.log('Job updated with payment data and moved to PAID status:', updatedJob);
        job = updatedJob;
      }
      
      // Complete the task with the payment data
      completeTask(paymentData);
      
      // Show success message
      alert('Payment applied successfully! Job status updated to PAID.');
      
      // Use dispatchEvent to trigger a custom event that the page can listen for
      // This allows the page to update without a full refresh
      const jobUpdatedEvent = new CustomEvent('job-status-updated', {
        detail: { 
          jobId: job.id,
          newStatus: JobStatus.PAID,
          payment: paymentData
        },
        bubbles: true
      });
      document.dispatchEvent(jobUpdatedEvent);
      
      // Close the modal
      closeModal();
      
      // Reload the current job page with a timestamp parameter to force a fresh load
      // This prevents caching issues and ensures the PAID status is displayed correctly
      setTimeout(() => {
        console.log('Refreshing job page to show PAID status...');
        // Stay on the current job page - don't redirect to dashboard
        const currentUrl = window.location.href;
        // Add or update timestamp parameter to bust cache
        const urlWithoutParams = currentUrl.split('?')[0];
        const newUrl = `${urlWithoutParams}?t=${Date.now()}`;
        console.log(`Reloading page with URL: ${newUrl}`);
        window.location.href = newUrl;
      }, 1000); // Increased delay to ensure backend changes are processed
    }).catch(error => {
      console.error('Error updating job with payment data:', error);
      alert('Failed to apply payment. Please try again.');
    });
  }
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" on:click={closeModal}></div>
    
    <!-- Modal container -->
    <div class="relative w-full max-w-xl my-8 mx-auto">
      <div class="relative bg-white rounded-lg shadow-xl overflow-hidden" 
           role="dialog" 
           aria-modal="true" 
           aria-labelledby="modal-title"
           tabindex="0">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 id="modal-title" class="text-lg font-semibold text-gray-900">{formContent.title}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-500" on:click={closeModal}>
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Role check warning if user doesn't have required role -->
        {#if task && task.requiredRole && !task.requiredRole.includes(userInfo?.role || Role.CUSTOMER)}
          <div class="p-6 bg-red-50 border-b border-red-100">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-700">
                You don't have permission to perform this task. This task requires {task.requiredRole.join(' or ')} permissions.
              </p>
            </div>
          </div>
        {/if}
        
        <!-- Content -->
        <div class="p-6">
          {#if formContent.description}
            <p class="text-gray-600 mb-4">{formContent.description}</p>
          {/if}
          
          <!-- Only show task content if user has required role -->
          {#if !task.requiredRole || task.requiredRole.includes(userInfo?.role || Role.CUSTOMER)}
            <!-- Render appropriate content based on task.id -->
            {#if task.id === 'schedule_job'}
              <ScheduleAndAssignForm
                job={job}
                on:submit={(event) => {
                  console.log('ScheduleAndAssignForm submit event:', event.detail);
                  // Just assign the event detail data directly, it already has the right shape
                  const { assignedUserIds, scheduledStartDate, estimatedCompletionDate } = event.detail;
                  completeTask({
                    assignedUserIds,
                    scheduledStartDate,
                    estimatedCompletionDate
                  });
                }}
                on:cancel={closeModal}
              />
            {:else if task.id === 'assign_techs'}
              <ScheduleAndAssignForm
                job={job}
                on:submit={(event) => {
                  console.log('ScheduleAndAssignForm submit event:', event.detail);
                  // Just assign the event detail data directly, it already has the right shape
                  const { assignedUserIds, scheduledStartDate, estimatedCompletionDate } = event.detail;
                  completeTask({
                    assignedUserIds,
                    scheduledStartDate,
                    estimatedCompletionDate
                  });
                }}
                on:cancel={closeModal}
              />
            {:else if task.id === 'log_final_readings'}
              <ReadingForm 
                job={job}
                on:submit={handleReadingSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'upload_after_photos'}
              <PhotoUpload
                job={job}
                on:submit={handlePhotoSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'mark_ready_for_review'}
              <JobSubmissionForm
                job={job}
                on:submit={handleJobSubmissionSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'review_checklist'}
              <ReviewChecklistForm
                job={job}
                logEntries={logEntries}
                on:submit={handleReviewChecklistSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'enter_labor'}
              <LaborEntryForm
                job={job}
                on:submit={handleLaborEntrySubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'finalize_job'}
              <JobFinalizeForm
                job={job}
                on:submit={handleJobFinalizeSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'add_reading'}
              <ReadingForm
                job={job}
                on:submit={handleReadingSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'review_invoice'}
              <InvoicePreview
                job={job}
                mode="review"
                on:approve={handleInvoiceApproval}
                on:cancel={closeModal}
              />
            {:else if task.id === 'create_invoice'}
              {#if !job.lineItems || !job.lineItems.length}
                <div class="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
                  <p class="text-yellow-700">No line items found. You might need to refresh the job data to get the latest information.</p>
                </div>
                
                <button 
                  type="button"
                  class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-4"
                  on:click={refreshJobData}
                >
                  Refresh Job Data
                </button>
              {/if}
              
              <InvoicePreview
                job={job}
                mode="create"
                on:approve={handleInvoiceCreation}
                on:cancel={closeModal}
              />
            {:else if task.id === 'record_payment'}
              <PaymentForm
                job={job}
                on:submit={handlePaymentSubmit}
                on:cancel={closeModal}
              />
            {:else if task.id === 'apply_payment'}
              <ApplyPaymentForm
                job={job}
                on:submit={handleApplyPaymentSubmit}
                on:cancel={closeModal}
              />
            {:else}
              <!-- Generic form for other task types -->
              <form on:submit|preventDefault={handleSubmit}>
                <div class="space-y-4">
                  {#if formContent.fields && formContent.fields.length > 0}
                    {#each formContent.fields as field}
                      <!-- Render form fields based on type -->
                      {#if field.type === 'text'}
                        <div>
                          <label for={field.id} class="block mb-1 font-medium text-gray-700">{field.label}</label>
                          {#if field.description}
                            <p class="text-sm text-gray-500 mb-1">{field.description}</p>
                          {/if}
                          <input 
                            type="text" 
                            id={field.id} 
                            name={field.id} 
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={field.value || ''} 
                            required={field.required}
                          />
                        </div>
                      {:else if field.type === 'date'}
                        <div>
                          <label for={field.id} class="block mb-1 font-medium text-gray-700">{field.label}</label>
                          {#if field.description}
                            <p class="text-sm text-gray-500 mb-1">{field.description}</p>
                          {/if}
                          <input 
                            type="date" 
                            id={field.id} 
                            name={field.id} 
                            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={field.value || ''} 
                            required={field.required}
                          />
                        </div>
                      {:else if field.type === 'checkbox'}
                        <div class="flex items-start mt-4">
                          <div class="flex items-center h-5">
                            <input 
                              type="checkbox" 
                              id={field.id} 
                              name={field.id} 
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                              required={field.required}
                            />
                          </div>
                          <div class="ml-3 text-sm">
                            <label for={field.id} class="font-medium text-gray-700">{field.label}</label>
                            {#if field.description}
                              <p class="text-gray-500">{field.description}</p>
                            {/if}
                          </div>
                        </div>
                      {/if}
                    {/each}
                  {:else}
                    <div>
                      <p class="text-gray-700 mb-4">Do you want to mark this task as complete?</p>
                    </div>
                  {/if}
                  
                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      on:click={closeModal}
                      class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      {formContent.fields && formContent.fields.length > 0 ? 'Submit' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </form>
            {/if}
          {:else}
            <!-- Message if user doesn't have permission -->
            <div class="p-4 bg-gray-50 rounded-lg text-center">
              <p class="text-gray-600">You don't have permission to perform this task.</p>
              <button
                type="button"
                on:click={closeModal}
                class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if} 