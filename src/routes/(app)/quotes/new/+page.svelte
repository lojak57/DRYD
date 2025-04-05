<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { QuoteType, QuoteStatus } from '$lib/types/Quote';
  import { customers, loadCustomers } from '$lib/stores/customerStore';
  import { quoteStore } from '$lib/stores/quoteStore';
  import { currentUser } from '$lib/stores/authStore';
  import type { Customer } from '$lib/types/Customer';
  import { createQuote } from '$lib/services/quotes';
  import { addNotification } from '$lib/stores/notificationStore';
  
  // Step tracking for multi-step form
  let currentStep = 1;
  const totalSteps = 4;
  
  // For Step 2: Job details selection tracking
  let selectedProjectTypes: string[] = [];
  let selectedUrgency: string = '';
  let selectedSize: string = '';
  
  function toggleProjectType(projectType: string) {
    const index = selectedProjectTypes.indexOf(projectType);
    if (index === -1) {
      selectedProjectTypes = [...selectedProjectTypes, projectType];
    } else {
      selectedProjectTypes = selectedProjectTypes.filter(p => p !== projectType);
    }
    
    // Update scope of work
    updateScopeOfWorkFromSelections();
  }
  
  function selectUrgency(urgency: string) {
    selectedUrgency = urgency;
    // Update scope of work
    updateScopeOfWorkFromSelections();
  }
  
  function selectSize(size: string) {
    selectedSize = size;
    // Update scope of work
    updateScopeOfWorkFromSelections();
  }
  
  function updateScopeOfWorkFromSelections() {
    // Start with a clean version or keep existing custom text
    let newScopeOfWork = '';
    
    // Add project types
    if (selectedProjectTypes.length > 0) {
      const typesText = selectedProjectTypes.map(type => `${type} Restoration and Cleanup`).join('\n');
      newScopeOfWork += typesText;
    }
    
    // Add urgency if selected
    if (selectedUrgency) {
      const urgencyInfo = [
        { label: 'Emergency', desc: 'Needs immediate attention' },
        { label: 'Urgent', desc: 'Should be started within 24-48 hours' },
        { label: 'Standard', desc: 'Can be scheduled normally' }
      ].find(u => u.label === selectedUrgency);
      
      if (urgencyInfo) {
        newScopeOfWork += newScopeOfWork ? '\n\n' : '';
        newScopeOfWork += `Urgency: ${urgencyInfo.label} - ${urgencyInfo.desc}`;
      }
    }
    
    // Add size if selected
    if (selectedSize) {
      const sizeInfo = [
        { label: 'Small', desc: 'Single room or area' },
        { label: 'Medium', desc: 'Multiple rooms' },
        { label: 'Large', desc: 'Entire property' }
      ].find(s => s.label === selectedSize);
      
      if (sizeInfo) {
        newScopeOfWork += newScopeOfWork ? '\n\n' : '';
        newScopeOfWork += `Project Size: ${sizeInfo.label} - ${sizeInfo.desc}`;
      }
    }
    
    // Update scope of work
    scopeOfWork = newScopeOfWork;
  }
  
  const stepTitles = [
    "Customer Information",
    "Job Details",
    "Line Items",
    "Review & Submit"
  ];
  
  function goToStep(stepNumber: number) {
    // Don't allow skipping steps forward
    if (stepNumber > currentStep + 1) return;
    
    // Update current step
    currentStep = stepNumber;
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  function nextStep() {
    // Validate current step before proceeding
    formValidationAttempted = true;
    
    if (currentStep === 1) {
      // Validate customer info
      if (!selectedCustomerId) {
        validationErrors.customer = 'Please select a customer';
        document.getElementById('customer')?.focus();
        return;
      }
      
      // Validate site address
      if (!siteAddress.street.trim()) {
        validationErrors.street = 'Street address is required';
        document.getElementById('street')?.focus();
        return;
      }
      
      if (!siteAddress.city.trim()) {
        validationErrors.city = 'City is required';
        document.getElementById('city')?.focus();
        return;
      }
      
      if (!siteAddress.state.trim()) {
        validationErrors.state = 'State is required';
        document.getElementById('state')?.focus();
        return;
      }
      
      if (!siteAddress.zip.trim()) {
        validationErrors.zip = 'ZIP code is required';
        document.getElementById('zip')?.focus();
        return;
      }
    }
    else if (currentStep === 2) {
      // Validate job details
      if (!scopeOfWork.trim()) {
        validationErrors.scopeOfWork = 'Please enter the scope of work';
        document.getElementById('scopeOfWork')?.focus();
        return;
      }
    }
    else if (currentStep === 3) {
      // Validate line items
      if (lineItems.length === 0) {
        error = 'Please add at least one line item';
        return;
      }
      
      const emptyDescriptionItems = lineItems.filter(item => !item.description.trim());
      if (emptyDescriptionItems.length > 0) {
        error = 'Please fill in description for all line items';
        return;
      }
      
      const zeroQuantityItems = lineItems.filter(item => item.quantity <= 0);
      if (zeroQuantityItems.length > 0) {
        error = 'All line items must have a quantity greater than zero';
        return;
      }
      
      // For fixed price quotes, ensure all unit prices are set
      if (quoteType === QuoteType.FIXED_PRICE) {
        const zeroPriceItems = lineItems.filter(item => item.unitPrice <= 0);
        if (zeroPriceItems.length > 0) {
          error = 'All line items must have a price greater than zero for fixed price quotes';
          return;
        }
      }
    }
    
    // All validations passed, proceed to next step
    if (currentStep < totalSteps) {
      currentStep++;
      // Reset validation state for the next step
      formValidationAttempted = false;
      // Scroll to top
      window.scrollTo(0, 0);
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      window.scrollTo(0, 0);
    }
  }
  
  let loading = false;
  let error = '';
  let success = false;
  let customerList: Customer[] = [];
  let selectedCustomer: Customer | null = null;
  
  // Form validation state
  let formValidationAttempted = false;
  let validationErrors: Record<string, string> = {};

  // Form data
  let selectedCustomerId = '';
  let quoteType = QuoteType.FIXED_PRICE;
  let scopeOfWork = '';
  let notes = '';
  let siteAddress = {
    street: '',
    city: '',
    state: '',
    zip: '',
  };
  let lineItems = [
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0, isEstimate: false, category: '' }
  ];
  
  // Track if site address was manually edited
  let siteAddressManuallyEdited = {
    street: false,
    city: false,
    state: false,
    zip: false
  };
  
  // Watch for customer changes to auto-fill site address
  $: if (selectedCustomerId && !siteAddressManuallyEdited.street && !siteAddressManuallyEdited.city && 
         !siteAddressManuallyEdited.state && !siteAddressManuallyEdited.zip) {
    const customer = customerList.find(c => c.id === selectedCustomerId);
    if (customer?.primaryAddress) {
      siteAddress = { 
        street: customer.primaryAddress.street || '',
        city: customer.primaryAddress.city || '',
        state: customer.primaryAddress.state || '',
        zip: customer.primaryAddress.zip || ''
      };
    } else if (customer?.address) { // Fallback to legacy address field
      siteAddress = { 
        street: customer.address.street || '',
        city: customer.address.city || '',
        state: customer.address.state || '',
        zip: customer.address.zip || ''
      };
    }
  }
  
  // Update selected customer object when ID changes
  $: selectedCustomer = customerList.find(c => c.id === selectedCustomerId) || null;
  
  // Update validation state
  $: validationErrors.customer = !selectedCustomerId && formValidationAttempted ? 'Please select a customer' : '';
  $: validationErrors.scopeOfWork = !scopeOfWork.trim() && formValidationAttempted ? 'Please enter the scope of work' : '';
  
  function handleSiteAddressInput(field: keyof typeof siteAddressManuallyEdited) {
    siteAddressManuallyEdited[field] = true;
  }
  
  // For dropdown UI state
  let quickAddDropdownOpen = false;
  
  // New customer form state
  let showNewCustomerForm = false;
  let newCustomer = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    primaryAddress: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    notes: ''
  };
  let newCustomerValidationErrors: Record<string, string> = {};
  let isCreatingCustomer = false;
  
  // Reset new customer form
  function resetNewCustomerForm() {
    newCustomer = {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      primaryAddress: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      notes: ''
    };
    newCustomerValidationErrors = {};
  }
  
  // Validate new customer form
  function validateNewCustomerForm() {
    const errors: Record<string, string> = {};
    
    if (!newCustomer.name.trim()) {
      errors.name = 'Customer name is required';
    }
    
    if (!newCustomer.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newCustomer.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newCustomer.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!newCustomer.primaryAddress.street.trim()) {
      errors.street = 'Street address is required';
    }
    
    if (!newCustomer.primaryAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!newCustomer.primaryAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!newCustomer.primaryAddress.zip.trim()) {
      errors.zip = 'ZIP code is required';
    }
    
    newCustomerValidationErrors = errors;
    return Object.keys(errors).length === 0;
  }
  
  // Create new customer
  async function createNewCustomer() {
    if (isCreatingCustomer) return;
    
    if (!validateNewCustomerForm()) {
      return;
    }
    
    try {
      isCreatingCustomer = true;
      
      // In a real application, this would call an API
      // For now, just simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new customer object with an ID
      const createdCustomer = {
        ...newCustomer,
        id: `c${Date.now()}`, // Generate a unique ID
        createdAt: new Date()
      };
      
      // Update the customers store
      $customers = [...$customers, createdCustomer];
      
      // Update the customer list in this component
      customerList = [...customerList, createdCustomer];
      
      // Select the new customer
      selectedCustomerId = createdCustomer.id;
      
      // Copy the primary address to the site address
      siteAddress = { ...createdCustomer.primaryAddress };
      
      // Hide the new customer form
      showNewCustomerForm = false;
      
      // Show success notification
      addNotification({
        type: 'success',
        message: `Customer "${createdCustomer.name}" created successfully!`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error creating customer:', error);
      addNotification({
        type: 'error',
        message: 'Failed to create customer. Please try again.',
        duration: 5000
      });
    } finally {
      isCreatingCustomer = false;
    }
  }
  
  // Tax rate and calculated totals
  let taxRate = 0.0875; // 8.75% default
  let subtotal = 0;
  let taxAmount = 0;
  let total = 0;
  
  // Calculate totals whenever line items or tax rate changes
  $: {
    // Calculate line item totals
    lineItems = lineItems.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));
    
    // Calculate quote totals
    subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    taxAmount = subtotal * taxRate;
    total = subtotal + taxAmount;
  }
  
  // Additional validation for line items
  $: {
    // Update validation status for existing line items
    lineItems.forEach((item, index) => {
      const itemKey = `lineItem-${index}`;
      if (formValidationAttempted) {
        validationErrors[`${itemKey}-description`] = !item.description.trim() ? 'Description is required' : '';
        
        if (quoteType === QuoteType.FIXED_PRICE) {
          validationErrors[`${itemKey}-unitPrice`] = item.unitPrice <= 0 ? 'Price must be greater than 0' : '';
        }
        validationErrors[`${itemKey}-quantity`] = item.quantity <= 0 ? 'Quantity must be greater than 0' : '';
      }
    });
  }
  
  // Common line item categories
  const lineItemCategories = [
    'Labor',
    'Materials',
    'Equipment',
    'Supplies',
    'Subcontractor',
    'Permit',
    'Disposal',
    'Other'
  ];
  
  // Labor rate presets
  const laborRates = [
    { title: 'Emergency Response', rate: 175, description: 'After-hours emergency calls' },
    { title: 'Technician', rate: 75, description: 'General restoration technician' },
    { title: 'Senior Tech', rate: 95, description: 'Senior restoration technician' },
    { title: 'Supervisor', rate: 110, description: 'Site supervisor' },
    { title: 'Project Manager', rate: 125, description: 'Project management' },
    { title: 'Specialty Labor', rate: 150, description: 'Specialized technical work' }
  ];
  
  // Common labor tasks
  const commonLaborTasks = [
    'Water Extraction',
    'Demolition',
    'Drywall Installation',
    'Sanitization',
    'Mold Remediation',
    'Fire Damage Cleanup',
    'Content Manipulation',
    'Air Quality Testing',
    'Site Inspection'
  ];
  
  // Common materials with pricing and internal cost
  const materialItems = [
    { 
      title: 'Drywall', 
      unit: 'sheet', 
      unitPrice: 45.00, 
      internalCost: 25.00, 
      description: 'Standard drywall (4x8)' 
    },
    { 
      title: 'Paint', 
      unit: 'gallon', 
      unitPrice: 35.00, 
      internalCost: 18.50, 
      description: 'Interior paint' 
    },
    { 
      title: 'Carpet', 
      unit: 'sq ft', 
      unitPrice: 4.50, 
      internalCost: 2.25, 
      description: 'Standard carpet and pad' 
    },
    { 
      title: 'Lumber - 2x4', 
      unit: 'piece', 
      unitPrice: 8.50, 
      internalCost: 4.25, 
      description: 'Standard framing lumber' 
    },
    { 
      title: 'Antimicrobial Spray', 
      unit: 'gallon', 
      unitPrice: 75.00, 
      internalCost: 42.00, 
      description: 'Commercial-grade disinfectant' 
    },
    { 
      title: 'Moisture Barrier', 
      unit: 'roll', 
      unitPrice: 120.00, 
      internalCost: 65.00, 
      description: 'Vapor barrier (100 sq ft)' 
    },
    { 
      title: 'Laminate Flooring', 
      unit: 'sq ft', 
      unitPrice: 3.75, 
      internalCost: 1.85, 
      description: 'Standard laminate' 
    },
    { 
      title: 'Insulation', 
      unit: 'bag', 
      unitPrice: 55.00, 
      internalCost: 32.00, 
      description: 'R-15 insulation' 
    }
  ];
  
  // Common material quantities
  const commonMaterialQuantities = [1, 2, 5, 10, 25, 50, 100];
  
  // Equipment preset items
  const equipmentItems = [
    { title: 'Air Mover', unit: 'day', unitPrice: 35.00, internalCost: 15.00, description: 'Industrial air mover/fan' },
    { title: 'Dehumidifier', unit: 'day', unitPrice: 95.00, internalCost: 45.00, description: 'Commercial dehumidifier' },
    { title: 'Air Scrubber', unit: 'day', unitPrice: 85.00, internalCost: 40.00, description: 'HEPA air filtration' },
    { title: 'Water Extractor', unit: 'day', unitPrice: 125.00, internalCost: 60.00, description: 'Commercial water extractor' },
    { title: 'Thermal Imaging Camera', unit: 'day', unitPrice: 75.00, internalCost: 35.00, description: 'For moisture detection' },
    { title: 'Drying System', unit: 'day', unitPrice: 195.00, internalCost: 85.00, description: 'Complete drying system' }
  ];
  
  // Supplies preset items
  const suppliesItems = [
    { title: 'PPE Kit', unit: 'kit', unitPrice: 25.00, internalCost: 12.00, description: 'Personal protective equipment' },
    { title: 'Cleaning Supplies', unit: 'kit', unitPrice: 45.00, internalCost: 20.00, description: 'General cleaning supplies' },
    { title: 'Plastic Sheeting', unit: 'roll', unitPrice: 35.00, internalCost: 18.00, description: '10\' x 100\' plastic sheeting' },
    { title: 'Tape', unit: 'roll', unitPrice: 12.00, internalCost: 5.00, description: 'Heavy duty restoration tape' },
    { title: 'Air Filters', unit: 'pack', unitPrice: 65.00, internalCost: 30.00, description: 'HEPA filter replacements' }
  ];
  
  // Subcontractor preset items
  const subcontractorItems = [
    { title: 'Electrician', unit: 'hour', unitPrice: 95.00, internalCost: 75.00, description: 'Licensed electrical repairs' },
    { title: 'Plumber', unit: 'hour', unitPrice: 95.00, internalCost: 75.00, description: 'Licensed plumbing repairs' },
    { title: 'HVAC Specialist', unit: 'hour', unitPrice: 105.00, internalCost: 85.00, description: 'HVAC system repairs' },
    { title: 'Roofing Contractor', unit: 'sq ft', unitPrice: 8.50, internalCost: 6.50, description: 'Roof repair specialists' },
    { title: 'Asbestos Abatement', unit: 'sq ft', unitPrice: 25.00, internalCost: 18.00, description: 'Licensed asbestos removal' }
  ];
  
  // Permit preset items
  const permitItems = [
    { title: 'Building Permit', unit: 'each', unitPrice: 250.00, internalCost: 250.00, description: 'General building permit' },
    { title: 'Electrical Permit', unit: 'each', unitPrice: 150.00, internalCost: 150.00, description: 'Electrical work permit' },
    { title: 'Plumbing Permit', unit: 'each', unitPrice: 150.00, internalCost: 150.00, description: 'Plumbing work permit' },
    { title: 'Demolition Permit', unit: 'each', unitPrice: 200.00, internalCost: 200.00, description: 'Demolition work permit' },
    { title: 'Inspection Fee', unit: 'each', unitPrice: 100.00, internalCost: 100.00, description: 'City inspection fees' }
  ];
  
  // Disposal preset items
  const disposalItems = [
    { title: 'Dumpster - Small', unit: 'week', unitPrice: 350.00, internalCost: 275.00, description: '10 yard dumpster' },
    { title: 'Dumpster - Medium', unit: 'week', unitPrice: 450.00, internalCost: 350.00, description: '20 yard dumpster' },
    { title: 'Dumpster - Large', unit: 'week', unitPrice: 550.00, internalCost: 425.00, description: '30 yard dumpster' },
    { title: 'Hazardous Material Disposal', unit: 'cubic yard', unitPrice: 95.00, internalCost: 65.00, description: 'Specialized disposal' },
    { title: 'Disposal Fees', unit: 'ton', unitPrice: 75.00, internalCost: 60.00, description: 'Landfill/processing fees' }
  ];
  
  // Line item templates for quick add
  const lineItemTemplates = [
    { description: 'Labor - General', quantity: 1, unitPrice: 75, isEstimate: false, category: 'Labor' },
    { description: 'Labor - Skilled', quantity: 1, unitPrice: 95, isEstimate: false, category: 'Labor' },
    { description: 'Materials - General', quantity: 1, unitPrice: 0, isEstimate: true, category: 'Materials' },
    { description: 'Equipment Rental', quantity: 1, unitPrice: 0, isEstimate: true, category: 'Equipment' },
    { description: 'Subcontractor Services', quantity: 1, unitPrice: 0, isEstimate: true, category: 'Subcontractor' },
    { description: 'Permit Fees', quantity: 1, unitPrice: 0, isEstimate: false, category: 'Permit' },
    { description: 'Waste Disposal', quantity: 1, unitPrice: 0, isEstimate: false, category: 'Disposal' }
  ];
  
  function addTemplateItem(template: typeof lineItemTemplates[0]) {
    const newItem = {
      id: crypto.randomUUID(),
      description: template.description,
      quantity: template.quantity,
      unitPrice: template.unitPrice,
      isEstimate: template.isEstimate,
      category: template.category,
      total: template.quantity * template.unitPrice
    };
    
    lineItems = [...lineItems, newItem];
  }
  
  function duplicateLineItem(index: number) {
    const itemToDuplicate = lineItems[index];
    lineItems = [
      ...lineItems,
      { 
        id: crypto.randomUUID(), 
        description: `${itemToDuplicate.description} (copy)`,
        quantity: itemToDuplicate.quantity,
        unitPrice: itemToDuplicate.unitPrice,
        total: itemToDuplicate.quantity * itemToDuplicate.unitPrice,
        isEstimate: itemToDuplicate.isEstimate,
        category: itemToDuplicate.category
      }
    ];
  }
  
  function addLineItem() {
    lineItems = [
      ...lineItems,
      { id: crypto.randomUUID(), description: 'New Line Item', quantity: 1, unitPrice: 0, total: 0, isEstimate: false, category: 'Other' }
    ];
  }
  
  function removeLineItem(index: number) {
    lineItems = lineItems.filter((_, i) => i !== index);
  }
  
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
  
  let isSubmitting = false;
  
  async function submitQuote() {
    if (isSubmitting) return;
    
    try {
      isSubmitting = true;
      
      if (!validateAllSteps()) {
        isSubmitting = false;
        return;
      }
      
      // Create new quote object
      const newQuote = {
        customerId: selectedCustomer?.id || '',
        siteAddress: { ...siteAddress },
        status: QuoteStatus.DRAFT,
        quoteType,
        scopeOfWork,
        lineItems: [...lineItems],
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        dateCreated: new Date().toISOString(),
        preparedByUserId: $currentUser?.id || '',
      };
      
      // Save quote
      const savedQuote = await createQuote(newQuote);
      
      // Show success notification
      addNotification({
        type: 'success',
        message: `Quote #${savedQuote.quoteNumber} created successfully!`,
        duration: 5000
      });
      
      // Redirect to quotes page
      goto('/quotes');
      
    } catch (error) {
      console.error('Error creating quote:', error);
      addNotification({
        type: 'error',
        message: 'Failed to create quote. Please try again.',
        duration: 5000
      });
    } finally {
      isSubmitting = false;
    }
  }
  
  function validateAllSteps() {
    // Step 1 validation
    if (!selectedCustomer) {
      addNotification({
        type: 'error',
        message: 'Please select a customer',
        duration: 5000
      });
      goToStep(1);
      return false;
    }
    
    if (!siteAddress.street || !siteAddress.city || !siteAddress.state || !siteAddress.zip) {
      addNotification({
        type: 'error',
        message: 'Please complete the site address',
        duration: 5000
      });
      goToStep(1);
      return false;
    }
    
    // Step 2 validation
    if (!scopeOfWork || scopeOfWork.trim().length < 10) {
      addNotification({
        type: 'error',
        message: 'Please provide a detailed scope of work (at least 10 characters)',
        duration: 5000
      });
      goToStep(2);
      return false;
    }
    
    // Step 3 validation
    if (lineItems.length === 0) {
      addNotification({
        type: 'error',
        message: 'Please add at least one line item',
        duration: 5000
      });
      goToStep(3);
      return false;
    }
    
    let lineItemsValid = true;
    
    // Validate line items
    lineItems.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        addNotification({
          type: 'error',
          message: `Line item #${index + 1} is missing a description`,
          duration: 5000
        });
        lineItemsValid = false;
      }
      
      if (item.quantity <= 0) {
        addNotification({
          type: 'error',
          message: `Line item #${index + 1} has an invalid quantity`,
          duration: 5000
        });
        lineItemsValid = false;
      }
      
      // For fixed price quotes, all prices must be set
      if (quoteType === QuoteType.FIXED_PRICE && item.unitPrice <= 0) {
        addNotification({
          type: 'error',
          message: `Line item #${index + 1} has an invalid price`,
          duration: 5000
        });
        lineItemsValid = false;
      }
    });
    
    if (!lineItemsValid) {
      goToStep(3);
      return false;
    }
    
    return true;
  }
  
  // Fetch customers on mount
  onMount(async () => {
    try {
      await loadCustomers();
      customerList = $customers;
    } catch (err) {
      error = 'Failed to load customers';
    }
  });

  // Common service types/templates
  const serviceTemplates = [
    {
      id: 'water-damage',
      name: 'Water Damage Restoration',
      description: 'Complete water damage restoration services',
      products: [
        { name: 'Water Extraction', hours: 3, rate: 85, category: 'Labor' },
        { name: 'Dehumidification', hours: 48, rate: 25, category: 'Equipment' },
        { name: 'Drying Equipment Rental', days: 3, rate: 45, category: 'Equipment' },
        { name: 'Anti-microbial Treatment', sqft: 500, rate: 0.75, category: 'Materials' },
        { name: 'Moisture Testing', count: 1, rate: 125, category: 'Labor' }
      ]
    },
    {
      id: 'fire-damage',
      name: 'Fire & Smoke Damage',
      description: 'Fire and smoke damage restoration services',
      products: [
        { name: 'Soot Removal', hours: 6, rate: 95, category: 'Labor' },
        { name: 'Odor Treatment', sqft: 1000, rate: 0.50, category: 'Materials' },
        { name: 'Air Scrubber Rental', days: 5, rate: 75, category: 'Equipment' },
        { name: 'HEPA Vacuuming', sqft: 1000, rate: 0.30, category: 'Labor' },
        { name: 'Thermal Fogging', count: 1, rate: 350, category: 'Materials' }
      ]
    },
    {
      id: 'mold-remediation',
      name: 'Mold Remediation',
      description: 'Complete mold testing and remediation services',
      products: [
        { name: 'Mold Testing', count: 1, rate: 175, category: 'Labor' },
        { name: 'Containment Setup', sqft: 500, rate: 1.25, category: 'Labor' },
        { name: 'HEPA Filtration', days: 3, rate: 85, category: 'Equipment' },
        { name: 'Mold Removal', sqft: 100, rate: 8.50, category: 'Labor' },
        { name: 'Antimicrobial Application', sqft: 500, rate: 0.95, category: 'Materials' }
      ]
    },
    {
      id: 'storm-damage',
      name: 'Storm Damage Repair',
      description: 'Storm and weather damage restoration services',
      products: [
        { name: 'Roof Tarping', sqft: 500, rate: 1.75, category: 'Labor' },
        { name: 'Water Extraction', hours: 4, rate: 85, category: 'Labor' },
        { name: 'Structural Drying', days: 3, rate: 195, category: 'Equipment' },
        { name: 'Debris Removal', hours: 3, rate: 75, category: 'Labor' },
        { name: 'Board-up Services', sqft: 100, rate: 4.50, category: 'Materials' }
      ]
    },
    {
      id: 'biohazard',
      name: 'Biohazard Cleanup',
      description: 'Professional biohazard cleaning and decontamination',
      products: [
        { name: 'PPE and Safety Equipment', count: 1, rate: 350, category: 'Materials' },
        { name: 'Biohazard Remediation', hours: 8, rate: 150, category: 'Labor' },
        { name: 'Waste Disposal', count: 1, rate: 450, category: 'Disposal' },
        { name: 'Sanitization Treatment', sqft: 500, rate: 1.50, category: 'Materials' },
        { name: 'Air Treatment', days: 2, rate: 125, category: 'Equipment' }
      ]
    },
    {
      id: 'reconstruction',
      name: 'Reconstruction Services',
      description: 'Rebuilding and restoration after damage',
      products: [
        { name: 'Drywall Installation', sqft: 500, rate: 3.25, category: 'Labor' },
        { name: 'Painting', sqft: 1000, rate: 1.15, category: 'Labor' },
        { name: 'Flooring Replacement', sqft: 500, rate: 7.50, category: 'Materials' },
        { name: 'Trim & Finish Work', hours: 16, rate: 85, category: 'Labor' },
        { name: 'Debris Removal', count: 1, rate: 275, category: 'Disposal' }
      ]
    }
  ];
  
  // Selected service templates and included products
  let selectedServiceIds: string[] = [];
  let includedProducts: Record<string, boolean> = {};
  let customQuantities: Record<string, number> = {};
  
  // Function to toggle service selection
  function toggleService(serviceId: string) {
    const index = selectedServiceIds.indexOf(serviceId);
    if (index === -1) {
      // Add service
      selectedServiceIds = [...selectedServiceIds, serviceId];
      
      // Initialize all products as included by default
      const service = serviceTemplates.find(s => s.id === serviceId);
      if (service) {
        service.products.forEach((product, idx) => {
          const productKey = `${serviceId}-${idx}`;
          includedProducts[productKey] = true;
          
          // Set default quantity based on product type
          if ('hours' in product && product.hours !== undefined) {
            customQuantities[productKey] = product.hours;
          } else if ('days' in product && product.days !== undefined) {
            customQuantities[productKey] = product.days;
          } else if ('sqft' in product && product.sqft !== undefined) {
            customQuantities[productKey] = product.sqft;
          } else if ('count' in product && product.count !== undefined) {
            customQuantities[productKey] = product.count;
          } else {
            customQuantities[productKey] = 1;
          }
        });
      }
    } else {
      // Remove service
      selectedServiceIds = selectedServiceIds.filter(id => id !== serviceId);
      
      // Clean up related products
      Object.keys(includedProducts).forEach(key => {
        if (key.startsWith(`${serviceId}-`)) {
          delete includedProducts[key];
          delete customQuantities[key];
        }
      });
    }
  }
  
  // Function to toggle individual product inclusion
  function toggleProduct(serviceId: string, productIndex: number) {
    const productKey = `${serviceId}-${productIndex}`;
    includedProducts[productKey] = !includedProducts[productKey];
  }
  
  // Function to update product quantity
  function updateProductQuantity(serviceId: string, productIndex: number, quantity: number) {
    const productKey = `${serviceId}-${productIndex}`;
    customQuantities[productKey] = quantity;
  }
  
  // Function to generate line items from selected services
  function generateLineItemsFromServices() {
    // Clear existing line items if user confirms
    if (lineItems.length > 0) {
      if (!confirm('This will replace your current line items. Continue?')) {
        return;
      }
    }
    
    let generatedItems: typeof lineItems = [];
    
    // Generate line items for each selected service and included product
    selectedServiceIds.forEach(serviceId => {
      const service = serviceTemplates.find(s => s.id === serviceId);
      if (service) {
        // Add each included product as a line item
        service.products.forEach((product, idx) => {
          const productKey = `${serviceId}-${idx}`;
          
          // Only add if product is included
          if (includedProducts[productKey]) {
            const quantity = customQuantities[productKey] || 1;
            let description = product.name;
            let unitPrice = product.rate;
            
            // Add unit information to description
            if ('hours' in product) description += ' (hourly rate)';
            else if ('days' in product) description += ' (daily rate)';
            else if ('sqft' in product) description += ' (per sq ft)';
            
            generatedItems.push({
              id: crypto.randomUUID(),
              description,
              quantity,
              unitPrice,
              total: quantity * unitPrice,
              isEstimate: quoteType === QuoteType.T_AND_E,
              category: product.category
            });
          }
        });
      }
    });
    
    // Update line items
    if (generatedItems.length > 0) {
      lineItems = generatedItems;
      
      // Also update the scope of work text if it's empty
      if (!scopeOfWork.trim()) {
        scopeOfWork = selectedServiceIds
          .map(id => {
            const service = serviceTemplates.find(s => s.id === id);
            return service?.description || '';
          })
          .filter(desc => desc)
          .join('\n\n');
      }
    }
  }
  
  // For tracking line item wizard state
  let showLineItemWizard = false;
  let lineItemWizard = {
    category: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    internalCost: 0,
    isEstimate: false
  };
  
  // Reset line item wizard
  function resetLineItemWizard() {
    lineItemWizard = {
      category: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      internalCost: 0,
      isEstimate: false
    };
  }
  
  // Set labor rate preset
  function setLaborRate(ratePreset: typeof laborRates[0]) {
    lineItemWizard.unitPrice = ratePreset.rate;
    lineItemWizard.internalCost = ratePreset.rate * 0.6; // Example: internal cost is 60% of rate
    if (!lineItemWizard.description.includes(ratePreset.title)) {
      // Only add the title if it's not already there
      const task = lineItemWizard.description.split(' - ')[0] || '';
      if (task && commonLaborTasks.includes(task)) {
        lineItemWizard.description = `${task} - ${ratePreset.title}`;
      } else if (!lineItemWizard.description) {
        lineItemWizard.description = ratePreset.title;
      }
    }
  }
  
  // Set labor task
  function setLaborTask(task: string) {
    const currentTitle = lineItemWizard.description.split(' - ')[1] || '';
    if (currentTitle) {
      lineItemWizard.description = `${task} - ${currentTitle}`;
    } else {
      lineItemWizard.description = task;
    }
  }
  
  // Set material item
  function setMaterialItem(material: typeof materialItems[0]) {
    lineItemWizard.description = `${material.title} - ${material.description}`;
    lineItemWizard.unitPrice = material.unitPrice;
    lineItemWizard.internalCost = material.internalCost;
  }
  
  // Set equipment item
  function setEquipmentItem(equipment: typeof equipmentItems[0]) {
    lineItemWizard.description = `${equipment.title} - ${equipment.description}`;
    lineItemWizard.unitPrice = equipment.unitPrice;
    lineItemWizard.internalCost = equipment.internalCost;
  }
  
  // Set supplies item
  function setSuppliesItem(supplies: typeof suppliesItems[0]) {
    lineItemWizard.description = `${supplies.title} - ${supplies.description}`;
    lineItemWizard.unitPrice = supplies.unitPrice;
    lineItemWizard.internalCost = supplies.internalCost;
  }
  
  // Set subcontractor item
  function setSubcontractorItem(subcontractor: typeof subcontractorItems[0]) {
    lineItemWizard.description = `${subcontractor.title} - ${subcontractor.description}`;
    lineItemWizard.unitPrice = subcontractor.unitPrice;
    lineItemWizard.internalCost = subcontractor.internalCost;
  }
  
  // Set permit item
  function setPermitItem(permit: typeof permitItems[0]) {
    lineItemWizard.description = `${permit.title} - ${permit.description}`;
    lineItemWizard.unitPrice = permit.unitPrice;
    lineItemWizard.internalCost = permit.internalCost;
  }
  
  // Set disposal item
  function setDisposalItem(disposal: typeof disposalItems[0]) {
    lineItemWizard.description = `${disposal.title} - ${disposal.description}`;
    lineItemWizard.unitPrice = disposal.unitPrice;
    lineItemWizard.internalCost = disposal.internalCost;
  }
  
  // Add line item from wizard
  function addLineItemFromWizard() {
    if (!lineItemWizard.description.trim()) {
      return;
    }
    
    lineItems = [
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: lineItemWizard.description,
        quantity: lineItemWizard.quantity,
        unitPrice: lineItemWizard.unitPrice,
        internalCost: lineItemWizard.internalCost,
        total: lineItemWizard.quantity * lineItemWizard.unitPrice,
        isEstimate: lineItemWizard.isEstimate,
        category: lineItemWizard.category
      }
    ];
    
    resetLineItemWizard();
    showLineItemWizard = false;
  }

  // Form steps
  const STEPS = [
    { id: 1, title: 'Customer Info' },
    { id: 2, title: 'Job Details' },
    { id: 3, title: 'Line Items' },
    { id: 4, title: 'Review & Submit' }
  ];

  // Service types for display
  const serviceTypes = [
    { id: 'water-damage', label: 'Water Damage' },
    { id: 'fire-damage', label: 'Fire Damage' },
    { id: 'mold-remediation', label: 'Mold Remediation' },
    { id: 'storm-damage', label: 'Storm Damage' },
    { id: 'biohazard', label: 'Biohazard' },
    { id: 'reconstruction', label: 'Reconstruction' }
  ];

  // Urgency options
  const urgencyOptions = [
    { value: 'emergency', label: 'Emergency', desc: 'Needs immediate attention' },
    { value: 'urgent', label: 'Urgent', desc: 'Should be started within 24-48 hours' },
    { value: 'standard', label: 'Standard', desc: 'Can be scheduled normally' }
  ];

  // Size options
  const sizeOptions = [
    { label: 'Small', desc: 'Single room or area' },
    { label: 'Medium', desc: 'Multiple rooms' },
    { label: 'Large', desc: 'Entire property' }
  ];
