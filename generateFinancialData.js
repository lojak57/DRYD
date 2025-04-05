// generateFinancialData.js
// Run with: node generateFinancialData.js
// Generates a full year of financial data for reporting purposes

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const OUTPUT_DIR = path.join(__dirname, 'src', 'lib', 'mock'); // Use __dirname for current directory
const JOBS_PER_MONTH = {
  // Define busy and slow seasons (more jobs in summer, after storms, etc.)
  0: 15,  // January
  1: 10,  // February
  2: 20,  // March (spring storms)
  3: 25,  // April (spring storms)
  4: 30,  // May
  5: 35,  // June
  6: 40,  // July (peak season)
  7: 45,  // August (peak season)
  8: 30,  // September
  9: 25,  // October
  10: 15, // November
  11: 10  // December
};
const TOTAL_JOBS = Object.values(JOBS_PER_MONTH).reduce((a, b) => a + b, 0);
const TAX_RATE = 0.0875; // 8.75% tax
const STARTING_YEAR = 2024;

// Define JobStatus enum (mirroring Job.ts)
const JobStatus = {
  NEW: 'NEW',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  PENDING_COMPLETION: 'PENDING_COMPLETION', 
  COMPLETED: 'COMPLETED',
  INVOICE_APPROVAL: 'INVOICE_APPROVAL',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

// Define JobType enum with relative frequency
const JobType = {
  WATER: { name: 'WATER', frequency: 0.35 },   // Most common
  FIRE: { name: 'FIRE', frequency: 0.15 },
  MOLD: { name: 'MOLD', frequency: 0.25 },
  SMOKE: { name: 'SMOKE', frequency: 0.10 },
  STORM: { name: 'STORM', frequency: 0.10 },
  OTHER: { name: 'OTHER', frequency: 0.05 }    // Least common
};

// Define price ranges by job type
const JOB_TYPE_PRICE_RANGES = {
  WATER: { min: 1500, max: 8000, avgMargin: 0.45 },
  FIRE: { min: 5000, max: 20000, avgMargin: 0.35 },
  MOLD: { min: 2000, max: 10000, avgMargin: 0.55 },
  SMOKE: { min: 1500, max: 7000, avgMargin: 0.60 },
  STORM: { min: 3000, max: 15000, avgMargin: 0.40 },
  OTHER: { min: 1000, max: 5000, avgMargin: 0.50 }
};

// Customer data (names, addresses, etc.)
const CUSTOMER_NAMES = [
  "Smith Family Residence", "Johnson Property", "Williams Home", "Brown Residence", "Jones Estate",
  "Garcia Family Home", "Miller Property", "Davis Residence", "Rodriguez Estate", "Martinez Home",
  "Hernandez Property", "Lopez Residence", "Gonzalez Home", "Wilson Property", "Anderson Residence",
  "Mountain View Apartments", "Oakwood Condominiums", "Riverside Mall", "Downtown Office Center",
  "Clearwater Hospital", "Lakeside Hotel", "Green Valley School", "Sunset Restaurant", "Pioneer Bank",
  "Metro Fitness Center", "Harbor View Clinic", "Willow Creek Church", "Eastside Retail Plaza",
  "Golden Age Retirement Home", "Stonebridge Corporate Center", "Magnolia Apartments", "Cedar Ridge Condos",
  "Parkview Office Building", "Grand Central Hotel", "Valley Medical Center", "Westfield Mall"
];

const CITIES = [
  { city: "Springfield", state: "IL", zipCodes: ["62701", "62702", "62703", "62704", "62705"] },
  { city: "Riverdale", state: "CA", zipCodes: ["90001", "90002", "90003", "90004"] },
  { city: "Oakdale", state: "WA", zipCodes: ["98001", "98002", "98003"] },
  { city: "Lakeside", state: "TX", zipCodes: ["75001", "75002", "75003", "75004"] },
  { city: "Hillcrest", state: "NY", zipCodes: ["10001", "10002", "10003"] }
];

// Payment methods with relative frequencies
const PAYMENT_METHODS = [
  { method: "CREDIT_CARD", frequency: 0.45 },
  { method: "CHECK", frequency: 0.30 },
  { method: "BANK_TRANSFER", frequency: 0.20 },
  { method: "CASH", frequency: 0.05 }
];

// Helper Functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = (min, max, precision = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

// Weighted random selection based on frequency
const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.frequency, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.frequency;
    if (random <= 0) {
      return item;
    }
  }
  return items[0]; // Fallback
};

