<script lang="ts">
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry } from '$lib/types/LogEntry';
  import { addLogEntry } from '$lib/services/logEntries';
  import { createEventDispatcher } from 'svelte';
  
  export let jobId: string;
  export let userId: string;
  
  let noteText = '';
  let isSubmitting = false;
  let errorMessage = '';
  
  // Add structured data for notes
  let noteCategory = '';
  let noteTemplate = '';
  
  // Note categories with associated templates
  const noteCategories = [
    { value: 'status_update', label: 'Status Update' },
    { value: 'customer_contact', label: 'Customer Contact' },
    { value: 'issue', label: 'Issue/Problem' },
    { value: 'resolution', label: 'Resolution' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'general', label: 'General Note' }
  ];
  
  // Templates for each category with proper index signature
  const noteTemplates: { [key: string]: string[] } = {
    status_update: [
      'Work is progressing according to schedule.',
      'Project is experiencing delays due to: [reason].',
      'Phase [number] completed. Moving to next phase.',
      'Current dry-out progress at [percentage]%.',
      'Equipment has been running for [time] with good progress.'
    ],
    customer_contact: [
      'Spoke with [name]. They have approved [details].',
      'Customer reported new issue: [details].',
      'Scheduled follow-up visit with customer for [date/time].',
      'Left voicemail for customer regarding [topic].',
      'Customer has concerns about [details]. Need to address by [date].'
    ],
    issue: [
      'Discovered additional water damage in [location].',
      'Found mold behind [location]. Requires assessment.',
      'Equipment malfunction: [details].',
      'Access issue: [details].',
      'Safety concern identified: [details].'
    ],
    resolution: [
      'Resolved issue with [details].',
      'Repaired damaged [item/area] by [method].',
      'Replaced faulty equipment [details].',
      'Successfully dried affected area in [location].',
      'Completed mold remediation in [location].'
    ],
    follow_up: [
      'Need to follow up on [topic] by [date].',
      'Schedule inspection of [area] within [timeframe].',
      'Awaiting customer decision on [topic].',
      'Will check moisture levels again on [date].',
      'Pending third-party approval for [details].'
    ],
    general: [
      'Weather conditions on site: [details].',
      'Building owner was present during visit.',
      'Took additional photographs of [area].',
      'Explained process to [person] on site.',
      'Building conditions note: [details].'
    ]
  };
  
  // Function to handle template selection
  function handleTemplateSelect() {
    if (noteTemplate) {
      // Append selected template to existing note or set as new note
      if (noteText.trim()) {
        noteText = noteText.trim() + '\n\n' + noteTemplate;
      } else {
        noteText = noteTemplate;
      }
      
      // Reset template selector
      noteTemplate = '';
    }
  }
  
  // Function to handle category changes
  function handleCategoryChange() {
    // Reset template when category changes
    noteTemplate = '';
  }
  
  // Prepare the full note with category header
  function prepareNote() {
    const categoryLabel = noteCategory ? 
      noteCategories.find(c => c.value === noteCategory)?.label : '';
    
    if (categoryLabel) {
      return `[${categoryLabel}]\n${noteText.trim()}`;
    }
    
    return noteText.trim();
  }
  
  const dispatch = createEventDispatcher<{
    submit: LogEntry;
  }>();
  
  async function handleSubmit() {
    if (!noteText.trim()) return;
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      // Call the service function with the prepared note
      const newEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: LogEntryType.NOTE,
        content: prepareNote()
      });
      
      // Dispatch the new entry to the parent component
      dispatch('submit', newEntry);
      
      // Reset form
      noteText = '';
      noteCategory = '';
      noteTemplate = '';
    } catch (err) {
      console.error('Error adding note:', err);
      errorMessage = 'Failed to add note. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Add Note</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Note Category -->
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
    
    <!-- Template Selection (visible only when category is selected) -->
    {#if noteCategory}
      <div>
        <label for="note-template" class="block text-sm font-medium text-gray-700 mb-1">Quick Templates</label>
        <div class="flex gap-2">
          <select
            id="note-template"
            bind:value={noteTemplate}
            class="flex-grow px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="">-- Select Template --</option>
            {#each noteTemplates[noteCategory] || [] as template}
              <option value={template}>{template}</option>
            {/each}
          </select>
          <button
            type="button"
            on:click={handleTemplateSelect}
            disabled={!noteTemplate || isSubmitting}
            class="px-3 py-2 bg-gray-200 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">Select a template to add it to your note.</p>
      </div>
    {/if}
    
    <!-- Note Content -->
    <div>
      <label for="note-content" class="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
      <textarea
        id="note-content"
        bind:value={noteText}
        rows="4"
        placeholder="Enter job note... Replace [placeholders] with specific details"
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
        disabled={isSubmitting}
      ></textarea>
      
      {#if errorMessage}
        <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
      {/if}
    </div>
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting || !noteText.trim()}
        class="px-4 py-2 bg-dryd-blue text-white font-medium rounded-md shadow-sm hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        {:else}
          Add Note
        {/if}
      </button>
    </div>
  </form>
</div> 