</script>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-semibold text-gray-800">Create New Quote</h1>
    
    <div class="flex gap-4">
      <button
        type="button"
        class="flex items-center px-4 py-2 bg-dryd-blue text-white rounded-lg hover:bg-dryd-blue-dark transition-colors duration-200 shadow-sm"
        on:click={() => goto('/dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Back to Dashboard
      </button>
      
      <button
        type="button"
        class="text-gray-600 hover:text-gray-900"
        on:click={() => goto('/quotes')}
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Quotes
        </span>
      </button>
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div class="mb-8">
    <div class="flex justify-between mb-2">
      {#each STEPS as step}
        <div 
          class="flex flex-col items-center"
          class:text-dryd-blue={currentStep >= step.id}
          class:text-gray-400={currentStep < step.id}
        >
          <button 
            type="button"
            class="w-8 h-8 rounded-full flex items-center justify-center mb-1 focus:outline-none"
            class:bg-dryd-blue={currentStep >= step.id}
            class:text-white={currentStep >= step.id}
            class:bg-gray-200={currentStep < step.id}
            on:click={() => {
              if (currentStep > step.id) {
                goToStep(step.id);
              }
            }}
            disabled={currentStep < step.id}
          >
            {step.id}
          </button>
          <span class="text-xs sm:text-sm text-center">{step.title}</span>
        </div>
        
        {#if step.id < STEPS.length}
          <div class="flex-1 flex items-center">
            <div 
              class="h-0.5 w-full"
              class:bg-dryd-blue={currentStep > step.id}
              class:bg-gray-200={currentStep <= step.id}
            ></div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  
  <!-- Form Content -->
  <form on:submit|preventDefault={submitQuote}>
    <!-- Step 1: Customer Information -->
    {#if currentStep === 1}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Customer Selection -->
        <Card className="h-full">
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-4">Customer Information</h2>
            
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <label for="customer" class="block text-sm font-medium text-gray-700">
                  Select Customer <span class="text-red-500">*</span>
                </label>
                <button 
                  type="button"
                  class="text-sm text-dryd-blue hover:text-dryd-blue-dark font-medium flex items-center"
                  on:click={() => {
                    resetNewCustomerForm();
                    showNewCustomerForm = true;
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  New Customer
                </button>
              </div>
              <div class="relative">
                <select 
                  id="customer"
                  bind:value={selectedCustomerId}
                  class="w-full p-2 border {validationErrors.customer ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  disabled={$customers.length === 0}
                  aria-invalid={!!validationErrors.customer}
                  aria-describedby={validationErrors.customer ? "customer-error" : undefined}
                >
                  <option value="">Select a customer</option>
                  {#each customerList as customer}
                    <option value={customer.id}>{customer.name}</option>
                  {/each}
                </select>
                
                {#if customerList.length === 0}
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">Loading customers...</p>
                {/if}
                
                {#if validationErrors.customer}
                  <p id="customer-error" class="mt-1 text-sm text-red-600">{validationErrors.customer}</p>
                {/if}
                
                {#if selectedCustomer}
                  <div class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="font-medium text-gray-800">{selectedCustomer.name}</p>
                    {#if selectedCustomer.phone}
                      <p class="text-sm text-gray-600 mt-1">
                        <span class="inline-block w-5 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </span>
                        {selectedCustomer.phone}
                      </p>
                    {/if}
                    {#if selectedCustomer.email}
                      <p class="text-sm text-gray-600 mt-1">
                        <span class="inline-block w-5 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </span>
                        {selectedCustomer.email}
                      </p>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
            
            <div class="mb-4">
              <label for="quoteType" class="block text-sm font-medium text-gray-700 mb-1">
                Quote Type <span class="text-red-500">*</span>
              </label>
              <select 
                id="quoteType"
                bind:value={quoteType}
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
              >
                <option value={QuoteType.FIXED_PRICE}>Fixed Price</option>
                <option value={QuoteType.T_AND_E}>Time & Expense</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">
                {#if quoteType === QuoteType.FIXED_PRICE}
                  Fixed price quotes provide a set price for the entire project.
                {:else}
                  Time & Expense quotes estimate costs but final billing will be based on actual time and materials.
                {/if}
              </p>
            </div>
          </div>
        </Card>
        
        <!-- Site Address -->
        <Card className="h-full">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Site Address</h2>
              {#if selectedCustomer?.primaryAddress}
                <button 
                  type="button"
                  class="text-sm text-dryd-blue hover:text-dryd-blue-dark font-medium"
                  on:click={() => {
                    siteAddress = { 
                      street: selectedCustomer.primaryAddress.street || '',
                      city: selectedCustomer.primaryAddress.city || '',
                      state: selectedCustomer.primaryAddress.state || '',
                      zip: selectedCustomer.primaryAddress.zip || ''
                    };
                    siteAddressManuallyEdited = { street: false, city: false, state: false, zip: false };
                  }}
                >
                  Use Primary Address
                </button>
              {:else if selectedCustomer?.address}
                <button 
                  type="button"
                  class="text-sm text-dryd-blue hover:text-dryd-blue-dark font-medium"
                  on:click={() => {
                    if (selectedCustomer && selectedCustomer.address) {
                      siteAddress = { 
                        street: selectedCustomer.address.street || '',
                        city: selectedCustomer.address.city || '',
                        state: selectedCustomer.address.state || '',
                        zip: selectedCustomer.address.zip || ''
                      };
                      siteAddressManuallyEdited = { street: false, city: false, state: false, zip: false };
                    }
                  }}
                >
                  Use Customer Address
                </button>
              {/if}
            </div>
            
            <div class="mb-4">
              <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
                Street <span class="text-red-500">*</span>
              </label>
              <input 
                id="street"
                type="text"
                bind:value={siteAddress.street}
                on:input={() => handleSiteAddressInput('street')}
                class="w-full p-2 border {validationErrors.street ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                aria-invalid={!!validationErrors.street}
                aria-describedby={validationErrors.street ? "street-error" : undefined}
              />
              {#if validationErrors.street}
                <p id="street-error" class="mt-1 text-sm text-red-600">{validationErrors.street}</p>
              {/if}
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="mb-4">
                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                  City <span class="text-red-500">*</span>
                </label>
                <input 
                  id="city"
                  type="text"
                  bind:value={siteAddress.city}
                  on:input={() => handleSiteAddressInput('city')}
                  class="w-full p-2 border {validationErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  aria-invalid={!!validationErrors.city}
                  aria-describedby={validationErrors.city ? "city-error" : undefined}
                />
                {#if validationErrors.city}
                  <p id="city-error" class="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                {/if}
              </div>
              
              <div class="mb-4">
                <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
                  State <span class="text-red-500">*</span>
                </label>
                <input 
                  id="state"
                  type="text"
                  bind:value={siteAddress.state}
                  on:input={() => handleSiteAddressInput('state')}
                  class="w-full p-2 border {validationErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  aria-invalid={!!validationErrors.state}
                  aria-describedby={validationErrors.state ? "state-error" : undefined}
                />
                {#if validationErrors.state}
                  <p id="state-error" class="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                {/if}
              </div>
              
              <div class="mb-4">
                <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">
                  ZIP <span class="text-red-500">*</span>
                </label>
                <input 
                  id="zip"
                  type="text"
                  bind:value={siteAddress.zip}
                  on:input={() => handleSiteAddressInput('zip')}
                  class="w-full p-2 border {validationErrors.zip ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  aria-invalid={!!validationErrors.zip}
                  aria-describedby={validationErrors.zip ? "zip-error" : undefined}
                />
                {#if validationErrors.zip}
                  <p id="zip-error" class="mt-1 text-sm text-red-600">{validationErrors.zip}</p>
                {/if}
              </div>
            </div>
          </div>
        </Card>
      </div>
    {/if}
    
    <!-- Step 2: Job Details -->
    {#if currentStep === 2}
      <Card className="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">
            Job Details <span class="text-red-500">*</span>
          </h2>
          
          <!-- Guided question approach for job details -->
          <div class="space-y-6">
            <div>
              <p class="font-medium text-gray-700 mb-2">What type of project is this?</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                {#each serviceTypes as projectType}
                  <button
                    type="button"
                    class="border rounded-lg p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300
                    {selectedProjectTypes.includes(projectType.id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300'}"
                    on:click={() => toggleProjectType(projectType.id)}
                  >
                    <div class="font-medium flex items-center">
                      <div class="w-5 h-5 border rounded mr-2 flex items-center justify-center
                        {selectedProjectTypes.includes(projectType.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}">
                        {#if selectedProjectTypes.includes(projectType.id)}
                          <svg class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        {/if}
                      </div>
                      {projectType.label}
                    </div>
                    <p class="text-sm text-gray-500 mt-1 ml-7">Click to select</p>
                  </button>
                {/each}
              </div>
            </div>
            
            <div>
              <p class="font-medium text-gray-700 mb-2">How urgent is this project?</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                {#each urgencyOptions as urgency}
                  <button
                    type="button"
                    class="border rounded-lg p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300
                    {selectedUrgency === urgency.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300'}"
                    on:click={() => selectUrgency(urgency.value)}
                  >
                    <div class="font-medium flex items-center">
                      <div class="w-5 h-5 border rounded-full mr-2 flex items-center justify-center
                        {selectedUrgency === urgency.value ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}">
                        {#if selectedUrgency === urgency.value}
                          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                        {/if}
                      </div>
                      {urgency.label}
                    </div>
                    <p class="text-sm text-gray-500 mt-1 ml-7">{urgency.desc}</p>
                  </button>
                {/each}
              </div>
            </div>
            
            <div>
              <p class="font-medium text-gray-700 mb-2">Estimated project size?</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                {#each sizeOptions as size}
                  <button
                    type="button"
                    class="border rounded-lg p-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300
                    {selectedSize === size.label ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-300'}"
                    on:click={() => selectSize(size.label)}
                  >
                    <div class="font-medium flex items-center">
                      <div class="w-5 h-5 border rounded-full mr-2 flex items-center justify-center
                        {selectedSize === size.label ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}">
                        {#if selectedSize === size.label}
                          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                        {/if}
                      </div>
                      {size.label}
                    </div>
                    <p class="text-sm text-gray-500 mt-1 ml-7">{size.desc}</p>
                  </button>
                {/each}
              </div>
            </div>
            
            <div>
              <label for="scopeOfWork" class="block font-medium text-gray-700 mb-2">
                Detailed scope of work
                <span class="text-red-500">*</span>
              </label>
              <textarea 
                id="scopeOfWork"
                bind:value={scopeOfWork}
                rows="6"
                placeholder="Describe in detail what work will be performed. Include relevant measurements, materials, and any special requirements."
                class="w-full p-2 border {validationErrors.scopeOfWork ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                aria-invalid={!!validationErrors.scopeOfWork}
                aria-describedby={validationErrors.scopeOfWork ? "scopeOfWork-error" : undefined}
              ></textarea>
              
              {#if validationErrors.scopeOfWork}
                <p id="scopeOfWork-error" class="mt-1 text-sm text-red-600">{validationErrors.scopeOfWork}</p>
              {/if}
              
              <div class="mt-2 text-sm text-gray-500">
                <p>Tips for a good scope of work:</p>
                <ul class="list-disc pl-5 mt-1 space-y-1">
                  <li>Be specific about what work will be performed</li>
                  <li>Include any relevant measurements or specifications</li>
                  <li>Note any customer expectations or requirements</li>
                  <li>Specify what is NOT included in the scope if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    {/if}
    
    <!-- Step 3: Line Items -->
    {#if currentStep === 3}
      <Card className="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">
            Line Items <span class="text-red-500">*</span>
          </h2>
          
          <div class="mb-4">
            <p class="text-gray-700">Add the individual line items for your quote. Be as detailed as possible.</p>
            {#if quoteType === QuoteType.T_AND_E}
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-3">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Time & Expense Quote</h3>
                    <div class="mt-2 text-sm text-blue-700">
                      <p>For T&E quotes, mark uncertain costs as "Estimated" using the Est? checkbox. Final billing will be based on actual time and materials used.</p>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Line Item Wizard Button -->
          {#if !showLineItemWizard}
            <div class="mb-4">
              <Button 
                type="button" 
                color="primary"
                on:click={() => {
                  resetLineItemWizard();
                  showLineItemWizard = true;
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Line Item with Wizard
              </Button>
            </div>
          {/if}
          
          <!-- Line Item Wizard -->
          {#if showLineItemWizard}
            <div class="mb-6 border border-blue-200 rounded-lg bg-blue-50 p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-medium text-lg">Line Item Builder</h3>
                <button 
                  type="button" 
                  class="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-blue-100" 
                  on:click={() => showLineItemWizard = false}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="grid gap-4 mb-4">
                <!-- Category Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {#each lineItemCategories as category}
                      <button 
                        type="button"
                        class="p-2 border rounded text-center text-sm transition-all {lineItemWizard.category === category ? 'bg-blue-100 border-blue-400 font-medium shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                        on:click={() => lineItemWizard.category = category}
                      >
                        {category}
                      </button>
                    {/each}
                  </div>
                </div>
                
                <!-- Labor-specific options -->
                {#if lineItemWizard.category === 'Labor'}
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Labor Type & Rate</label>
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {#each laborRates as ratePreset}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.unitPrice === ratePreset.rate ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setLaborRate(ratePreset)}
                          >
                            <div class="font-medium">{ratePreset.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{ratePreset.description}</span>
                              <span class="font-medium text-blue-700">${ratePreset.rate}/hr</span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Labor Tasks</label>
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {#each commonLaborTasks as task}
                          <button 
                            type="button"
                            class="p-2 border rounded text-center text-sm transition-all {lineItemWizard.description.startsWith(task) ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setLaborTask(task)}
                          >
                            {task}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                      <div class="flex items-center">
                        <input 
                          type="range"
                          min="1"
                          max="40"
                          step="0.5"
                          bind:value={lineItemWizard.quantity}
                          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div class="ml-4 flex items-center">
                          <input 
                            type="number"
                            bind:value={lineItemWizard.quantity}
                            min="0.5"
                            step="0.5"
                            class="w-20 p-2 border border-gray-300 rounded-lg text-center"
                          />
                          <span class="ml-2 text-sm text-gray-600">hours</span>
                        </div>
                      </div>
                      <div class="flex justify-around mt-2">
                        {#each [1, 2, 4, 8, 16, 24, 40] as hour}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === hour ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = hour}
                          >
                            {hour}h
                          </button>
                        {/each}
                      </div>
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Materials'}
                  <!-- Materials section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Materials</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each materialItems as material}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${material.title} - ${material.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setMaterialItem(material)}
                          >
                            <div class="font-medium">{material.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{material.description}</span>
                              <span class="font-medium text-blue-700">
                                ${material.unitPrice}/{material.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${material.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {materialItems.find(m => lineItemWizard.description.startsWith(m.title))?.unit || 'units'}
                          {:else}
                            units
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Equipment'}
                  <!-- Equipment section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Equipment</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each equipmentItems as equipment}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${equipment.title} - ${equipment.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setEquipmentItem(equipment)}
                          >
                            <div class="font-medium">{equipment.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{equipment.description}</span>
                              <span class="font-medium text-blue-700">
                                ${equipment.unitPrice}/{equipment.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${equipment.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {equipmentItems.find(e => lineItemWizard.description.startsWith(e.title))?.unit || 'units'}
                          {:else}
                            units
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Supplies'}
                  <!-- Supplies section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Supplies</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each suppliesItems as supplies}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${supplies.title} - ${supplies.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setSuppliesItem(supplies)}
                          >
                            <div class="font-medium">{supplies.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{supplies.description}</span>
                              <span class="font-medium text-blue-700">
                                ${supplies.unitPrice}/{supplies.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${supplies.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {suppliesItems.find(s => lineItemWizard.description.startsWith(s.title))?.unit || 'units'}
                          {:else}
                            units
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Subcontractor'}
                  <!-- Subcontractor section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Subcontractors</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each subcontractorItems as subcontractor}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${subcontractor.title} - ${subcontractor.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setSubcontractorItem(subcontractor)}
                          >
                            <div class="font-medium">{subcontractor.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{subcontractor.description}</span>
                              <span class="font-medium text-blue-700">
                                ${subcontractor.unitPrice}/{subcontractor.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${subcontractor.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {subcontractorItems.find(s => lineItemWizard.description.startsWith(s.title))?.unit || 'hours'}
                          {:else}
                            hours
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Permit'}
                  <!-- Permit section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Permits</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each permitItems as permit}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${permit.title} - ${permit.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setPermitItem(permit)}
                          >
                            <div class="font-medium">{permit.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{permit.description}</span>
                              <span class="font-medium text-blue-700">
                                ${permit.unitPrice}/{permit.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${permit.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {permitItems.find(p => lineItemWizard.description.startsWith(p.title))?.unit || 'each'}
                          {:else}
                            each
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else if lineItemWizard.category === 'Disposal'}
                  <!-- Disposal section content -->
                  <div class="border-t border-blue-200 pt-4">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Common Disposal</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {#each disposalItems as disposal}
                          <button 
                            type="button"
                            class="p-2 border rounded text-left text-sm transition-all {lineItemWizard.description === `${disposal.title} - ${disposal.description}` ? 'bg-blue-100 border-blue-400 shadow-sm' : 'border-gray-300 hover:bg-gray-50'}"
                            on:click={() => setDisposalItem(disposal)}
                          >
                            <div class="font-medium">{disposal.title}</div>
                            <div class="flex justify-between text-xs">
                              <span class="text-gray-600">{disposal.description}</span>
                              <span class="font-medium text-blue-700">
                                ${disposal.unitPrice}/{disposal.unit}
                                {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                                  <span class="text-gray-500 ml-1">
                                    (cost: ${disposal.internalCost})
                                  </span>
                                {/if}
                              </span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div class="flex items-center">
                        <input 
                          type="number"
                          bind:value={lineItemWizard.quantity}
                          min="1"
                          class="w-24 p-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span class="ml-2 text-sm text-gray-600">
                          {#if lineItemWizard.description}
                            {disposalItems.find(d => lineItemWizard.description.startsWith(d.title))?.unit || 'weeks'}
                          {:else}
                            weeks
                          {/if}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each commonMaterialQuantities as qty}
                          <button 
                            type="button"
                            class="px-2 py-1 text-xs {lineItemWizard.quantity === qty ? 'bg-blue-100 text-blue-700 font-medium rounded' : 'text-gray-600 hover:bg-gray-100 rounded'}"
                            on:click={() => lineItemWizard.quantity = qty}
                          >
                            {qty}
                          </button>
                        {/each}
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={lineItemWizard.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Internal Cost ($)</label>
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={lineItemWizard.internalCost}
                              min="0"
                              step="0.01"
                              class="w-full p-2 pl-6 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
                
                {#if quoteType === QuoteType.T_AND_E}
                  <div>
                    <label class="flex items-center">
                      <input 
                        type="checkbox"
                        bind:checked={lineItemWizard.isEstimate}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">This is an estimate (actual cost may vary)</span>
                    </label>
                  </div>
                {/if}
                
                <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <div class="text-sm">
                    <div class="font-medium text-gray-700">Summary:</div>
                    {#if lineItemWizard.description}
                      <div class="text-gray-800 font-medium">{lineItemWizard.description}</div>
                    {/if}
                    <div>
                      <span class="text-gray-600">{lineItemWizard.quantity} × ${lineItemWizard.unitPrice} =</span> 
                      <span class="font-bold">{formatCurrency(lineItemWizard.quantity * lineItemWizard.unitPrice)}</span>
                    </div>
                  </div>
                  
                  <div class="flex gap-2">
                    <button 
                      type="button" 
                      class="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      on:click={() => {
                        resetLineItemWizard();
                      }}
                    >
                      Reset
                    </button>
                    
                    <button 
                      type="button" 
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      on:click={addLineItemFromWizard}
                      disabled={!lineItemWizard.description.trim() || lineItemWizard.quantity <= 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                      Add to Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Line Items Table -->
          {#if lineItems.length === 0}
            <div class="bg-red-50 p-4 rounded-lg border border-red-200 text-center mb-4">
              <p class="text-red-700">At least one line item is required</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="px-2 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                    <th class="px-2 py-2 text-right text-sm font-medium text-gray-500">Qty</th>
                    <th class="px-2 py-2 text-right text-sm font-medium text-gray-500">Unit Price</th>
                    {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                      <th class="px-2 py-2 text-right text-sm font-medium text-gray-500">Int. Cost</th>
                    {/if}
                    <th class="px-2 py-2 text-right text-sm font-medium text-gray-500">Total</th>
                    {#if quoteType === QuoteType.T_AND_E}
                      <th class="px-2 py-2 text-center text-sm font-medium text-gray-500">Est?</th>
                    {/if}
                    <th class="px-2 py-2 text-center text-sm font-medium text-gray-500">Category</th>
                    <th class="px-2 py-2 text-center text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each lineItems as item, index}
                    {@const itemKey = `lineItem-${index}`}
                    <tr class="border-b border-gray-100">
                      <td class="px-2 py-2">
                        <input 
                          type="text"
                          bind:value={item.description}
                          placeholder="Item description"
                          class="w-full p-1.5 border {validationErrors[`${itemKey}-description`] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm"
                          aria-invalid={!!validationErrors[`${itemKey}-description`]}
                        />
                        {#if validationErrors[`${itemKey}-description`]}
                          <p class="mt-1 text-xs text-red-600">{validationErrors[`${itemKey}-description`]}</p>
                        {/if}
                      </td>
                      <td class="px-2 py-2">
                        <input 
                          type="number"
                          bind:value={item.quantity}
                          min="1"
                          class="w-24 p-1.5 border {validationErrors[`${itemKey}-quantity`] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm text-right"
                          aria-invalid={!!validationErrors[`${itemKey}-quantity`]}
                        />
                        {#if validationErrors[`${itemKey}-quantity`]}
                          <p class="mt-1 text-xs text-red-600">{validationErrors[`${itemKey}-quantity`]}</p>
                        {/if}
                      </td>
                      <td class="px-2 py-2">
                        <div class="relative">
                          <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                          <input 
                            type="number"
                            bind:value={item.unitPrice}
                            min="0"
                            step="0.01"
                            class="w-32 p-1.5 pl-6 border {validationErrors[`${itemKey}-unitPrice`] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm text-right"
                            aria-invalid={!!validationErrors[`${itemKey}-unitPrice`]}
                          />
                          {#if validationErrors[`${itemKey}-unitPrice`]}
                            <p class="mt-1 text-xs text-red-600">{validationErrors[`${itemKey}-unitPrice`]}</p>
                          {/if}
                        </div>
                      </td>
                      {#if $currentUser?.role === 'ADMIN' || $currentUser?.role === 'OFFICE'}
                        <td class="px-2 py-2">
                          <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-gray-500 text-sm">$</span>
                            <input 
                              type="number"
                              bind:value={item.internalCost}
                              min="0"
                              step="0.01"
                              class="w-32 p-1.5 pl-6 border border-gray-300 rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm text-right"
                            />
                          </div>
                        </td>
                      {/if}
                      <td class="px-2 py-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      {#if quoteType === QuoteType.T_AND_E}
                        <td class="px-2 py-2 text-center">
                          <input 
                            type="checkbox"
                            bind:checked={item.isEstimate}
                            class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
                            title={item.isEstimate ? "This is an estimate - actual cost may vary" : "Fixed price item"}
                          />
                        </td>
                      {/if}
                      <td class="px-2 py-2">
                        <select
                          bind:value={item.category}
                          class="w-full p-1.5 border border-gray-300 rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm"
                        >
                          <option value="">Select Category</option>
                          {#each lineItemCategories as category}
                            <option value={category}>{category}</option>
                          {/each}
                        </select>
                      </td>
                      <td class="px-2 py-2 text-center">
                        <div class="flex justify-center space-x-1">
                          <button 
                            type="button"
                            class="text-indigo-600 hover:text-indigo-800"
                            on:click={() => duplicateLineItem(index)}
                            title="Duplicate item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button 
                            type="button"
                            class="text-red-600 hover:text-red-800"
                            on:click={() => removeLineItem(index)}
                            title="Remove item"
                            disabled={lineItems.length === 1}
                            class:opacity-50={lineItems.length === 1}
                            class:cursor-not-allowed={lineItems.length === 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
            
            <div class="mt-6 flex justify-end">
              <div class="w-64">
                <div class="flex justify-between py-2 text-sm">
                  <span>Subtotal:</span>
                  <span class="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div class="flex justify-between items-center py-2 text-sm">
                  <label for="taxRate" class="flex items-center">
                    Tax Rate:
                    <input 
                      id="taxRate"
                      type="number"
                      bind:value={taxRate}
                      min="0"
                      max="1"
                      step="0.0001"
                      class="ml-2 w-16 p-1 border border-gray-300 rounded-md focus:ring-dryd-blue focus:border-dryd-blue text-sm text-right"
                    />
                  </label>
                  <span class="font-medium">({(taxRate * 100).toFixed(2)}%)</span>
                </div>
                
                <div class="flex justify-between py-2 text-sm">
                  <span>Tax:</span>
                  <span class="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                
                <div class="flex justify-between py-2 border-t border-gray-200 text-base font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </Card>
    {/if}
    
    <!-- Step 4: Review & Submit -->
    {#if currentStep === 4}
      <Card className="mb-6">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">
            Review & Submit
          </h2>
          
          <div class="space-y-6">
            <!-- Customer Information Review -->
            <div>
              <h3 class="text-md font-medium border-b border-gray-200 pb-2 mb-3">Customer Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-sm text-gray-500 mb-1">Customer</p>
                    <p class="font-medium">{selectedCustomer?.name || 'Not selected'}</p>
                    
                    {#if selectedCustomer}
                      <div class="mt-2">
                        {#if selectedCustomer.phone}
                          <p class="text-sm text-gray-600">
                            <span class="inline-block w-4 text-gray-400 mr-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </span>
                            {selectedCustomer.phone}
                          </p>
                        {/if}
                        {#if selectedCustomer.email}
                          <p class="text-sm text-gray-600">
                            <span class="inline-block w-4 text-gray-400 mr-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </span>
                            {selectedCustomer.email}
                          </p>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
                
                <div>
                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-sm text-gray-500 mb-1">Site Address</p>
                    <p class="font-medium">{siteAddress.street}</p>
                    <p class="text-sm">{siteAddress.city}, {siteAddress.state} {siteAddress.zip}</p>
                    
                    <p class="text-sm text-gray-500 mt-3 mb-1">Quote Type</p>
                    <p class="font-medium">{quoteType === QuoteType.FIXED_PRICE ? 'Fixed Price' : 'Time & Expense'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Scope of Work Review -->
            <div>
              <h3 class="text-md font-medium border-b border-gray-200 pb-2 mb-3">Scope of Work</h3>
              
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="whitespace-pre-line">{scopeOfWork}</div>
              </div>
            </div>
            
            <!-- Line Items Review -->
            <div>
              <h3 class="text-md font-medium border-b border-gray-200 pb-2 mb-3">Line Items</h3>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each lineItems as item}
                      <tr class="border-t border-gray-200">
                        <td class="px-3 py-2 whitespace-normal">
                          <div class="font-medium">
                            {item.description} 
                            {#if item.isEstimate}
                              <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-1">Estimate</span>
                            {/if}
                          </div>
                          {#if item.category}
                            <div class="text-xs text-gray-500">{item.category}</div>
                          {/if}
                        </td>
                        <td class="px-3 py-2 text-right">{item.quantity}</td>
                        <td class="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td class="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    {/each}
                    <tr class="border-t border-gray-200 bg-gray-50">
                      <td colspan="3" class="px-3 py-2 text-right font-medium">Subtotal</td>
                      <td class="px-3 py-2 text-right font-medium">{formatCurrency(subtotal)}</td>
                    </tr>
                    <tr class="border-t border-gray-100">
                      <td colspan="3" class="px-3 py-2 text-right text-sm">Tax ({(taxRate * 100).toFixed(2)}%)</td>
                      <td class="px-3 py-2 text-right">{formatCurrency(taxAmount)}</td>
                    </tr>
                    <tr class="border-t border-gray-200 bg-gray-100">
                      <td colspan="3" class="px-3 py-2 text-right font-medium">Total</td>
                      <td class="px-3 py-2 text-right font-bold text-base">{formatCurrency(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Notes Review -->
            {#if notes}
              <div>
                <h3 class="text-md font-medium border-b border-gray-200 pb-2 mb-3">Additional Notes</h3>
                
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="whitespace-pre-line">{notes}</div>
                </div>
              </div>
            {/if}
            
            <!-- Edit buttons -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                type="button"
                class="text-gray-600 hover:text-dryd-blue flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-dryd-blue hover:bg-blue-50"
                on:click={() => goToStep(1)}
              >
                <span class="text-xl mb-1">1</span>
                <span class="text-sm">Edit Customer Info</span>
              </button>
              
              <button 
                type="button"
                class="text-gray-600 hover:text-dryd-blue flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-dryd-blue hover:bg-blue-50"
                on:click={() => goToStep(2)}
              >
                <span class="text-xl mb-1">2</span>
                <span class="text-sm">Edit Job Details</span>
              </button>
              
              <button 
                type="button"
                class="text-gray-600 hover:text-dryd-blue flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-dryd-blue hover:bg-blue-50"
                on:click={() => goToStep(3)}
              >
                <span class="text-xl mb-1">3</span>
                <span class="text-sm">Edit Line Items</span>
              </button>
              
              <div class="bg-green-50 p-3 border border-green-200 rounded-lg text-center">
                <p class="text-sm text-green-700">Ready to submit?</p>
                <p class="text-xs text-gray-500 mt-1">Use the button below</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    {/if}
    
    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-8 mb-4">
      {#if currentStep > 1}
        <button 
          type="button" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-dryd-blue-dark hover:shadow-md transition-all duration-200"
          on:click={prevStep}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Previous
          </span>
        </button>
      {:else}
        <div></div> <!-- Empty div for flex layout -->
      {/if}
      
      {#if currentStep < totalSteps}
        <button 
          type="button" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-dryd-blue-dark hover:shadow-md transition-all duration-200"
          on:click={nextStep}
        >
          <span class="flex items-center">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
      {:else}
        <button 
          type="submit" 
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-dryd-blue-dark hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          {:else}
            Submit Quote
          {/if}
        </button>
      {/if}
    </div>
    
    <!-- New Customer Modal -->
    {#if showNewCustomerForm}
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-100 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Create New Customer</h2>
              <button 
                type="button"
                class="text-gray-500 hover:text-gray-700"
                on:click={() => showNewCustomerForm = false}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form on:submit|preventDefault={createNewCustomer} class="space-y-4">
              <!-- Customer Name -->
              <div>
                <label for="newCustomerName" class="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span class="text-red-500">*</span>
                </label>
                <input 
                  id="newCustomerName"
                  type="text"
                  bind:value={newCustomer.name}
                  class="w-full p-2 border {newCustomerValidationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  placeholder="Enter customer name"
                />
                {#if newCustomerValidationErrors.name}
                  <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.name}</p>
                {/if}
              </div>
              
              <!-- Contact Person -->
              <div>
                <label for="newCustomerContact" class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input 
                  id="newCustomerContact"
                  type="text"
                  bind:value={newCustomer.contactPerson}
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  placeholder="Enter contact person's name"
                />
              </div>
              
              <!-- Email and Phone - Two columns -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="newCustomerEmail" class="block text-sm font-medium text-gray-700 mb-1">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="newCustomerEmail"
                    type="email"
                    bind:value={newCustomer.email}
                    class="w-full p-2 border {newCustomerValidationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                    placeholder="Enter email address"
                  />
                  {#if newCustomerValidationErrors.email}
                    <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.email}</p>
                  {/if}
                </div>
                <div>
                  <label for="newCustomerPhone" class="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="newCustomerPhone"
                    type="tel"
                    bind:value={newCustomer.phone}
                    class="w-full p-2 border {newCustomerValidationErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                    placeholder="Enter phone number"
                  />
                  {#if newCustomerValidationErrors.phone}
                    <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.phone}</p>
                  {/if}
                </div>
              </div>
              
              <!-- Address Section -->
              <div>
                <h3 class="text-md font-medium text-gray-700 mb-2">Primary Address</h3>
                
                <!-- Street -->
                <div class="mb-3">
                  <label for="newCustomerStreet" class="block text-sm font-medium text-gray-700 mb-1">
                    Street <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="newCustomerStreet"
                    type="text"
                    bind:value={newCustomer.primaryAddress.street}
                    class="w-full p-2 border {newCustomerValidationErrors.street ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                    placeholder="Enter street address"
                  />
                  {#if newCustomerValidationErrors.street}
                    <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.street}</p>
                  {/if}
                </div>
                
                <!-- City, State, ZIP -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="col-span-2">
                    <label for="newCustomerCity" class="block text-sm font-medium text-gray-700 mb-1">
                      City <span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="newCustomerCity"
                      type="text"
                      bind:value={newCustomer.primaryAddress.city}
                      class="w-full p-2 border {newCustomerValidationErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                      placeholder="City"
                    />
                    {#if newCustomerValidationErrors.city}
                      <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.city}</p>
                    {/if}
                  </div>
                  <div>
                    <label for="newCustomerState" class="block text-sm font-medium text-gray-700 mb-1">
                      State <span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="newCustomerState"
                      type="text"
                      bind:value={newCustomer.primaryAddress.state}
                      class="w-full p-2 border {newCustomerValidationErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                      placeholder="State"
                    />
                    {#if newCustomerValidationErrors.state}
                      <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.state}</p>
                    {/if}
                  </div>
                  <div>
                    <label for="newCustomerZip" class="block text-sm font-medium text-gray-700 mb-1">
                      ZIP <span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="newCustomerZip"
                      type="text"
                      bind:value={newCustomer.primaryAddress.zip}
                      class="w-full p-2 border {newCustomerValidationErrors.zip ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                      placeholder="ZIP"
                    />
                    {#if newCustomerValidationErrors.zip}
                      <p class="mt-1 text-sm text-red-600">{newCustomerValidationErrors.zip}</p>
                    {/if}
                  </div>
                </div>
              </div>
              
              <!-- Notes -->
              <div>
                <label for="newCustomerNotes" class="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea 
                  id="newCustomerNotes"
                  bind:value={newCustomer.notes}
                  class="w-full p-2 border border-gray-300 rounded-lg focus:ring-dryd-blue focus:border-dryd-blue"
                  rows="3"
                  placeholder="Enter any additional notes about this customer"
                ></textarea>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
                  on:click={() => showNewCustomerForm = false}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-dryd-blue border border-transparent rounded-md shadow-sm hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
                  disabled={isCreatingCustomer}
                >
                  {#if isCreatingCustomer}
                    <span class="inline-flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  {:else}
                    Create Customer
                  {/if}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>