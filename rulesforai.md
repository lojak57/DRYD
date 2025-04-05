# AI Coding Assistant Guidelines (RulesForAI.md)

Welcome, AI Assistant! This file outlines the key conventions and guidelines for contributing to the `dryad-restoration-app` project. Please adhere to these rules to ensure consistency, maintainability, and quality.

## 1. Core Technologies

*   **Framework:** SvelteKit
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Tailwind CSS with custom colors (`dryd-blue`, `dryd-burgundy`, `dryd-gradient`, and teal gradient scales)
*   **State Management:** Svelte Stores with derived stores for filtered data
*   **Build/Dev:** Vite
*   **Mock Data:** JSON-based service layer mocking a real API

## 2. Project Structure (`src/lib/`)

*   **`assets/`**: Static assets (images, fonts, etc.).
*   **`components/`**: Reusable Svelte components.
    *   **`common/`**: Shared UI elements like `Logo`, `UserSwitcher`.
    *   **`field/`**: Field tech components like `ActivityLogFeed`, `AddNoteForm`, `AddReadingForm`, `AddPhotoForm`, `AddEquipmentLogForm`.
    *   **`jobs/`**: Job management components like `JobCard`, `JobList`, `MultiStepJobForm`, `JobCompletionModal`.
    *   **`ui/`**: Basic UI elements like `PageHeader`.
    *   **`layout/`**: Navigation and layout components like `Nav`.
    *   **`jobs/steps/`**: Multi-step form components for job creation process including `JobInfoStep`, `SiteInfoStep`, `SchedulingStep`, `InsuranceStep`, `ReviewStep`.
*   **`config/`**: Static configuration data (e.g., `equipmentRates.ts` for daily rates).
*   **`mock/`**: Static JSON files containing mock data:
    *   `customers.json`: Customer records with contact information
    *   `equipment.json`: Restoration equipment inventory
    *   `jobs.json`: Job records with their details and status
    *   `laborEntries.json`: Labor tracking entries
    *   `logEntries.json`: Activity log entries (notes, readings, photos, equipment logs)
    *   `users.json`: User accounts with roles (ADMIN, OFFICE, TECH)
*   **`services/`**: API simulation functions:
    *   `customers.ts`: Customer data operations
    *   `equipment.ts`: Equipment inventory management
    *   `jobs.ts`: Job CRUD operations including status updates
    *   `laborEntries.ts`: Labor tracking functions
    *   `logEntries.ts`: Functions for adding activity logs
    *   `users.ts`: User authentication and management
*   **`stores/`**: Svelte stores:
    *   `authStore.ts`: Authentication state and user info
    *   `customerStore.ts`: Customer data and filtering
    *   `jobStore.ts`: Job data with role-based filtering and dashboard views
    *   `laborStore.ts`: Labor entries management
    *   `logEntryStore.ts`: Activity log entries management
    *   `userStore.ts`: User management
*   **`types/`**: TypeScript interfaces and types:
    *   `Customer.ts`: Customer data structure with Address type
    *   `Equipment.ts`: Equipment inventory types
    *   `Job.ts`: Job data with status enum and related types
    *   `LaborEntry.ts`: Labor tracking records
    *   `LogEntry.ts`: Activity log types including notes, readings, photos
    *   `User.ts`: User profiles with role enum
*   **`utils/`**: Utility functions:
    *   `billingUtils.ts`: Billing calculations for jobs and equipment
    *   `dateUtils.ts`: Date formatting and manipulation
    *   `formatters.ts`: Display formatting helpers

## 3. Current Application Features

### 3.1 Authentication & User Roles

The app currently has a `UserSwitcher` component to simulate different user roles:

* **ADMIN**: Full access to all features
* **OFFICE**: Can manage jobs, create jobs, and complete jobs
* **TECH**: Field technicians with access to their assigned jobs only

### 3.2 Dashboard & Job Management

* **Dashboard**: Role-specific view showing statistics and jobs
  * Technicians see only their assigned jobs
  * Office/Admin users see active jobs filtered by status
  * Interactive job filtering with teal-gradient status buttons
  * Auto-refresh functionality that updates job data every 5 minutes
  * Uniform card sizing with consistent visual design
