<script lang="ts">
  import { LogEntryType } from '$lib/types/LogEntry';
  import type { LogEntry, ExpenseData } from '$lib/types/LogEntry';
  import { addLogEntry } from '$lib/services/logEntries';
  import { parseReceiptWithOpenAI, categorizeExpense, generateExpenseDescription } from '$lib/services/openai';
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  
  export let jobId: string;
  export let userId: string;
  
  let fileInput: HTMLInputElement;
  let selectedFiles: FileList | null = null;
  let description = '';
  let amount = '';
  let vendor = '';
  let category = '';
  let expenseDate = format(new Date(), 'yyyy-MM-dd');
  let isSubmitting = false;
  let errorMessage = '';
  let previewUrl: string | null = null;
  let isParsing = false;
  let debugInfo = '';
  
  // Expense categories
  const expenseCategories = [
    { value: 'materials', label: 'Materials & Supplies' },
    { value: 'equipment', label: 'Equipment Rental' },
    { value: 'travel', label: 'Travel & Mileage' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'labor', label: 'Labor (Subcontractors)' },
    { value: 'permits', label: 'Permits & Licenses' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' }
  ];
  
  const dispatch = createEventDispatcher<{
    submit: LogEntry;
  }>();
  
  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFiles = input.files;
      
      // Create a preview for the selected image
      const file = input.files[0];
      previewUrl = URL.createObjectURL(file);
      
      debugInfo = `Selected file: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB, type: ${file.type}`;
      console.log(debugInfo);
      
      // Automatically parse the receipt using OpenAI
      await parseReceiptWithAI(file);
    } else {
      selectedFiles = null;
      previewUrl = null;
      debugInfo = '';
    }
  }
  
  // Function to parse receipt with OpenAI
  async function parseReceiptWithAI(file: File) {
    isParsing = true;
    errorMessage = '';
    debugInfo = `Starting to parse receipt: ${file.name}`;
    console.log(debugInfo);
    
    try {
      // Convert file to base64
      const base64Image = await fileToBase64(file);
      debugInfo += `\nConverted image to base64 (${base64Image.substring(0, 20)}...)`;
      console.log(`Converted image to base64, length: ${base64Image.length} chars`);
      
      // Call the OpenAI service to parse the receipt
      console.log('Calling OpenAI API for receipt parsing...');
      const parsingResult = await parseReceiptWithOpenAI(base64Image);
      
      debugInfo += `\nReceived parsing result: ${JSON.stringify(parsingResult)}`;
      console.log('Parsing result:', parsingResult);
      
      // Update form fields with parsed data
      vendor = parsingResult.vendor;
      expenseDate = parsingResult.date;
      amount = parsingResult.amount;
      
      // If category is not provided, try to determine it based on vendor and description
      if (!parsingResult.category) {
        console.log('Category not provided, determining based on vendor and description');
        category = await categorizeExpense(
          parsingResult.vendor, 
          parsingResult.description || ''
        );
      } else {
        category = parsingResult.category;
      }
      
      // If description is not provided, try to generate one based on items
      if (!parsingResult.description && parsingResult.items && parsingResult.items.length > 0) {
        console.log('Description not provided, generating based on items');
        description = await generateExpenseDescription(parsingResult.items);
      } else {
        description = parsingResult.description || '';
      }
      
      debugInfo += `\nForm updated with parsed data: vendor=${vendor}, date=${expenseDate}, amount=${amount}, category=${category}`;
      
    } catch (error) {
      console.error("Error parsing receipt:", error);
      errorMessage = "Failed to parse receipt. Please fill in the details manually.";
      debugInfo += `\nError parsing receipt: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      isParsing = false;
    }
  }
  
  // Helper function to convert File to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }
  
  function validateForm(): boolean {
    if (!selectedFiles || selectedFiles.length === 0) {
      errorMessage = "Please upload a photo of the receipt";
      return false;
    }
    
    if (!description.trim()) {
      errorMessage = "Please enter a description";
      return false;
    }
    
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      errorMessage = "Please enter a valid amount";
      return false;
    }
    
    if (!vendor.trim()) {
      errorMessage = "Please enter a vendor name";
      return false;
    }
    
    if (!category) {
      errorMessage = "Please select a category";
      return false;
    }
    
    return true;
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    errorMessage = '';
    
    try {
      const file = selectedFiles![0];
      
      // In a real app, we would upload the file to storage here
      // For the prototype, we'll just log the metadata
      
      // Create a simulated receipt URL (would be a real URL in production)
      const simulatedReceiptUrl = `/assets/receipts/job-${jobId}-${Date.now()}.jpg`;
      
      // Prepare the expense content object
      const expenseContent: ExpenseData = {
        receiptUrl: simulatedReceiptUrl,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date(expenseDate),
        vendor: vendor.trim(),
        approved: false,
        reimbursed: false
      };
      
      // Call the service function to add the log entry
      const newEntry = await addLogEntry({
        jobId,
        userId,
        timestamp: new Date(),
        type: LogEntryType.EXPENSE,
        content: expenseContent
      });
      
      // Dispatch the new entry to the parent component
      dispatch('submit', newEntry);
      
      // Reset form
      selectedFiles = null;
      description = '';
      amount = '';
      vendor = '';
      category = '';
      expenseDate = format(new Date(), 'yyyy-MM-dd');
      previewUrl = null;
      debugInfo = '';
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      console.error('Error adding expense:', err);
      errorMessage = 'Failed to add expense. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Take a photo with camera
  function openCamera() {
    if (fileInput) {
      fileInput.setAttribute('capture', 'environment');
      fileInput.click();
    }
  }
  
  // Cleanup preview URL when component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  });
</script>

<div class="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
  <h3 class="text-lg font-semibold mb-3 text-gray-800">Add Expense</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="expense-photo" class="block text-sm font-medium text-gray-700 mb-1">Receipt Photo</label>
      <input
        id="expense-photo"
        type="file"
        accept="image/*"
        bind:this={fileInput}
        on:change={handleFileChange}
        class="hidden"
      />
      
      <div class="flex space-x-2">
        <button
          type="button"
          on:click={openCamera}
          class="px-3 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isParsing}
        >
          <span class="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            Take Photo
          </span>
        </button>
        
        <button
          type="button"
          on:click={() => fileInput?.click()}
          class="px-3 py-2 bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isParsing}
        >
          <span class="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3zm5 3a5 5 0 00-10 0v4a5 5 0 0010 0V7z" clip-rule="evenodd" />
              <path d="M14 7a6 6 0 00-12 0v4a6 6 0 0012 0V7zm-1 4a5 5 0 01-10 0V7a5 5 0 0110 0v4z" />
            </svg>
            Upload File
          </span>
        </button>
      </div>
      
      {#if previewUrl}
        <div class="mt-2 border rounded overflow-hidden relative">
          <img src={previewUrl} alt="Receipt preview" class="w-full h-auto max-h-48 object-contain" />
          
          {#if isParsing}
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div class="text-white text-center">
                <svg class="animate-spin h-8 w-8 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-2 font-medium">Parsing receipt with AI...</p>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      
      {#if debugInfo && import.meta.env.DEV}
        <div class="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
          <div class="font-semibold mb-1">Debug Info:</div>
          {debugInfo}
        </div>
      {/if}
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="expense-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            id="expense-amount"
            type="text"
            inputmode="decimal"
            bind:value={amount}
            placeholder="0.00"
            class="w-full pl-7 pr-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting || isParsing}
          />
        </div>
      </div>
      
      <div>
        <label for="expense-date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          id="expense-date"
          type="date"
          bind:value={expenseDate}
          class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting || isParsing}
        />
      </div>
    </div>
    
    <div>
      <label for="expense-vendor" class="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
      <input
        id="expense-vendor"
        type="text"
        bind:value={vendor}
        placeholder="Enter vendor name..."
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSubmitting || isParsing}
      />
    </div>
    
    <div>
      <label for="expense-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
      <select
        id="expense-category"
        bind:value={category}
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSubmitting || isParsing}
      >
        <option value="">-- Select Category --</option>
        {#each expenseCategories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
    </div>
    
    <div>
      <label for="expense-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        id="expense-description"
        bind:value={description}
        placeholder="Enter a description of this expense..."
        rows="3"
        class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSubmitting || isParsing}
      ></textarea>
    </div>
    
    {#if errorMessage}
      <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
    {/if}
    
    <div class="flex justify-end">
      <button
        type="submit"
        disabled={isSubmitting || isParsing}
        class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[.98] active:brightness-90 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
          Submit Expense
        {/if}
      </button>
    </div>
  </form>
</div> 