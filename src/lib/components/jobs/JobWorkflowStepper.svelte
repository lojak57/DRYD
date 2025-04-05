<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { WORKFLOW_ORDER, WORKFLOW_LABELS, TASKS_BY_STATUS } from '$lib/config/workflowConfig';
  import type { WorkflowTask } from '$lib/config/workflowConfig';
  import { JobStatus } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import { userStore } from '$lib/stores/userStore';
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import TaskActionModal from './TaskActionModal.svelte';
  import { fade } from 'svelte/transition';
  import { JOB_WORKFLOW_STEPS } from '$lib/config/workflowConfig';
  import type { CompletionTasks } from '$lib/types/Job';
  
  export let currentStatus: JobStatus;
  export let job: Job;
  
  // Create a dispatcher for events
  const dispatch = createEventDispatcher<{
    requestAction: any; // Using 'any' to allow both string and object payloads
    taskClick: { task: WorkflowTask, job: Job };
    updateJob: { completionTasks: any };
    updateStatus: { newStatus: JobStatus };
    allTechTasksComplete: void;
    taskCompleted: { taskId: string, data?: any };
    statusTasksCompleted: { status: JobStatus, completedTaskIds: string[] };
  }>();
  
  // Get current user role from store
  let currentUserRole: Role | string | null = null;
  userStore.subscribe(user => {
    currentUserRole = user ? user.role : null;
  });
  
  // Helper function to check role compatibility
  function rolesAreCompatible(requiredRole: string, userRole: string | null): boolean {
    if (!userRole) return false;
    
    // Direct match
    if (requiredRole === userRole) return true;
    
    // Admin can do anything
    if (userRole === 'ADMIN') return true;
    
    // Handle TECH/TECHNICIAN compatibility
    if ((requiredRole === 'TECH' && userRole === 'TECHNICIAN') || 
        (requiredRole === 'TECHNICIAN' && userRole === 'TECH')) {
      return true;
    }
    
    return false;
  }
  
  // Convert the role enum to a string for all comparisons
  $: userRoleString = currentUserRole ? String(currentUserRole) : null;
  
  // Helper functions for task completion and dependency checks
  function isTaskComplete(task: WorkflowTask): boolean {
    if (!job) {
      console.log(`[isTaskComplete] Job is null, task ${task.id} cannot be complete`);
      return false;
    }

    // Direct check for specific administrative tasks
    // Schedule job is complete if the job has a scheduled start date
    if (task.id === 'schedule_job') {
      const hasScheduledDate = !!job.scheduledStartDate;
      console.log(`[isTaskComplete] schedule_job: ${hasScheduledDate}`, job.scheduledStartDate);
      return hasScheduledDate;
    }
    
    // Assign techs is complete if the job has assigned technicians
    if (task.id === 'assign_techs') {
      const hasAssignedTechs = job.assignedUserIds && job.assignedUserIds.length > 0;
      console.log(`[isTaskComplete] assign_techs: ${hasAssignedTechs}`, job.assignedUserIds);
      return hasAssignedTechs;
    }
    
    // If task links to a specific checklist item, check that item
    if (task.checklistKey && job.completionTasks) {
      const checklistComplete = job.completionTasks[task.checklistKey] === true;
      console.log(`[isTaskComplete] ${task.id} checklist: ${checklistComplete}`);
      return checklistComplete;
    }
    
    // Otherwise check if the task ID is in the completed tasks array
    const inCompletedArray = completedTaskIds.includes(task.id);
    console.log(`[isTaskComplete] ${task.id} in completed array: ${inCompletedArray}`);
    return inCompletedArray;
  }
  
  function canPerformTask(task: WorkflowTask): boolean {
    if (!task) return false;
    
    // Debug log to check task permissions
    console.log(`Task permission check: ID=${task.id}, Label=${task.label}, RequiredRoles=${task.requiredRole}, UserRole=${userRoleString}, Complete=${completedTaskIds.includes(task.id)}`);
    
    // Check if the task is already complete
    if (completedTaskIds.includes(task.id)) {
      return false; // Don't allow re-doing completed tasks
    }
    
    // If the task has role requirements, check them
    if (task.requiredRole && task.requiredRole.length > 0) {
      // If user doesn't have a role or it's not in the required roles, they can't perform this task
      if (!userRoleString || !task.requiredRole.some(role => rolesAreCompatible(role, userRoleString))) {
        console.log(`User cannot perform task ${task.id} due to role restrictions. Required: ${task.requiredRole}, User: ${userRoleString}`);
        return false;
      }
    }
    
    // Check if all dependencies are complete
    if (task.dependsOn && task.dependsOn.length > 0) {
      const allDependenciesMet = task.dependsOn.every(depId => 
        completedTaskIds.includes(depId)
      );
      
      if (!allDependenciesMet) {
        console.log(`Task ${task.id} has unmet dependencies`);
        return false;
      }
    }
    
    // Special case for scheduling and assignments
    if (task.id === 'schedule_job' && job?.scheduledStartDate) {
      return false; // Already scheduled
    }
    
    if (task.id === 'assign_techs' && job?.assignedUserIds && job.assignedUserIds.length > 0) {
      return false; // Already assigned
    }
    
    return true;
  }
  
  function areAllTechTasksComplete(): boolean {
    if (!job || !job.completionTasks) return false;
    
    // Log each completion task status individually for debugging
    console.log('DEBUG - finalReadingsLogged:', job.completionTasks.finalReadingsLogged);
    console.log('DEBUG - afterPhotosTaken:', job.completionTasks.afterPhotosTaken);
    
    const prerequisitesMet = 
      job.completionTasks.finalReadingsLogged === true && 
      job.completionTasks.afterPhotosTaken === true;
      
    console.log('areAllTechTasksComplete check:', prerequisitesMet, job.completionTasks);
    return prerequisitesMet;
  }
  
  // Get workflow steps
  const workflowSteps = WORKFLOW_ORDER.map(status => ({
    status,
    label: WORKFLOW_LABELS[status],
    isComplete: WORKFLOW_ORDER.indexOf(status) < WORKFLOW_ORDER.indexOf(currentStatus),
    isCurrent: status === currentStatus
  }));
  
  // Get current tasks
  $: currentTasks = TASKS_BY_STATUS[currentStatus] || [];
  
  // Handle clicking a task
  let showTaskModal = false;
  let selectedTask: WorkflowTask | null = null;
  
  function handleTaskClick(task: WorkflowTask) {
    // Check if task is already complete
    if (isTaskComplete(task) || completedTaskIds.includes(task.id)) {
      console.log(`Task ${task.id} is already complete`);
      return;
    }
    
    // Check if user can perform this task
    if (!canPerformTask(task)) {
      alert(`You don't have permission to perform this task. Required role: ${task.requiredRole?.join(' or ')}`);
      return;
    }
    
    // For the special case of mark_ready_for_review, ensure all tech tasks are done
    if (task.id === 'mark_ready_for_review' && !areAllTechTasksComplete()) {
      alert('You must complete all technician tasks before submitting for review');
      return;
    }
    
    // Set the selected task and show the modal
    selectedTask = task;
    showTaskModal = true;
    
    // Dispatch the click event with the task
    console.log('JobWorkflowStepper - Task Clicked:', task.id, 'Full task:', task);
    dispatch('taskClick', { task, job });
  }
  
  // Handle modal close
  function handleModalClose() {
    showTaskModal = false;
    selectedTask = null;
  }
  
  // Keep track of completed tasks (for persistent UI state)
  let completedTaskIds: string[] = [];
  // Animation-only tasks (temporary visual effects)
  let animatingTaskIds: string[] = [];
  
  // Function for task completion animation
  function animateTaskCompletion(taskId: string) {
    if (!animatingTaskIds.includes(taskId)) {
      animatingTaskIds = [...animatingTaskIds, taskId];
      setTimeout(() => {
        // Remove from animation list after animation completes
        animatingTaskIds = animatingTaskIds.filter(id => id !== taskId);
      }, 1500); // Animation duration
    }
  }
  
  // Handle task completed event from TaskActionModal
  function handleTaskCompleted(event: CustomEvent<{taskId: string, data?: any}>) {
    const { taskId, data } = event.detail;
    console.log('Task completed in JobWorkflowStepper:', taskId, 'Data:', data);
    
    // Close the modal immediately after task completion
    showTaskModal = false;
    selectedTask = null;
    
    // Add task to completed tasks
    if (!completedTaskIds.includes(taskId)) {
      completedTaskIds = [...completedTaskIds, taskId];
      
      // Show animation for completed task
      animatingTaskIds = [...animatingTaskIds, taskId];
      setTimeout(() => {
        animatingTaskIds = animatingTaskIds.filter(id => id !== taskId);
      }, 1500);
      
      // Pass through the completion data for special tasks
      if (taskId === 'assign_techs' && data && data.assignedUserIds) {
        console.log('Dispatching assign_techs task completion with data:', data);
        dispatch('taskCompleted', { taskId, data });
      } else if (taskId === 'schedule_job' && data) {
        console.log('Dispatching schedule_job task completion with data:', data);
        dispatch('taskCompleted', { taskId, data });
      } else if (taskId === 'mark_ready_for_review') {
        console.log('Dispatching mark_ready_for_review task completion');
        dispatch('taskCompleted', { taskId, data });
        // Update job status to PENDING_COMPLETION
        dispatch('updateStatus', { newStatus: JobStatus.PENDING_COMPLETION });
      } else if (taskId === 'log_final_readings') {
        console.log('Dispatching log_final_readings task completion');
        dispatch('taskCompleted', { taskId, data });
      } else if (taskId === 'upload_after_photos') {
        console.log('Dispatching upload_after_photos task completion');
        dispatch('taskCompleted', { taskId, data });
      }
      
      // Map task ID to the corresponding completion task property
      let completionTaskKey: keyof CompletionTasks | null = null;
      
      if (taskId === 'log_final_readings') {
        completionTaskKey = 'finalReadingsLogged';
      } else if (taskId === 'upload_after_photos') {
        completionTaskKey = 'afterPhotosTaken';
      }
      
      // If we have a matching completion task, update the job
      if (completionTaskKey) {
        console.log(`Updating completion task: ${completionTaskKey} = true`);
        const completionTasks = {
          ...job.completionTasks,
          [completionTaskKey]: true
        };
        dispatch('updateJob', { completionTasks });
      }
    }
  }
  
  // Check if all tasks for the current status are completed
  function checkAllTasksComplete(): boolean {
    if (!job) return false;
    
    const tasksForStatus = TASKS_BY_STATUS[job.status] || [];
    
    // Check if all tasks for this status are completed
    return tasksForStatus.every(task => isTaskComplete(task));
  }
  
  // Reactive statement to check if all tasks are complete and dispatch an event
  $: {
    const allComplete = checkAllTasksComplete();
    if (allComplete && job) {
      console.log(`%c All tasks for status ${job.status} are complete! %c`, 'background: green; color: white; padding: 2px 5px; border-radius: 3px;', '');
      
      // For INVOICED status, this is a critical transition to PAID
      if (job.status === JobStatus.INVOICED) {
        console.log('CRITICAL WORKFLOW TRANSITION: All INVOICED tasks complete - should transition to PAID');
      }
      
      dispatch('statusTasksCompleted', { status: job.status, completedTaskIds });
    }
  }
  
  // Check if all tasks for a specific status are completed
  function areAllTasksCompletedForStatus(status: JobStatus): boolean {
    if (!job) return false;
    
    const tasksForStatus = TASKS_BY_STATUS[status] || [];
    
    // For specific statuses, check special conditions
    if (status === JobStatus.NEW) {
      // For NEW status, need schedule date and assigned technicians
      return job.scheduledStartDate !== undefined && 
             job.assignedUserIds && 
             job.assignedUserIds.length > 0;
    } else if (status === JobStatus.SCHEDULED) {
      // For SCHEDULED status, all tasks should be complete
      return tasksForStatus.every(task => completedTaskIds.includes(task.id));
    } else if (status === JobStatus.IN_PROGRESS) {
      // For IN_PROGRESS status, check completion tasks
      return job.completionTasks ? 
        job.completionTasks.finalReadingsLogged === true &&
        job.completionTasks.afterPhotosTaken === true 
        : false;
    }
    
    // Default: check if all task IDs for this status are in completedTaskIds
    return tasksForStatus.every(task => completedTaskIds.includes(task.id));
  }

  function getStatusClass(status: JobStatus) {
    switch(status) {
      case JobStatus.NEW:
        return 'bg-blue-500 group-hover:bg-blue-600';
      case JobStatus.SCHEDULED:
        return 'bg-purple-500 group-hover:bg-purple-600';
      case JobStatus.IN_PROGRESS:
        return 'bg-amber-500 group-hover:bg-amber-600';
      case JobStatus.PENDING_COMPLETION:
        return 'bg-blue-500 group-hover:bg-blue-600';
      case JobStatus.COMPLETED:
        return 'bg-green-500 group-hover:bg-green-600';
      case JobStatus.INVOICE_APPROVAL:
        return 'bg-indigo-400 group-hover:bg-indigo-500';
      case JobStatus.INVOICED:
        return 'bg-indigo-500 group-hover:bg-indigo-600';
      case JobStatus.PAID:
        return 'bg-teal-500 group-hover:bg-teal-600';
      default:
        return 'bg-gray-500 group-hover:bg-gray-600';
    }
  }

  // Handle clicking on a workflow status step
  function handleStatusClick(status: JobStatus) {
    console.log('Status clicked:', status);
    
    // Only allow clicking steps that are completed or current
    if (status === job.status || WORKFLOW_ORDER.indexOf(status) < WORKFLOW_ORDER.indexOf(job.status)) {
      // Set the current status to show tasks for that stage
      dispatch('updateStatus', { newStatus: status });
    }
  }