* **Job Creation**: Multi-step form process with validation
  * Structured input with dropdowns and templates for complete data
  * Job Info step: Collects basic information with structured description fields
  * Site Info step: Address and access information
  * Scheduling step: Start and completion dates
  * Insurance step: Insurance claim details 
  * Review step: Summary before submission

### 3.3 Job Details & Activity Logging

* **Job Detail Page**: Comprehensive view with access to activity logs
* **Activity Logging**: Multiple specialized forms
  * **Notes**: Categorized with templates (Status Update, Customer Contact, Issue, Resolution, etc.)
  * **Moisture Readings**: Structured form with material selection, reference ranges, and assessment
  * **Photos**: Image upload with captions
  * **Equipment**: Placement and removal logging

### 3.4 Job Completion

* **Job Completion Flow**: Office/Admin users can mark jobs as complete
* **Completion Report**: Summary of all activity, labor, and equipment usage
* **Billing Summary**: Calculation of equipment costs based on duration

### 3.5 Visual Design & UI Enhancements

* **Parallax Background**: Dynamic background images that change based on scroll position
* **Teal Gradient System**: Consistent color theme for job progression cards
* **Card Uniformity**: Fixed minimum heights and widths for consistent card sizing
* **Visual Clarity**: Improved contrast between selected and unselected elements
* **Responsive Layout**: Mobile-friendly design that adapts to different screen sizes

## 4. Application Patterns & Conventions

### 4.1 TypeScript Usage

*   **Strict Typing:** Use TypeScript with proper type definitions
*   **Type Definitions:** Found in `src/lib/types/` directory
*   **Index Signatures:** Use `{ [key: string]: Type }` for objects with dynamic keys
*   **Union Types:** Use for values with multiple possible types
*   **Type Extension:** Extend existing types when needed with `&` operator

```typescript
// Example from AddReadingForm.svelte
const moistureData: MoistureReadingData & { assessmentLevel?: MoistureLevel } = {
  location: fullLocation,
  material: fullMaterial,
  value: readingValue,
  assessmentLevel: moistureLevel !== 'unknown' ? moistureLevel : undefined
};
```

### 4.2 State Management

*   **Role-Based Filtering:** Filter data based on current user role

```typescript
// Example from jobStore.ts
export const dashboardJobs = derived(
  [jobs, currentUser],
  ([$jobs, $currentUser]) => {
    if (!$currentUser) return [];
    
    let result = [...$jobs];
    
    // Role-specific filtering
    if ($currentUser.role === Role.TECH) {
      // Technicians see only jobs assigned to them
      result = result.filter(job => 
        job.assignedUserIds?.includes($currentUser.id)
      );
    } else {
      // Office/Admin users see non-completed jobs
      result = result.filter(job => 
        job.status !== JobStatus.COMPLETED && 
        job.status !== JobStatus.CANCELLED
      );
    }
    
    // Sort by creation date descending
    result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return result;
  }
);
```

### 4.3 Form Design Patterns

*   **Structured Data Entry:** Use dropdowns, categorized options, and templates
*   **Validation:** Client-side validation with error messages
*   **Template-Based Input:** For consistent data entry
*   **Custom Reference Data:** Material-specific ranges, categorized templates

```svelte
<!-- Example from AddNoteForm.svelte -->
<div>
  <label for="note-category" class="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
  <select
    id="note-category"
    bind:value={noteCategory}
    on:change={handleCategoryChange}
    class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
    disabled={isSubmitting}
  >
    <option value="">-- Select Note Type --</option>
    {#each noteCategories as category}
      <option value={category.value}>{category.label}</option>
    {/each}
  </select>
</div>
```

### 4.4 Event Handling

*   **Event Dispatching:** Use `createEventDispatcher` for communication between components
*   **Form Submission:** Handle with standardized patterns, including loading states

```typescript
// Example pattern for form submission
async function handleSubmit() {
  if (!validateForm()) return;
  
  isSubmitting = true;
  errorMessage = '';
  
  try {
    const result = await serviceFunction(formData);
    dispatch('event:nameOfEvent', result);
    resetForm();
  } catch (err) {
    console.error('Error:', err);
    errorMessage = 'Error message to display';
  } finally {
    isSubmitting = false;
  }
}
```

### 4.5 UI Styling Patterns

*   **Color Coding:** Use consistent colors for different log/form types
    * Blue for notes
    * Purple for photos
    * Indigo/Yellow for readings
    * Green for equipment
    * Teal gradient scale for job progression