// Get a random job type using weighted random selection
const getRandomJobType = () => {
  const jobTypes = Object.values(JobType);
  const selectedType = weightedRandom(jobTypes);
  return selectedType.name;
};

// Get a random payment method using weighted random selection
const getRandomPaymentMethod = () => {
  return weightedRandom(PAYMENT_METHODS).method;
};

// Generate a random address
const generateAddress = () => {
  const location = getRandomElement(CITIES);
  return {
    street: `${getRandomInt(100, 9999)} ${getRandomElement([
      "Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Washington Ave",
      "Park Blvd", "Lake Dr", "River Rd", "Mountain View", "Sunset Blvd", "Valley Way"
    ])}`,
    city: location.city,
    state: location.state,
    zip: getRandomElement(location.zipCodes)
  };
};

// Generate a random customer
const generateCustomer = (id) => {
  const name = getRandomElement(CUSTOMER_NAMES);
  const isBusinessCustomer = name.includes("Apartments") || name.includes("Center") || 
    name.includes("Mall") || name.includes("Hospital") || name.includes("Hotel") || 
    name.includes("School") || name.includes("Restaurant") || name.includes("Bank") || 
    name.includes("Office") || name.includes("Clinic") || name.includes("Church") || 
    name.includes("Plaza") || name.includes("Home") || name.includes("Building");

  // Generate random contact info
  const contactFirstNames = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Jennifer", "William", "Elizabeth"];
  const contactLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  const contactFirstName = getRandomElement(contactFirstNames);
  const contactLastName = getRandomElement(contactLastNames);
  
  return {
    id: `customer-${id}`,
    name: name,
    contactPerson: isBusinessCustomer ? `${contactFirstName} ${contactLastName}` : undefined,
    email: isBusinessCustomer 
      ? `${contactFirstName.toLowerCase()}.${contactLastName.toLowerCase()}@${name.toLowerCase().replace(/\s+/g, '')}.com`
      : `${name.toLowerCase().replace(/\s+/g, '')}.residence@example.com`,
    phone: `(${getRandomInt(100, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
    primaryAddress: generateAddress(),
    billingAddress: Math.random() > 0.8 ? generateAddress() : undefined, // 20% chance of different billing address
    notes: Math.random() > 0.7 ? `Customer notes: ${Math.random() > 0.5 ? 'Preferred contact by email' : 'Preferred contact by phone'}` : undefined,
    createdAt: new Date(STARTING_YEAR, 0, 1).toISOString(),
    isActive: true
  };
};

// Generate payment details
const generatePayment = (amount, invoiceDate, daysToPayment) => {
  const paymentDate = new Date(invoiceDate);
  paymentDate.setDate(paymentDate.getDate() + daysToPayment);
  
  return {
    amount: amount,
    date: paymentDate.toISOString(),
    method: getRandomPaymentMethod(),
    referenceNumber: `PAY-${getRandomInt(10000, 99999)}`,
    notes: Math.random() > 0.8 ? "Payment received with thanks" : null,
    timestamp: paymentDate.toISOString()
  };
};

// Generate line items for a job
const generateLineItems = (jobType, baseAmount) => {
  const lineItems = [];
  const categories = ["LABOR", "MATERIALS", "EQUIPMENT", "MISC"];
  
  // Generate random number of line items (3-8)
  const numLineItems = getRandomInt(3, 8);
  
  // Calculate approximate category totals based on job type
  let laborTotal, materialsTotal, equipmentTotal, miscTotal;
  
  switch (jobType) {
    case 'WATER':
      laborTotal = baseAmount * 0.4;
      materialsTotal = baseAmount * 0.3;
      equipmentTotal = baseAmount * 0.25;
      miscTotal = baseAmount * 0.05;
      break;
    case 'FIRE':
      laborTotal = baseAmount * 0.45;
      materialsTotal = baseAmount * 0.35;
      equipmentTotal = baseAmount * 0.15;
      miscTotal = baseAmount * 0.05;
      break;
    case 'MOLD':
      laborTotal = baseAmount * 0.35;
      materialsTotal = baseAmount * 0.4;
      equipmentTotal = baseAmount * 0.2;
      miscTotal = baseAmount * 0.05;
      break;
    case 'SMOKE':
      laborTotal = baseAmount * 0.5;
      materialsTotal = baseAmount * 0.3;
      equipmentTotal = baseAmount * 0.15;
      miscTotal = baseAmount * 0.05;
      break;
    case 'STORM':
      laborTotal = baseAmount * 0.4;
      materialsTotal = baseAmount * 0.35;
      equipmentTotal = baseAmount * 0.2;
      miscTotal = baseAmount * 0.05;
      break;
    default: // OTHER
      laborTotal = baseAmount * 0.45;
      materialsTotal = baseAmount * 0.25;
      equipmentTotal = baseAmount * 0.2;
      miscTotal = baseAmount * 0.1;
      break;
  }
  
  const categoryTotals = {
    "LABOR": laborTotal,
    "MATERIALS": materialsTotal,
    "EQUIPMENT": equipmentTotal,
    "MISC": miscTotal
  };
  
  // Generate line items for each category
  Object.entries(categoryTotals).forEach(([category, totalAmount]) => {
    // Decide how many line items per category (at least 1 for each)
    const categoryItems = category === "MISC" ? 1 : getRandomInt(1, 3);
    const amountPerItem = totalAmount / categoryItems;
    
    for (let i = 0; i < categoryItems; i++) {
      // Vary each item's amount slightly
      const variance = getRandomFloat(0.8, 1.2);
      const amount = amountPerItem * variance;
      
      // Generate appropriate description based on category
      let description;
      let quantity = 1;
      let unitPrice = amount;
      
      if (category === "LABOR") {
        // Labor is typically charged hourly
        quantity = getRandomInt(4, 40); // Hours
        unitPrice = getRandomFloat(45, 95, 2); // Hourly rate
        description = getRandomElement([
          "Technician Labor", "Senior Technician Labor", "Removal Services", 
          "Cleanup Labor", "Restoration Work", "Remediation Labor", "Assessment Labor"
        ]);
      } else if (category === "MATERIALS") {
        quantity = getRandomInt(1, 20);
        unitPrice = amount / quantity;
        description = getRandomElement([
          "Cleaning Supplies", "Replacement Materials", "Construction Materials",
          "Sanitizing Agents", "Deodorizers", "Filters", "Protective Barriers",
          "Paint & Supplies", "Sealants", "Restoration Materials"
        ]);
      } else if (category === "EQUIPMENT") {
        quantity = getRandomInt(1, 5);
        unitPrice = amount / quantity;
        description = getRandomElement([
          "Dehumidifier Rental", "Air Scrubber Rental", "Fans Rental", 
          "Water Extraction Equipment", "Moisture Meters", "Thermal Imaging Camera",
          "HEPA Vacuum", "Pressure Washer", "Ozone Generator"
        ]);
      } else { // MISC
        description = getRandomElement([
          "Disposal Fees", "Permit Fees", "Inspection Fees", "Storage Fees",
          "Transportation", "Specialized Testing", "Documentation Services"
        ]);
      }
      
      // Calculate actual total and internal cost (for profit tracking)
      const total = quantity * unitPrice;
      const internalCost = total * (1 - getRandomFloat(0.2, 0.6)); // 20-60% markup
      
      lineItems.push({
        id: uuidv4(),
        description: description,
        quantity: quantity,
        unitPrice: parseFloat(unitPrice.toFixed(2)),
        internalCost: parseFloat(internalCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        category: category
      });
    }
  });
  
  return lineItems;
};

// Generate a job
const generateJob = (index, year, month, customers, userId) => {
  // Determine completion probability based on age (older jobs more likely complete)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthsAgo = ((currentYear - year) * 12) + (currentMonth - month);
  
  // Job completion probability (older jobs more likely to be complete)
  const completionProbability = monthsAgo > 3 ? 0.95 : monthsAgo > 1 ? 0.7 : 0.3;
  
  // Determine if job should be cancelled (small random chance)
  const isCancelled = Math.random() < 0.05; // 5% of jobs are cancelled
  
  // Determine job status
  let status;
  if (isCancelled) {
    status = JobStatus.CANCELLED;
  } else if (Math.random() < completionProbability) {
    // Job is complete, decide on invoice/payment status
    if (Math.random() < 0.85) { // 85% of completed jobs are paid
      status = JobStatus.PAID;
    } else if (Math.random() < 0.7) { // 70% of remaining completed jobs are invoiced
      status = JobStatus.INVOICED;
    } else if (Math.random() < 0.7) { // 70% of remaining completed jobs awaiting invoice approval
      status = JobStatus.INVOICE_APPROVAL;
    } else {
      status = JobStatus.COMPLETED;
    }
  } else {
    // Job is not complete, decide on progress status
    const progressRand = Math.random();
    if (progressRand < 0.2) {
      status = JobStatus.NEW;
    } else if (progressRand < 0.4) {
      status = JobStatus.SCHEDULED;
    } else if (progressRand < 0.6) {
      status = JobStatus.IN_PROGRESS;
    } else if (progressRand < 0.8) {
      status = JobStatus.ON_HOLD;
    } else {
      status = JobStatus.PENDING_COMPLETION;
    }
  }
  
  // Assign random customer
  const customer = getRandomElement(customers);
  
  // Generate job start date
  const startDate = new Date(year, month, getRandomInt(1, 28));
  
  // Generate job type
  const jobType = getRandomJobType();
  
  // Generate job price range based on type
  const priceRange = JOB_TYPE_PRICE_RANGES[jobType];
  const baseAmount = getRandomFloat(priceRange.min, priceRange.max);
  
  // Generate required dates based on status
  const createdAt = new Date(startDate);
  createdAt.setDate(createdAt.getDate() - getRandomInt(1, 14)); // Created 1-14 days before start

  const scheduledStartDate = status !== JobStatus.NEW ? startDate.toISOString() : null;
  
  // Estimate completion 3-30 days after start
  const estimatedCompletionDate = status !== JobStatus.NEW 
    ? new Date(startDate.getTime() + getRandomInt(3, 30) * 24 * 60 * 60 * 1000).toISOString() 
    : null;
  
  // Calculate actual completion date if applicable
  let completedDate = null;
  if ([JobStatus.COMPLETED, JobStatus.INVOICE_APPROVAL, JobStatus.INVOICED, JobStatus.PAID].includes(status)) {
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + getRandomInt(2, 25)); // 2-25 days to complete
    completedDate = completionDate.toISOString();
  }
  
  // Calculate invoice date if applicable
  let invoiceDate = null;
  let invoiceDueDate = null;
  let invoiceNumber = null;
  if ([JobStatus.INVOICED, JobStatus.PAID].includes(status)) {
    const invDate = new Date(completedDate);
    invDate.setDate(invDate.getDate() + getRandomInt(1, 7)); // Invoice 1-7 days after completion
    invoiceDate = invDate.toISOString();
    
    const dueDate = new Date(invDate);
    dueDate.setDate(dueDate.getDate() + 30); // Due 30 days after invoice
    invoiceDueDate = dueDate.toISOString();
    
    invoiceNumber = `INV-${year}-${String(index).padStart(4, '0')}`;
  }
  
  // Calculate payment if applicable
  let payment = null;
  if (status === JobStatus.PAID) {
    const daysToPayment = Math.random() < 0.7 ? getRandomInt(2, 25) : getRandomInt(26, 60); // 70% pay within 25 days
    payment = generatePayment(baseAmount, new Date(invoiceDate), daysToPayment);
  }
  
  // Generate job line items
  const lineItems = generateLineItems(jobType, baseAmount);
  
  // Calculate job costs
  const laborCost = lineItems
    .filter(item => item.category === "LABOR")
    .reduce((sum, item) => sum + item.total, 0);
  
  const materialsCost = lineItems
    .filter(item => item.category === "MATERIALS")
    .reduce((sum, item) => sum + item.total, 0);
  
  const equipmentCost = lineItems
    .filter(item => item.category === "EQUIPMENT")
    .reduce((sum, item) => sum + item.total, 0);
  
  const miscCost = lineItems
    .filter(item => item.category === "MISC")
    .reduce((sum, item) => sum + item.total, 0);
  
  // Calculate total with tax
  const subtotal = parseFloat((laborCost + materialsCost + equipmentCost + miscCost).toFixed(2));
  const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + taxAmount).toFixed(2));
  
  return {
    id: uuidv4(),
    jobNumber: `J-${year.toString().slice(-2)}${String(month + 1).padStart(2, '0')}-${String(index).padStart(4, '0')}`,
    title: `${isCancelled ? 'CANCELLED - ' : ''}${
      jobType === 'WATER' ? 'Water Damage Restoration' :
      jobType === 'FIRE' ? 'Fire Damage Restoration' :
      jobType === 'MOLD' ? 'Mold Remediation' :
      jobType === 'SMOKE' ? 'Smoke Damage Cleanup' :
      jobType === 'STORM' ? 'Storm Damage Repair' : 'General Restoration'
    } - ${customer.name}`,
    status: status,
    type: jobType,
    description: `${
      jobType === 'WATER' ? 'Water damage restoration services including extraction, drying, and repairs.' :
      jobType === 'FIRE' ? 'Fire damage restoration including smoke removal, cleaning, and structural repairs.' :
      jobType === 'MOLD' ? 'Comprehensive mold remediation including inspection, containment, removal, and prevention.' :
      jobType === 'SMOKE' ? 'Smoke damage cleanup including odor removal, surface cleaning, and air purification.' :
      jobType === 'STORM' ? 'Storm damage repair including debris removal, water extraction, and structural repairs.' :
      'General restoration services tailored to customer needs.'
    }`,
    customerId: customer.id,
    location: customer.primaryAddress,
    assignedUserIds: [userId], // Just one technician for simplicity
    createdAt: createdAt.toISOString(),
    scheduledStartDate: scheduledStartDate,
    estimatedCompletionDate: estimatedCompletionDate,
    completedDate: completedDate,
    equipmentIds: [], // Simplified - not generating equipment
    priority: getRandomInt(1, 5),
    estimatedCost: Math.round(baseAmount * 0.8), // Initial estimate is 80% of final cost
    accessInstructions: Math.random() > 0.7 ? "Contact customer before arrival" : undefined,
    tags: [jobType],
    originatingQuoteId: null, // Simplified - not generating quotes
    accountOwnerId: userId,
    completionTasks: status === JobStatus.PENDING_COMPLETION ? {
      finalReadingsLogged: Math.random() > 0.5,
      afterPhotosTaken: Math.random() > 0.5,
      mark_ready_for_review: Math.random() > 0.5
    } : (status !== JobStatus.NEW && status !== JobStatus.SCHEDULED) ? {
      finalReadingsLogged: true,
      afterPhotosTaken: true,
      mark_ready_for_review: true
    } : undefined,
    hasBeforePhotos: status !== JobStatus.NEW,
    laborCost: parseFloat(laborCost.toFixed(2)),
    materialsCost: parseFloat(materialsCost.toFixed(2)),
    equipmentCost: parseFloat(equipmentCost.toFixed(2)),
    lineItems: lineItems,
    finalNotes: status !== JobStatus.NEW && status !== JobStatus.SCHEDULED ? "Job completed according to specifications." : undefined,
    invoiceNumber: invoiceNumber,
    invoiceDate: invoiceDate,
    invoiceDueDate: invoiceDueDate,
    total: total,
    payment: payment,
    taxAmount: taxAmount,
    taxRate: TAX_RATE
  };
};

// Main function to generate all data
async function generateData() {
  console.log('Starting financial data generation...');
  
  // Create customers
  console.log('Generating customers...');
  const customers = Array.from({ length: 25 }, (_, i) => generateCustomer(i + 1));
  
  // Use a fixed user ID for assigned jobs
  const technicianId = "tech-01";
  
  // Generate jobs distributed across the last year
  console.log(`Generating ${TOTAL_JOBS} jobs distributed across 12 months...`);
  const jobs = [];
  let jobCounter = 1;
  
  // Start from the past year
  const currentDate = new Date();
  const yearToGenerate = currentDate.getMonth() < 6 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
  
  // Generate jobs for each month
  for (let month = 0; month < 12; month++) {
    const jobCount = JOBS_PER_MONTH[month];
    console.log(`Generating ${jobCount} jobs for month ${month + 1}...`);
    
    for (let i = 0; i < jobCount; i++) {
      const job = generateJob(jobCounter++, yearToGenerate, month, customers, technicianId);
      jobs.push(job);
    }
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Write data to files
  console.log(`Writing data to ${OUTPUT_DIR}...`);
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'financial_jobs.json'),
    JSON.stringify(jobs, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'financial_customers.json'),
    JSON.stringify(customers, null, 2)
  );
  
  console.log(`Generated ${jobs.length} jobs with ${customers.length} customers.`);
  console.log('Financial data generation complete!');
}

// Run the generator
generateData().catch(err => {
  console.error('Error generating financial data:', err);
}); 