</script>

<!-- Rest of the component remains unchanged -->

<!-- Workflow steps -->
<div class="overflow-x-auto py-4">
  <div class="flex justify-between items-center mb-2">
    <h3 class="text-lg font-semibold text-gray-900">Job Workflow</h3>
  </div>
  
  <div class="relative">
    <!-- Workflow Steps -->
    <div class="flex justify-between items-center relative z-10">
      {#each JOB_WORKFLOW_STEPS as step, i}
        <div class="flex flex-col items-center relative group">
          <!-- Circle indicator -->
          <button 
            on:click={() => handleStatusClick(step.status)}
            class="w-12 h-12 rounded-full flex items-center justify-center transition-all text-white
              {step.status === job.status ? getStatusClass(step.status) : 
                WORKFLOW_ORDER.indexOf(step.status) < WORKFLOW_ORDER.indexOf(job.status) ? 
                'bg-gray-300 text-gray-700' : 'bg-gray-200 text-gray-500'}
              {step.status === currentStatus ? 'ring-4 ring-blue-300 scale-110' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-md"
            aria-label={`Step ${i+1}: ${step.label}`}
          >
            {i+1}
          </button>
          
          <!-- Label below -->
          <span class="mt-2 text-sm font-medium
            {step.status === job.status ? 'text-blue-700' : 
              WORKFLOW_ORDER.indexOf(step.status) < WORKFLOW_ORDER.indexOf(job.status) ? 
              'text-gray-700' : 'text-gray-400'}">
            {step.label}
          </span>
        </div>
        
        <!-- Connector line between steps (except after the last one) -->
        {#if i < JOB_WORKFLOW_STEPS.length - 1}
          <div class="h-0.5 flex-1 mx-2
            {WORKFLOW_ORDER.indexOf(JOB_WORKFLOW_STEPS[i + 1].status) <= WORKFLOW_ORDER.indexOf(job.status) ? 
            'bg-blue-500' : 'bg-gray-300'}">
          </div>
        {/if}
      {/each}
    </div>
  </div>
  
  <!-- Current Task Section -->
  <!-- ...rest of the component... -->
</div>

<!-- Current tasks section -->
{#if currentTasks.length > 0}
  <div class="mt-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-800">Current Tasks</h3>
    <div class="grid gap-4 mt-4">
      {#if currentTasks.length === 0}
        <div class="text-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p class="text-gray-500">No tasks for the current stage</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each currentTasks as task (task.id)}
            {@const complete = isTaskComplete(task) || completedTaskIds.includes(task.id)}
            {@const canPerform = canPerformTask(task)}
            {@const isAnimating = animatingTaskIds.includes(task.id)}
            {@const showTask = task.id !== 'mark_ready_for_review' || areAllTechTasksComplete()}
            
            {#if showTask}
              <button
                type="button"
                class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-150 {
                  complete ? 'bg-green-50 border-green-300 shadow-sm' :
                  isAnimating ? 'bg-green-50 border-green-300 shadow-md scale-[1.01]' :
                  canPerform ? 'bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm' :
                  'bg-gray-50 border-gray-200 cursor-not-allowed opacity-70'
                }"
                on:click={() => handleTaskClick(task)}
                disabled={complete || !canPerform}
                title={!canPerform && !complete ? 'You cannot perform this task' : ''}
              >
                <div class="flex items-center space-x-3">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 {
                    complete ? 'bg-green-100 text-green-700' :
                    isAnimating ? 'bg-green-100 text-green-700' :
                    canPerform ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-400'
                  }">
                    {#if complete}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    {:else if isAnimating}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    {:else}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    {/if}
                  </div>
                  
                  <div class="flex-1 text-left">
                    <div class="font-medium {
                      complete ? 'text-green-800' :
                      isAnimating ? 'text-green-800' :
                      canPerform ? 'text-gray-800' : 
                      'text-gray-500'
                    }">{task.label}</div>
                    
                    {#if task.description}
                      <div class="text-xs {
                        complete ? 'text-green-600' :
                        isAnimating ? 'text-green-600' :
                        canPerform ? 'text-gray-500' : 
                        'text-gray-400'
                      }">{task.description}</div>
                    {/if}
                    
                    {#if task.id === 'mark_ready_for_review' && !complete}
                      <div class="text-xs text-green-600 mt-1">
                        All required tasks completed - ready for review
                      </div>
                    {/if}
                  </div>
                </div>
                
                <div class="flex-shrink-0">
                  {#if !complete && canPerform}
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Available</span>
                  {:else if complete}
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>
                  {:else}
                    <span class="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">Not Available</span>
                  {/if}
                </div>
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Legend -->
<div class="mt-8 text-xs text-gray-500 border-t pt-4">
  <p><span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Completed</p>
  <p><span class="inline-block w-3 h-3 rounded-full bg-dryd-orange mr-1 mt-1"></span> Current</p>
  <p><span class="inline-block w-3 h-3 rounded-full bg-gray-200 mr-1 mt-1"></span> Upcoming</p>
</div>

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
      on:taskCompleted={event => {
        handleTaskCompleted(event);
        showTaskModal = false;
        selectedTask = null;
      }}
    />
  </div>
{/if} 