*   **Card-Based Layout:** Consistent card styling with uniform sizes
*   **Responsive Grid:** Mobile-first design with responsive breakpoints
*   **Status Indicators:** Color-coded indicators for job status

## 5. Workflow Architecture & Data Flow

### 5.1 Core Workflow System Architecture

The DRYD Restoration application implements a comprehensive workflow-driven architecture centered around job management with a clear separation of concerns:

#### 5.1.1 Workflow Layer Hierarchy

1. **Presentation Layer**: UI Components
   - Job cards, forms, modals, and interactive elements
   - Task-specific components that interact with workflow-defined tasks
   - GanttChart for visualizing scheduled jobs and assignments

2. **Workflow Logic Layer**: 
   - `workflowConfig.ts`: Defines all possible tasks, transitions, and requirements
   - `JobWorkflowStepper.svelte`: Displays and manages workflow tasks
   - `TaskActionModal.svelte`: Orchestrates task-specific actions and forms
   - Status-based stage progression with automated advancement rules

3. **State Management Layer**:
   - Store modules with custom interfaces for workflow state
   - Derived stores that filter and transform data for specific workflows
   - `jobStore.ts`: Manages job data and provides filtered views

4. **Service Layer**:
   - Task-specific service functions that update job states
   - `updateJobStatus()`: Core function for advancing workflow stages
   - `updateJob()`: Updates job fields while preserving structure

#### 5.1.2 Workflow Stages and Job Statuses

The job workflow is defined by a series of statuses that represent distinct stages in the job lifecycle:

```typescript
export enum JobStatus {
  NEW = 'NEW',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_COMPLETION = 'PENDING_COMPLETION',
  COMPLETED = 'COMPLETED',
  INVOICE_APPROVAL = 'INVOICE_APPROVAL',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}
```

These statuses are organized into a sequential workflow defined in `workflowConfig.ts`:

```typescript
export const JOB_WORKFLOW_STEPS: { status: JobStatus, label: string }[] = [
  { status: JobStatus.NEW, label: 'New Job' },
  { status: JobStatus.SCHEDULED, label: 'Scheduled' },
  { status: JobStatus.IN_PROGRESS, label: 'Work In Progress' },
  { status: JobStatus.PENDING_COMPLETION, label: 'Review & Approval' },
  { status: JobStatus.COMPLETED, label: 'Job Complete' },
  { status: JobStatus.INVOICE_APPROVAL, label: 'Invoice Approval' },
  { status: JobStatus.INVOICED, label: 'Invoiced' },
  { status: JobStatus.PAID, label: 'Paid' }
];
```

#### 5.1.3 Task-Based Progression System

Each job status has associated tasks that must be completed before advancing to the next stage. This is defined in the `TASKS_BY_STATUS` configuration:

```typescript
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
  // Additional statuses and tasks...
};
```

### 5.2 Job Workflow Progression Logic

#### 5.2.1 Status Advancement Mechanisms

The application uses three main mechanisms to advance jobs through workflow stages:

1. **Task-Driven Advancement**: Some tasks directly trigger status changes when completed.
   ```typescript
   // Example from job page
   function handleTaskCompletedFromModal(event) {
     const { taskId, data } = event.detail;
     
     if (taskId === 'mark_ready_for_review') {
       // Explicitly change status when this task is completed
       updateJobStatus($currentJob.id, JobStatus.PENDING_COMPLETION);
     }
     else if (taskId === 'confirm_dispatch') {
       // Move to IN_PROGRESS when dispatch is confirmed
       updateJobStatus($currentJob.id, JobStatus.IN_PROGRESS);
     }
     // Other tasks...
   }
   ```

2. **Condition-Based Advancement**: When certain combinations of data or completed tasks are present, the job automatically advances.
   ```typescript
   // Example: Auto-advance to SCHEDULED when both scheduling and technician assignment are complete
   updateJobWithData(updateData)
     .then(updatedJob => {
       // Check if we can advance the job to SCHEDULED status
       if (updatedJob.scheduledStartDate && 
           updatedJob.assignedUserIds && 
           updatedJob.assignedUserIds.length > 0 &&
           updatedJob.status === JobStatus.NEW) {
         console.log('Both scheduling and assignment complete, advancing to SCHEDULED');
         return updateJobStatus($currentJob.id, JobStatus.SCHEDULED);
       }
       return updatedJob;
     });
   ```

