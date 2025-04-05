<script lang="ts">
  import { formatDateDistance, formatDateTime } from '$lib/utils/dateUtils';
  import type { LogEntry } from '$lib/types/LogEntry';
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { PaymentData } from '$lib/types/LogEntry';
  import type { EquipmentLogData } from '$lib/types/Equipment';
  
  export let logEntry: LogEntry;
  
  // Helper function to get the badge class based on log entry type
  function getBadgeClass(type: LogEntryType): string {
    switch (type) {
      case LogEntryType.NOTE:
        return 'bg-blue-100 text-blue-800';
      case LogEntryType.MOISTURE_READING:
      case LogEntryType.TEMPERATURE_READING:
      case LogEntryType.HUMIDITY_READING:
        return 'bg-indigo-100 text-indigo-800';
      case LogEntryType.PHOTO:
        return 'bg-purple-100 text-purple-800';
      case LogEntryType.EQUIPMENT_PLACEMENT:
        return 'bg-green-100 text-green-800';
      case LogEntryType.EQUIPMENT_REMOVAL:
        return 'bg-amber-100 text-amber-800';
      case LogEntryType.PAYMENT:
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Helper function to get the icon based on log entry type
  function getIconSvg(type: LogEntryType): string {
    switch (type) {
      case LogEntryType.NOTE:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 4z"/>';
      case LogEntryType.MOISTURE_READING:
      case LogEntryType.TEMPERATURE_READING:
      case LogEntryType.HUMIDITY_READING:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2m0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 21h10a2 2 0 0 0 2-2v-4"/>';
      case LogEntryType.PHOTO:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>';
      case LogEntryType.EQUIPMENT_PLACEMENT:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M9 11l-4 4M15 8l-2 2M12 16l-3-3M8 15l-1.5 1.5M14 14l1 1"/>';
      case LogEntryType.EQUIPMENT_REMOVAL:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M10 4v4m4-4v4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 14l2 2m0 0l2-2m-2 2V12"/>';
      case LogEntryType.PAYMENT:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 20 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>';
      default:
        return '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>';
    }
  }
  
  // Helper function to get display string for log entry type
  function getEntryTypeDisplay(type: LogEntryType): string {
    switch (type) {
      case LogEntryType.NOTE:
        return 'Note';
      case LogEntryType.MOISTURE_READING:
        return 'Moisture Reading';
      case LogEntryType.TEMPERATURE_READING:
        return 'Temperature Reading';
      case LogEntryType.HUMIDITY_READING:
        return 'Humidity Reading';
      case LogEntryType.PHOTO:
        return 'Photo';
      case LogEntryType.EQUIPMENT_PLACEMENT:
        return 'Equipment Placed';
      case LogEntryType.EQUIPMENT_REMOVAL:
        return 'Equipment Removed';
      case LogEntryType.PAYMENT:
        return 'Payment Received';
      default:
        return 'Entry';
    }
  }
  
  // Format details for equipment log entry
  function getEquipmentDetails(logEntry: LogEntry): string {
    const equipData = logEntry.content as EquipmentLogData;
    if (!equipData || typeof equipData !== 'object') return '';
    
    const equipType = 'equipmentType' in equipData ? equipData.equipmentType : '';
    const model = 'model' in equipData ? equipData.model : '';
    const location = 'location' in equipData ? equipData.location : '';
    
    let details = `${equipType} ${model ? `- ${model}` : ''}`;
    
    if (location) {
      details += ` at ${location}`;
    }
    
    return details;
  }
  
  // Helper to safely get note content
  function getNoteContent(logEntry: LogEntry): string {
    if (typeof logEntry.content === 'string') {
      return logEntry.content;
    }
    
    if (typeof logEntry.content === 'object' && logEntry.content && 'notes' in logEntry.content) {
      return logEntry.content.notes as string;
    }
    
    return '';
  }
  
  // Helper to safely get reading data
  function getReadingData(logEntry: LogEntry): { value: number, unit: string, location: string } | null {
    if (typeof logEntry.content !== 'object' || !logEntry.content) return null;
    
    if ('value' in logEntry.content && 'location' in logEntry.content) {
      const data = logEntry.content as any;
      const unit = logEntry.type === LogEntryType.MOISTURE_READING ? '%' : 
                  logEntry.type === LogEntryType.TEMPERATURE_READING ? '°F' : 
                  logEntry.type === LogEntryType.HUMIDITY_READING ? '%RH' : '';
      
      return {
        value: data.value,
        unit,
        location: data.location
      };
    }
    
    return null;
  }
  
  // Helper to safely get photo URL
  function getPhotoUrl(logEntry: LogEntry): string | null {
    if (logEntry.type !== LogEntryType.PHOTO) return null;
    
    if (typeof logEntry.content === 'object' && logEntry.content && 'url' in logEntry.content) {
      return logEntry.content.url as string;
    }
    
    return null;
  }

  // Get technician name
  function getTechnicianName(logEntry: LogEntry): string {
    // Show a more friendly name format
    return logEntry.userId.startsWith('u') ? `Technician ${logEntry.userId.substring(1)}` : logEntry.userId;
  }

  // Helper function to get payment details
  function getPaymentDetails(logEntry: LogEntry): string {
    if (logEntry.type !== LogEntryType.PAYMENT || typeof logEntry.content !== 'object') {
      return '';
    }
    
    const paymentData = logEntry.content as PaymentData;
    if (!paymentData) return '';
    
    const amount = paymentData.amount ? `$${paymentData.amount.toFixed(2)}` : '';
    const method = paymentData.method || '';
    const reference = paymentData.referenceNumber ? `(Ref: ${paymentData.referenceNumber})` : '';
    
    return `${amount} received via ${method} ${reference}`.trim();
  }
</script>

{#if logEntry}
<div class="card-container bg-white rounded-lg shadow p-4 relative transition-all hover:shadow-md">
  <div class="flex items-start">
    <!-- Icon -->
    <div class="mr-3 mt-1 flex-shrink-0">
      <div class={`p-2 rounded-full ${getBadgeClass(logEntry.type)} inline-flex`}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
          {@html getIconSvg(logEntry.type)}
        </svg>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex flex-wrap justify-between items-center mb-2">
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(logEntry.type)} mr-2`}>
          {getEntryTypeDisplay(logEntry.type)}
        </span>
        <div class="flex items-center">
          <span class="text-xs text-gray-500 whitespace-nowrap" title={formatDateTime(logEntry.timestamp)}>
            {formatDateDistance(logEntry.timestamp)}
          </span>
          <span class="text-xs text-gray-400 ml-2 hidden sm:inline">•</span>
          <span class="text-xs text-gray-400 ml-2 hidden sm:inline">{getTechnicianName(logEntry)}</span>
        </div>
      </div>
      
      {#if logEntry.type === LogEntryType.NOTE}
        <p class="text-gray-800 text-sm whitespace-pre-line">{getNoteContent(logEntry)}</p>
      {:else if logEntry.type === LogEntryType.MOISTURE_READING || logEntry.type === LogEntryType.TEMPERATURE_READING || logEntry.type === LogEntryType.HUMIDITY_READING}
        {@const readingData = getReadingData(logEntry)}
        {#if readingData}
        <div class="space-y-1">
          <p class="text-gray-700 text-sm font-medium">
            Value: <span class="font-bold">{readingData.value} {readingData.unit}</span>
          </p>
          <p class="text-gray-700 text-sm">Location: {readingData.location || 'Not specified'}</p>
          {#if typeof logEntry.content === 'object' && logEntry.content && 'notes' in logEntry.content}
            <p class="text-gray-700 text-sm mt-2">{logEntry.content.notes}</p>
          {/if}
        </div>
        {/if}
      {:else if logEntry.type === LogEntryType.PHOTO}
        <div class="space-y-2">
          {#if getPhotoUrl(logEntry)}
            {@const photoUrl = getPhotoUrl(logEntry)}
            <div class="mt-1 relative">
              <a href={photoUrl} target="_blank" rel="noopener noreferrer">
                <img src={photoUrl} alt="Photo log" class="rounded-md max-h-48 w-auto object-cover hover:opacity-90 transition-opacity cursor-pointer" />
              </a>
            </div>
          {/if}
          {#if typeof logEntry.content === 'object' && logEntry.content && 'caption' in logEntry.content}
            <p class="text-gray-700 text-sm">{logEntry.content.caption}</p>
          {/if}
        </div>
      {:else if logEntry.type === LogEntryType.EQUIPMENT_PLACEMENT || logEntry.type === LogEntryType.EQUIPMENT_REMOVAL}
        <div class="space-y-1">
          <p class="text-gray-800 text-sm font-medium">{getEquipmentDetails(logEntry)}</p>
          {#if typeof logEntry.content === 'object' && logEntry.content && 'serialNumber' in logEntry.content}
            <p class="text-gray-600 text-xs">S/N: {logEntry.content.serialNumber}</p>
          {/if}
          {#if typeof logEntry.content === 'object' && logEntry.content && 'notes' in logEntry.content}
            <p class="text-gray-700 text-sm mt-2">{logEntry.content.notes}</p>
          {/if}
        </div>
      {:else if logEntry.type === LogEntryType.PAYMENT}
        <div class="space-y-1">
          <p class="text-gray-800 text-sm font-medium">{getPaymentDetails(logEntry)}</p>
        </div>
      {/if}
    </div>
  </div>
</div>
{:else}
<div class="card-container bg-white rounded-lg shadow p-4 relative transition-all">
  <p class="text-gray-500 text-sm">Log entry not available</p>
</div>
{/if}

<style>
  .card-container {
    position: relative;
    will-change: opacity, transform;
  }
</style> 