3. **Dependency-Based Task Availability**: Tasks with dependencies check if prerequisites are complete before allowing activation.
   ```typescript
   // From JobWorkflowStepper.svelte
   function handleTaskClick(task: WorkflowTask) {
     // For the special case of mark_ready_for_review, ensure all tech tasks are done
     if (task.id === 'mark_ready_for_review' && !areAllTechTasksComplete()) {
       alert('You must complete all technician tasks before submitting for review');
       return;
     }
     // Continue with task activation...
   }
   
   // Check if all technician tasks are complete
   function areAllTechTasksComplete() {
     if (!job.completionTasks) return false;
     return job.completionTasks.finalReadingsLogged && 
            job.completionTasks.afterPhotosTaken;
   }
   ```

#### 5.2.2 Task Completion Tracking

The system tracks task completion using the `CompletionTasks` interface on each job:

```typescript
export interface CompletionTasks {
  initialAssessmentComplete: boolean;
  equipmentDeployed: boolean;
  initialReadingsLogged: boolean;
  beforePhotosTaken: boolean;
  finalReadingsLogged: boolean;
  afterPhotosTaken: boolean;
  equipmentRetrieved: boolean;
  // Other completion flags
}
```

When a task is completed that has a `checklistKey`, the corresponding flag is set in the job's `completionTasks` object:

```typescript
// From the job page
if (selectedTask?.checklistKey) {
  updateData.completionTasks = {
    ...($currentJob.completionTasks || {}),
    [selectedTask.checklistKey]: true
  };
}
```

#### 5.2.3 Role-Based Task Access

Tasks are restricted to specific user roles through the `requiredRole` property:

```typescript
{ id: 'schedule_job', label: 'Schedule Job Date', requiredRole: [Role.OFFICE, Role.ADMIN] }
```

The `JobWorkflowStepper` enforces these restrictions:

```typescript
function canPerformTask(task: WorkflowTask): boolean {
  if (!task.requiredRole || task.requiredRole.length === 0) return true;
  return currentUserRole ? task.requiredRole.includes(currentUserRole as Role) : false;
}
```

### 5.3 Gantt Chart and Scheduling System

#### 5.3.1 Gantt Chart Architecture

The scheduling system centers around the `GanttChart.svelte` component, which visualizes job schedules by technician:

```typescript
// GanttChart.svelte
// Core data structures
let technicians: User[] = [];
let jobs: Job[] = [];
let viewType: 'daily' | 'weekly' = 'weekly';
let selectedDate = new Date();
```

Jobs appear on the Gantt chart based on three criteria:
1. The job has a valid `scheduledStartDate`
2. The job has technicians assigned (`assignedUserIds`)
3. The job is in a visible status (SCHEDULED or IN_PROGRESS)

```typescript
// Only show jobs with appropriate status
const visibleStatuses = [JobStatus.SCHEDULED, JobStatus.IN_PROGRESS];

// Filter jobs for each technician
function mapJobsToTechnicians(techs: User[], allJobs: Job[], dates: Date[]): any[] {
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
      return { date, jobs: jobsForDate };
    });
    
    return { technician: tech, dates: dateJobs };
  });
}
```

#### 5.3.2 Scheduling and Assignment Integration

The `ScheduleAndAssignForm` component combines technician assignment and schedule date selection in a single flow:

```typescript
// ScheduleAndAssignForm.svelte
export let job: Job;

// Form state
let step = 1; // 1: Select Technicians, 2: Schedule Date
let technicians: User[] = [];
let selectedTechnicians: string[] = [];
let startDate = job.scheduledStartDate ? new Date(job.scheduledStartDate).toISOString().split('T')[0] : '';
let estimatedCompletionDate = job.estimatedCompletionDate ? new Date(job.estimatedCompletionDate).toISOString().split('T')[0] : '';
```

When completed, this form dispatches a submission event:

```typescript
function handleSubmit() {
  dispatch('submit', {
    assignedUserIds: selectedTechnicians,
    scheduledStartDate: startDate,
    estimatedCompletionDate: estimatedCompletionDate || undefined
  });
}
```

The TaskActionModal handles this event to complete both scheduling and assignment tasks:

```typescript
// In TaskActionModal.svelte
{#if task.id === 'schedule_job' || task.id === 'assign_techs'}
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
{/if}
```

#### 5.3.3 Daily and Weekly Views

The Gantt chart supports two view modes:
- **Daily View**: Shows jobs for technicians on a specific date
- **Weekly View**: Shows jobs across a 7-day period for all technicians

```typescript
// GanttChart.svelte
// View type (daily or weekly)
let viewType: 'daily' | 'weekly' = 'weekly';

// Generate date range based on view type
$: dateRange = generateDateRange(selectedDate, viewType === 'daily' ? 1 : daysInWeek);
```

The UI changes based on the selected view:

```svelte
<!-- Daily View (Grid) -->
{#if viewType === 'daily' && dateRange.length > 0}
  <div class="overflow-x-auto border rounded-lg">
    <div class="bg-gray-50 px-4 py-3 border-b">
      <h3 class="text-lg font-medium">Jobs Scheduled for {formatDate(dateRange[0], true)}</h3>
    </div>
    <table class="min-w-full border-collapse">
      <!-- Daily view content -->
    </table>
  </div>
<!-- Weekly View (Grid) -->
{:else}
  <div class="overflow-x-auto border rounded-lg">
    <table class="min-w-full border-collapse">
      <!-- Weekly view content -->
    </table>
  </div>
{/if}
```

### 5.4 Component Interaction Flow

The workflow system relies on several key component interactions:

#### 5.4.1 Job Detail Page to WorkflowStepper

The job detail page (`[jobId]/+page.svelte`) renders the `JobWorkflowStepper` and listens for task interactions:

```svelte
<JobWorkflowStepper 
  currentStatus={$currentJob.status} 
  job={$currentJob}
  on:taskClick={handleTaskClick}
  on:taskCompleted={handleTaskCompleted}
  on:updateStatus={handleStatusUpdate}
/>
```

#### 5.4.2 WorkflowStepper to TaskActionModal

When a task is clicked in the WorkflowStepper, it shows the TaskActionModal:

```typescript
function handleTaskClick(task: WorkflowTask) {
  // Set the selected task and show the modal
  selectedTask = task;
  showTaskModal = true;
  
  // Dispatch the click event with the task
  dispatch('taskClick', { task, job });
}
```

In the WorkflowStepper template:

```svelte
<!-- Task Modal -->
{#if showTaskModal && selectedTask && job}
  <div transition:fade={{ duration: 200 }}>
    <TaskActionModal
      bind:isOpen={showTaskModal}
      task={selectedTask}
      job={job}
      logEntries={[]}
      on:close={() => {
        showTaskModal = false;
        selectedTask = null;
      }}
      on:taskCompleted={handleTaskCompleted}
    />
  </div>
{/if}
```

#### 5.4.3 TaskActionModal to Task-Specific Forms

The TaskActionModal renders different forms based on the task type:

```svelte
{#if task.id === 'schedule_job' || task.id === 'assign_techs'}
  <ScheduleAndAssignForm
    job={job}
    on:submit={(event) => completeTask(event.detail)}
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
{:else}
  <!-- Generic task form -->
{/if}
```

#### 5.4.4 TaskActionModal back to Job Page

When a task is completed, the TaskActionModal dispatches a completion event:

```typescript
function completeTask(data?: any) {
  // Create a content object with task information
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
    userId: userInfo?.id || 'user-1',
    type: LogEntryType.TASK_COMPLETION,
    content: contentObject
  });
  
  // Dispatch event to update UI
  dispatch('taskCompleted', { taskId: task.id, data });
}
```

The job page handles this event to update the job:

```typescript
function handleTaskCompletedFromModal(event) {
  const { taskId, data } = event.detail;
  
  // Create update object for job
  const updateData: Partial<Job> = {};
  
  // Handle specific task types
  if (taskId === 'assign_techs' && data && data.assignedUserIds) {
    updateData.assignedUserIds = data.assignedUserIds;
  } 
  else if (taskId === 'schedule_job' && data) {
    if (data.scheduledStartDate) {
      updateData.scheduledStartDate = new Date(data.scheduledStartDate);
    }
    if (data.estimatedCompletionDate) {
      updateData.estimatedCompletionDate = new Date(data.estimatedCompletionDate);
    }
  }
  
  // Apply updates to job
  updateJobWithData(updateData)
    .then(/* handle result */);
}
```

### 5.5. Role-Based Workflow Interactions

The system behaves differently based on user roles:

#### 5.5.1 Admin and Office Users

Admin and Office users have access to all job management functions:
- Can create new jobs
- Can schedule jobs and assign technicians
- Can confirm dispatch to advance jobs to IN_PROGRESS
- Can review and approve completed jobs
- Can create and approve invoices
- Can manage all stages of the workflow

```typescript
// Role-specific task definitions
{ id: 'schedule_job', label: 'Schedule Job Date', requiredRole: [Role.OFFICE, Role.ADMIN] }
{ id: 'confirm_dispatch', label: 'Confirm Technician Dispatched', requiredRole: [Role.OFFICE, Role.ADMIN] }
{ id: 'review_checklist', label: 'Review Technician Checklist', requiredRole: [Role.OFFICE, Role.ADMIN] }
```

#### 5.5.2 Technician Users

Technicians have focused access to their assigned jobs:
- Can view only jobs assigned to them
- Can update job details during the IN_PROGRESS stage
- Can log readings, photos, and equipment usage
- Can mark jobs as ready for review

```typescript
// Technician-specific tasks
{ id: 'log_final_readings', label: 'Log Final Moisture Readings', requiredRole: [Role.TECH], checklistKey: 'finalReadingsLogged' }
{ id: 'upload_after_photos', label: 'Upload "After" Photos', requiredRole: [Role.TECH], checklistKey: 'afterPhotosTaken' }
{ id: 'mark_ready_for_review', label: 'Submit for Office Review', requiredRole: [Role.TECH], dependsOn: ['log_final_readings', 'upload_after_photos'] }
```

#### 5.5.3 Role-Based Data Filtering

All data is filtered based on user role:

```typescript
// Example from jobStore.ts
export const dashboardJobs = derived(
  [jobs, currentUser],
  ([$jobs, $currentUser]) => {
    if (!$currentUser) return [];
    
    let result = [...$jobs];
    
    // Role-specific filtering
    if ($currentUser.role === Role.TECH) {
      // Technicians see only jobs assigned to them
      result = result.filter(job => 
        job.assignedUserIds?.includes($currentUser.id)
      );
    } else {
      // Office/Admin users see non-completed jobs
      result = result.filter(job => 
        job.status !== JobStatus.COMPLETED && 
        job.status !== JobStatus.CANCELLED
      );
    }
    
    return result;
  }
);
```

## 6. Future Module Integration Guidelines

### 6.1 Module Development Principles

When building additional modules that integrate with the workflow system:

1. **Store Integration**
   - Create module-specific stores (e.g., `inventoryStore.ts`)
   - Design read-only public interfaces with internal writables
   - Create derived stores for cross-module relationships

2. **Service Layer Consistency**
   - Follow established CRUD operation patterns
   - Use store update patterns shown in section 5.3.3
   - Ensure proper error handling and asynchronous management

3. **Component Patterns**
   - Create module-specific components in appropriate directories
   - Follow established component lifecycle patterns
   - Maintain consistent styling and UX patterns

### 6.2 Data Consistency Requirements

To ensure seamless integration of new modules:

1. **TypeScript Enforcement**
   - Define comprehensive types for all module entities
   - Use strict typing for all functions and components
   - Extend existing types when adding related functionality

2. **Entity Relationships**
   - Use consistent ID references between entities
   - Document relationships in type definitions
   - Create derived stores for relationship queries

3. **Service Function Structure**
   ```typescript
   // Template for new module service functions
   export async function createEntity(data: CreateEntityInput): Promise<Entity> {
     // Validate input
     validateEntityData(data);
     
     // Create entity with unique ID
     const newEntity: Entity = {
       id: generateId(),
       createdAt: new Date().toISOString(),
       ...data
     };
     
     // Update mock data (future: API call)
     mockEntities.push(newEntity);
     
     // Update store
     _entities.update(current => [...current, newEntity]);
     
     // Return created entity
     return newEntity;
   }
   ```

### 6.3 Workflow Integration Requirements

When adding new workflows or extending existing ones:

1. **Define Workflow Configuration**
   - Create structured workflow definition
   - Define tasks, roles, and status transitions
   - Document workflow steps and requirements

2. **Create Task-Specific Components**
   - Build forms for task data collection
   - Implement validation and error handling
   - Follow established submission patterns

3. **Update Service Layer**
   - Add service functions for workflow transitions
   - Ensure proper updating of related entities
   - Create activity logging for workflow steps

### 6.4 Testing & Verification Guidelines

For testing new module integrations:

1. **Component Testing**
   - Verify component initialization and data loading
   - Test user interactions and form submissions
   - Check error handling and loading states

2. **Data Flow Testing**
   - Validate store updates and subscriptions
   - Verify cross-module data relationships
   - Test derived store calculations

3. **Workflow Function Testing**
   - Validate task completion and status transitions
   - Test role-based access restrictions
   - Verify workflow completion and outcomes

## 7. Code Styling & Linting

*   **Tailwind Classes:** Group related classes (positioning, colors, spacing)
*   **Component Structure:** Script section first, then markup
*   **Button States:** Include disabled, hover, focus, and active states
*   **Form Validation:** Client-side validation with error messages
*   **Loading States:** Show loading indicators during async operations

## 8. Best Practices When Extending

*   **Follow Existing Patterns:** Match the style and structure of existing components
*   **Role-Based Access:** Ensure features respect user roles
*   **State Management:** Leverage existing stores; add derived stores as needed
*   **Form Components:** Maintain consistency with existing form styles and validation
*   **Error Handling:** Include proper error handling for all async operations
*   **Mobile Responsiveness:** Ensure all new UIs work well on both desktop and mobile
*   **Component Modularity:** Create focused components and compose them together
*   **Documentation:** Add relevant JSDoc comments for complex functions

## 9. Current Limitations & TODOs

*   **Mock Data:** The app uses mock data instead of real API endpoints
*   **Image Handling:** Photo uploads are simulated (URLs in mock data)
*   **Port Management:** The application sometimes uses multiple ports due to port conflicts

## 10. Recent Updates & Current State (April 2025)

### 10.1 Visual Design Upgrades

* **Parallax Background System**: Implemented a dynamic background system in `(app)/+layout.svelte` that changes images based on scroll position
* **Teal Gradient Color Scheme**: Added multiple teal gradient classes (`bg-teal-gradient-1` through `bg-teal-gradient-5`) to provide visual progression for job status cards
* **Enhanced Logo Display**: Removed redundant text from logo component and increased logo size with new `xxxl` size option
* **User Switcher Redesign**: Updated to match light blue color scheme for better visual consistency
* **Dashboard Card Refinements**: 
  * Added uniform minimum height to job category cards
  * Standardized button sizes with minimum width
  * Made all "View All" buttons consistently use teal color scheme
  * Shortened long button labels for visual consistency

### 10.2 Functional Improvements

* **Dashboard Auto-Refresh**: Added interval-based data refresh in `dashboard/+page.ts` that updates job data every 5 minutes
* **Refresh Management**: Implemented global interval tracking to prevent multiple refresh intervals from running simultaneously
* **Job Filter Improvements**: Enhanced job filter buttons with improved visual feedback when selected
* **Safer Job Filtering**: Added null/undefined checking with `safeFilter` function to prevent errors when accessing job arrays

### 10.3 Performance Optimizations

* **Interval Cleanup**: Implemented proper cleanup of intervals when navigating away from dashboard
* **Component Rendering Efficiency**: Optimized conditional rendering in dashboard components
* **Cache Management**: Added cache clearing on dashboard reload to ensure fresh data
* **Response Handling**: Improved error handling in job loading functions

## 11. Project Development Journey

This section outlines the chronological development stages of the Dryad Restoration application from inception to its current state. Understanding this journey provides valuable context for future development agents and demonstrates the significant work invested in the platform.

### 11.1 Initial Planning & Requirements Gathering (Phase 1)

* **Business Analysis & Requirements**
  * Stakeholder interviews with field technicians, office staff, and management
  * Analysis of existing paper-based workflows
  * Documentation of key pain points in current processes
  * Definition of role-specific requirements

* **Technical Architecture Planning**
  * Framework selection (SvelteKit) for its reactivity and minimal bundle size
  * Database schema planning (for future implementation)
  * Mobile responsiveness requirements defined for field usage
  * TypeScript adoption for enhanced type safety

* **Information Architecture**
  * Job-centric data model established
  * Entity relationship diagrams created
  * Role-based access patterns defined
  * Core workflow stages documented

### 11.2 Core Infrastructure Development (Phase 2)

* **Project Bootstrapping**
  * SvelteKit project initialization with TypeScript configuration
  * Tailwind CSS integration with custom color scheme
  * Directory structure established
  * Mock data scaffolding

* **Store & Service Architecture**
  * Implementation of store pattern with internal writables
  * Service layer mock API functions created
  * Type definitions for all core entities
  * Role-based authorization patterns established

* **Navigation & Base UI**
  * Responsive layout implementation
  * Header and navigation components
  * Role-switcher mechanism for testing
  * Dashboard layout foundation

### 11.3 Job Management System (Phase 3)

* **Dashboard Views**
  * Role-filtered job listings
  * Status-based filtering
  * Job cards with key details
  * Summary statistics implementation

* **Job Creation Flow**
  * Multi-step form architecture
  * Form validation patterns
  * Step navigation with progress tracking
  * Review and submission functionality

* **Job Detail View**
  * Comprehensive job information display
  * Status update controls
  * Role-specific action buttons
  * Related information tabs

### 11.4 Field Technician Tools (Phase 4)

* **Activity Logging System**
  * Note creation with templates
  * Moisture reading entry with material-specific reference ranges
  * Photo upload simulation
  * Equipment placement/removal logging

* **Labor Tracking**
  * Time entry system
  * Technician assignment functionality
  * Labor cost calculations
  * Work summary visualization

* **Mobile Optimization**
  * Touch-friendly controls for field use
  * Offline capabilities (planned for future implementation)
  * Camera integration (simulated)
  * Responsive layouts for small screens

### 11.5 Workflow Engine Development (Phase 5)

* **State Machine Implementation**
  * Job status transition rules
  * Task dependency configuration
  * Role-based task restrictions
  * Completion requirements

* **Task System**
  * TaskActionModal orchestrator
  * Task-specific form loading
  * Dynamic UI based on task type
  * Validation specific to each task

* **Workflow Visualization**
  * JobWorkflowStepper component
  * Visual progress indicators
  * Task completion tracking
  * Next steps guidance

### 11.6 Financial Module Integration (Phase 6)

* **Line Item Management**
  * Custom line item creation
  * Category-based organization
  * Quote item import capabilities
  * Dynamic total calculations

* **Quote Generation**
  * Quote creation workflow
  * Line item builder interface
  * Customer information integration
  * Quote approval process

* **Invoice Creation**
  * Job finalization process
  * Cost summary generation
  * Labor and equipment roll-up
  * Formatted invoice preview

### 11.7 UI/UX Refinement (Phase 7)

* **Design System Enhancement**
  * Consistent component styling
  * Improved color contrast
  * Accessibility improvements
  * Error state visualizations

* **Performance Optimization**
  * Store subscription optimization
  * Component lazy-loading
  * Reactive update efficiency
  * Form submission streamlining

* **User Experience Improvements**
  * Simplified task flows
  * Enhanced form validations
  * Clearer error messages
  * Improved loading states

### 11.8 Current Work & Recent Additions (Phase 8)

* **Visual Design Overhaul**
  * Parallax background implementation
  * Teal gradient system for workflow visualization
  * Card uniformity and consistent sizing
  * Enhanced logo display

* **Data Management Improvements**
  * Auto-refresh functionality
  * Safer job filtering with null checks
  * Improved error handling
  * Interval cleanup for better performance

* **User Interface Refinement**
  * Consistent button styling
  * Uniform card sizing
  * Improved contrast for selected elements
  * More intuitive visual hierarchy

### 11.9 Future Roadmap

* **API Integration**
  * Replace mock data with real API endpoints
  * Implement authentication services
  * Add offline synchronization
  * Develop real-time updates

* **Analytics Dashboard**
  * Performance metrics tracking
  * Cost analysis tools
  * Project timeline visualizations
  * Resource utilization reporting

* **Additional Modules**
  * Inventory management system
  * Asset tracking and maintenance
  * Employee performance tracking
  * Customer relationship management

* **Mobile Application**
  * Native application development
  * Enhanced offline capabilities
  * Push notifications
  * Camera and GPS integration

## Golden Rule

Think about maintainability and readability for the future human developers (including your future self!). Keep code clean, well-structured, and appropriately typed. Follow the established patterns in the codebase to maintain consistency.

---

Thank you for helping build the Dryad Restoration app! 