// generateMockData.js
// Run with: node generateMockData.js
// Make sure to install dependencies first: npm install uuid

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const TOTAL_JOBS_TO_GENERATE = 50;
const OUTPUT_DIR = path.join(__dirname, 'src', 'lib', 'mock'); // Use __dirname for current directory
const INPUT_DIR = OUTPUT_DIR; // Assuming input mock files are in the same dir

// Define JobStatus enum (mirroring Job.ts)
const JobStatus = {
    NEW: 'NEW',
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    PENDING_COMPLETION: 'PENDING_COMPLETION', 
    COMPLETED: 'COMPLETED',
    INVOICE_APPROVAL: 'INVOICE_APPROVAL',
    INVOICED: 'INVOICED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED',
};

// Define JobType enum 
const JobType = {
    WATER: 'WATER',
    FIRE: 'FIRE',
    MOLD: 'MOLD',
    SMOKE: 'SMOKE',
    STORM: 'STORM',
    OTHER: 'OTHER'
};

// Define Role enum (mirroring User.ts)
const Role = {
    ADMIN: 'ADMIN',
    OFFICE: 'OFFICE',
    TECH: 'TECH',
    CUSTOMER: 'CUSTOMER'
};

// Define LogType enum
const LogType = {
    NOTE: 'NOTE',
    MOISTURE_READING: 'MOISTURE_READING',
    PHOTO: 'PHOTO',
    EQUIPMENT_LOG: 'EQUIPMENT_LOG',
    EXPENSE: 'EXPENSE'
};

// Example Note Categories
const NoteCategory = {
    SYSTEM: 'SYSTEM',
    GENERAL: 'GENERAL',
    CUSTOMER_COMMUNICATION: 'CUSTOMER_COMMUNICATION',
    INTERNAL: 'INTERNAL',
    ISSUE: 'ISSUE',
};

// Approximate distribution of jobs per status
const JOB_STATUS_DISTRIBUTION = {
    [JobStatus.NEW]: 0.1, // 10%
    [JobStatus.SCHEDULED]: 0.2, // 20%
    [JobStatus.IN_PROGRESS]: 0.3, // 30%
    [JobStatus.PENDING_COMPLETION]: 0.15, // 15%
    [JobStatus.COMPLETED]: 0.1, // 10%
    [JobStatus.INVOICE_APPROVAL]: 0.05, // 5%
    [JobStatus.INVOICED]: 0.05, // 5%
    [JobStatus.PAID]: 0.05, // 5%
};

// Placeholder Image URL function
const generatePlaceholderImageUrl = (seed) => `https://picsum.photos/seed/${seed}/400/300`;

// --- Helper Functions ---

/**
 * Reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object|Array|null} Parsed JSON data or null on error.
 */
function readJsonFile(filePath) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
        return null;
    }
}

/**
 * Gets a random element from an array.
 * @param {Array<T>} arr - The input array.
 * @returns {T|undefined} A random element or undefined if array is empty.
 */
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets a random integer between min (inclusive) and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a random float with specified precision
 * @param {number} min
 * @param {number} max
 * @param {number} precision
 * @returns {number}
 */
function getRandomFloat(min, max, precision = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

/**
 * Generates a random date between startDate + minDaysAhead and startDate + maxDaysAhead.
 * @param {Date} startDate - The base date.
 * @param {number} minDaysAhead - Minimum days after startDate.
 * @param {number} maxDaysAhead - Maximum days after startDate.
 * @returns {Date} A new Date object.
 */
function generateRandomDate(startDate, minDaysAhead = 0, maxDaysAhead = 30) {
    const newDate = new Date(startDate);
    const randomDays = getRandomInt(minDaysAhead, maxDaysAhead);
    newDate.setDate(newDate.getDate() + randomDays);
    // Add random hours/minutes for variability
    newDate.setHours(getRandomInt(8, 18));
    newDate.setMinutes(getRandomInt(0, 59));
    return newDate;
}

/**
 * Calculates duration in hours between two dates.
 * @param {Date} start
 * @param {Date} end
 * @returns {number} Duration in hours, rounded to 2 decimal places.
 */
function calculateDurationHours(start, end) {
    if (!start || !end) return 0;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
}

/**
 * Creates a LogEntry object.
 */
function createLogEntry(job, userId, timestamp, type, details) {
    const baseEntry = {
        id: uuidv4(),
        jobId: job.id,
        userId: userId,
        type: type,
        createdAt: timestamp.toISOString(),
        isPublic: false
    };

    // Add type-specific fields
    if (type === LogType.NOTE) {
        return {
            ...baseEntry,
            category: details.category || NoteCategory.GENERAL,
            content: details.text
        };
    } else if (type === LogType.MOISTURE_READING) {
        return {
            ...baseEntry,
            readings: [{
                location: details.location,
                readingType: 'MOISTURE',
                value: details.value,
                unit: '%'
            }],
            notes: details.text || ''
        };
    } else if (type === LogType.PHOTO) {
        return {
            ...baseEntry,
            category: details.category || 'GENERAL',
            photoUrl: details.imageUrl,
            thumbnailUrl: details.imageUrl,
            description: details.caption || 'Photo'
        };
    } else if (type === LogType.EQUIPMENT_LOG) {
        return {
            ...baseEntry,
            equipmentId: details.equipmentId,
            action: details.action,
            notes: details.text || `${details.action} equipment at ${details.location}`
        };
    } else if (type === LogType.EXPENSE) {
        return {
            ...baseEntry,
            amount: details.amount || 0,
            description: details.text || 'Expense',
            receiptUrl: details.receiptUrl
        };
    }

    return baseEntry;
}

/**
 * Creates a LaborEntry object.
 */
function createLaborEntry(job, userId, startTime, endTime) {
    return {
        id: uuidv4(),
        jobId: job.id,
        userId: userId,
        date: startTime.toISOString().split('T')[0],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationHours: calculateDurationHours(startTime, endTime),
        description: `Work performed for job #${job.jobNumber}`,
        category: getRandomElement(['ASSESSMENT', 'SETUP', 'REMEDIATION', 'MONITORING', 'TEARDOWN', 'FINAL_INSPECTION'])
    };
}

/**
 * Generates a job title based on job type and customer
 */
function generateJobTitle(jobType, customerName) {
    const typeDescriptions = {
        [JobType.WATER]: ['Water Damage', 'Flood Damage', 'Pipe Burst', 'Water Intrusion'],
        [JobType.FIRE]: ['Fire Damage', 'Smoke Damage', 'Fire Restoration', 'Electrical Fire'],
        [JobType.MOLD]: ['Mold Remediation', 'Mold Cleanup', 'Mold Removal', 'Mold Treatment'],
        [JobType.SMOKE]: ['Smoke Damage', 'Smoke Cleanup', 'Smoke Odor Removal'],
        [JobType.STORM]: ['Storm Damage', 'Wind Damage', 'Hail Damage', 'Storm Cleanup'],
        [JobType.OTHER]: ['General Restoration', 'Cleanup Services', 'Specialized Restoration']
    };

    const locations = ['Bathroom', 'Kitchen', 'Basement', 'Living Room', 'Bedroom', 'Attic', 'Garage', 'Office'];
    const typeDescription = getRandomElement(typeDescriptions[jobType]);
    const location = getRandomElement(locations);
    
    return `${location} ${typeDescription} - ${customerName}`;
}

/**
 * Generates a job description based on job type
 */
function generateJobDescription(jobType) {
    const descriptions = {
        [JobType.WATER]: [
            'Water damage caused by a pipe burst. Areas affected include flooring and drywall.',
            'Flooding from heavy rain. Multiple rooms affected with standing water.',
            'Water intrusion from roof leak. Ceiling and wall damage in affected areas.'
        ],
        [JobType.FIRE]: [
            'Fire damage in kitchen area. Smoke damage throughout the property.',
            'Electrical fire damaged walls and ceiling. Smoke odor remediation needed.',
            'Small fire with extensive smoke damage. Cleanup and restoration required.'
        ],
        [JobType.MOLD]: [
            'Mold discovered in bathroom walls. Remediation and prevention needed.',
            'Extensive mold growth in basement due to previous water damage.',
            'Mold in HVAC system affecting air quality throughout the property.'
        ],
        [JobType.SMOKE]: [
            'Smoke damage from nearby fire. Odor removal and cleaning needed.',
            'Cigarette smoke remediation for rental property. Deep cleaning required.',
            'Smoke damage from kitchen fire. Cleaning and deodorization needed.'
        ],
        [JobType.STORM]: [
            'Storm damage to roof and interior. Water intrusion in multiple areas.',
            'Wind damage to exterior with resulting water damage inside.',
            'Hail damage to roof with leaks causing interior water damage.'
        ],
        [JobType.OTHER]: [
            'General cleanup and restoration services.',
            'Specialized cleanup after biohazard situation.',
            'Restoration services for property damage.'
        ]
    };

    return getRandomElement(descriptions[jobType] || descriptions[JobType.OTHER]);
}

/**
 * Generates random tags for a job
 */
function generateRandomTags(jobType) {
    const commonTags = ['restoration', 'cleanup'];
    const typeTags = {
        [JobType.WATER]: ['water', 'flood', 'leak', 'moisture'],
        [JobType.FIRE]: ['fire', 'smoke', 'burn', 'soot'],
        [JobType.MOLD]: ['mold', 'spores', 'humidity', 'musty'],
        [JobType.SMOKE]: ['smoke', 'odor', 'particles', 'soot'],
        [JobType.STORM]: ['storm', 'wind', 'hail', 'debris'],
        [JobType.OTHER]: ['general', 'specialized', 'custom']
    };
    
    const typeSpecificTags = typeTags[jobType] || typeTags[JobType.OTHER];
    
    const tags = [...commonTags];
    tags.push(getRandomElement(typeSpecificTags));
    if (Math.random() > 0.5) tags.push(getRandomElement(typeSpecificTags));
    
    return tags;
}

/**
 * Generates line items for a job
 */
function generateLineItems(job) {
    const lineItems = [];
    const categories = ['LABOR', 'MATERIALS', 'EQUIPMENT'];
    
    // Labor line item
    if (job.laborCost > 0) {
        lineItems.push({
            id: uuidv4(),
            description: 'Labor',
            quantity: getRandomFloat(5, 50, 1),
            unitPrice: getRandomFloat(65, 95, 2),
            total: job.laborCost,
            category: 'LABOR',
            internalCost: job.laborCost * 0.7 // 70% of charge is internal cost
        });
    }
    
    // Materials line items
    if (job.materialsCost > 0) {
        const materialItems = getRandomInt(1, 3);
        const materialDescriptions = [
            'Dehumidifier Filters',
            'Antimicrobial Solution',
            'Replacement Drywall',
            'Paint and Primer',
            'Insulation Material',
            'Wood Restoration Materials',
            'Carpet Cleaning Solution',
            'Mold Treatment Chemicals',
            'Disposal Fees'
        ];
        
        let remainingMaterialCost = job.materialsCost;
        
        for (let i = 0; i < materialItems && remainingMaterialCost > 0; i++) {
            const itemCost = i === materialItems - 1 
                ? remainingMaterialCost 
                : Math.min(remainingMaterialCost, getRandomFloat(50, remainingMaterialCost / 2, 2));
            
            const qty = getRandomFloat(1, 10, 1);
            const unitPrice = parseFloat((itemCost / qty).toFixed(2));
            
            lineItems.push({
                id: uuidv4(),
                description: getRandomElement(materialDescriptions),
                quantity: qty,
                unitPrice: unitPrice,
                total: itemCost,
                category: 'MATERIALS',
                internalCost: itemCost * 0.6 // 60% of charge is internal cost
            });
            
            remainingMaterialCost -= itemCost;
        }
    }
    
    // Equipment line items
    if (job.equipmentCost > 0) {
        const equipmentItems = Math.min(job.equipmentIds?.length || 0, getRandomInt(1, 3));
        const equipmentDescriptions = [
            'Dehumidifier Rental',
            'Air Mover Rental',
            'Air Scrubber Rental',
            'Moisture Meter Usage',
            'Thermal Imaging Camera Usage',
            'Specialty Equipment'
        ];
        
        let remainingEquipmentCost = job.equipmentCost;
        
        for (let i = 0; i < equipmentItems && remainingEquipmentCost > 0; i++) {
            const itemCost = i === equipmentItems - 1 
                ? remainingEquipmentCost 
                : Math.min(remainingEquipmentCost, getRandomFloat(50, remainingEquipmentCost / 2, 2));
            
            const days = getRandomInt(1, 10);
            const dailyRate = parseFloat((itemCost / days).toFixed(2));
            
            lineItems.push({
                id: uuidv4(),
                description: getRandomElement(equipmentDescriptions),
                quantity: days,
                unitPrice: dailyRate,
                total: itemCost,
                category: 'EQUIPMENT',
                internalCost: itemCost * 0.4 // 40% of charge is internal cost
            });
            
            remainingEquipmentCost -= itemCost;
        }
    }
    
    return lineItems;
}

// --- Main Execution ---

console.log('Starting mock data generation...');

// 1. Read Input Files
console.log('Reading input files...');
const users = readJsonFile(path.join(INPUT_DIR, 'users.json'));
const customers = readJsonFile(path.join(INPUT_DIR, 'customers.json'));
const equipment = readJsonFile(path.join(INPUT_DIR, 'equipment.json'));

if (!users || !customers || !equipment) {
    console.error('Failed to load one or more essential input files. Exiting.');
    process.exit(1);
}

const techUsers = users.filter(u => u.role === Role.TECH);
const officeAdminUsers = users.filter(u => u.role === Role.OFFICE || u.role === Role.ADMIN);
const allUserIds = users.map(u => u.id);

if (techUsers.length === 0) {
    console.warn('Warning: No users with TECH role found in users.json. Scheduling/Labor generation might be affected.');
}
if (officeAdminUsers.length === 0) {
    console.warn('Warning: No users with OFFICE or ADMIN role found. Some log entries might not be generated correctly.');
}

// Initialize output arrays
const generatedJobs = [];
const generatedLogEntries = [];
const generatedLaborEntries = [];

console.log(`Generating ${TOTAL_JOBS_TO_GENERATE} jobs...`);

// Determine number of jobs per status
const jobsPerStatus = {};
let assignedJobs = 0;
for (const status in JOB_STATUS_DISTRIBUTION) {
    const count = Math.floor(TOTAL_JOBS_TO_GENERATE * JOB_STATUS_DISTRIBUTION[status]);
    jobsPerStatus[status] = count;
    assignedJobs += count;
}
// Distribute remaining jobs (due to flooring) randomly or to a default status
let remainingJobs = TOTAL_JOBS_TO_GENERATE - assignedJobs;
const statuses = Object.keys(jobsPerStatus);
while (remainingJobs > 0) {
    jobsPerStatus[getRandomElement(statuses)]++;
    remainingJobs--;
}

// 2. Generate Jobs and Related Data
let jobCounter = 1;
const now = new Date();

for (const status in jobsPerStatus) {
    const count = jobsPerStatus[status];
    console.log(` -> Generating ${count} jobs with status ${status}`);

    for (let i = 0; i < count; i++) {
        const jobId = uuidv4();
        const customer = getRandomElement(customers);
        const createdAt = generateRandomDate(now, -90, -1); // Created within the last 90 days
        const jobType = getRandomElement(Object.values(JobType));

        const baseJob = {
            id: jobId,
            jobNumber: `J-${new Date().getFullYear()}-${String(jobCounter++).padStart(4, '0')}`,
            customerId: customer?.id || 'UNKNOWN_CUSTOMER',
            title: generateJobTitle(jobType, customer?.name || 'Unknown'),
            type: jobType,
            description: generateJobDescription(jobType),
            status: status,
            createdAt: createdAt.toISOString(),
            assignedUserIds: [],
            location: customer?.primaryAddress || customer?.address || { 
                street: '123 Unknown St', 
                city: 'Anytown', 
                state: 'CA', 
                zip: '90210' 
            },
            equipmentIds: [],
            priority: getRandomInt(1, 5),
            tags: generateRandomTags(jobType),
            completionTasks: {
                finalReadingsLogged: false,
                afterPhotosTaken: false,
                mark_ready_for_review: false
            }
        };

        let currentJobDate = new Date(baseJob.createdAt);
        let assignedTechs = [];
        let officeOrAdminUser = getRandomElement(officeAdminUsers) || getRandomElement(users); // Fallback user

        // --- Status-Specific Logic ---

        if (status === JobStatus.SCHEDULED || status === JobStatus.IN_PROGRESS || status === JobStatus.PENDING_COMPLETION || 
            status === JobStatus.COMPLETED || status === JobStatus.INVOICE_APPROVAL || status === JobStatus.INVOICED || 
            status === JobStatus.PAID) {
            // SCHEDULED requirements
            if (techUsers.length > 0) {
                assignedTechs = [getRandomElement(techUsers)]; // Assign one tech for simplicity
                baseJob.assignedUserIds = assignedTechs.map(t => t.id);
            }
            baseJob.scheduledStartDate = generateRandomDate(currentJobDate, 1, 7).toISOString();
            baseJob.estimatedCompletionDate = generateRandomDate(new Date(baseJob.scheduledStartDate), 3, 14).toISOString();
            currentJobDate = new Date(baseJob.scheduledStartDate);
            baseJob.completionTasks.finalReadingsLogged = Math.random() > 0.5;

            // Add scheduling log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Job scheduled for ${new Date(baseJob.scheduledStartDate).toLocaleDateString()}. Tech assigned: ${assignedTechs[0]?.name || 'N/A'}.`
                    }
                ));
            }
        }

        if (status === JobStatus.IN_PROGRESS || status === JobStatus.PENDING_COMPLETION || 
            status === JobStatus.COMPLETED || status === JobStatus.INVOICE_APPROVAL || 
            status === JobStatus.INVOICED || status === JobStatus.PAID) {
            // IN_PROGRESS requirements
            // Add some equipment maybe
            if (equipment.length > 0 && Math.random() > 0.3) { // 70% chance
                const numEquipment = getRandomInt(1, Math.min(3, equipment.length));
                for(let eq = 0; eq < numEquipment; eq++) {
                    const equip = getRandomElement(equipment);
                    if(equip && !baseJob.equipmentIds.includes(equip.id)) {
                        baseJob.equipmentIds.push(equip.id);
                        if (assignedTechs.length > 0) {
                            generatedLogEntries.push(createLogEntry(
                                baseJob, 
                                assignedTechs[0].id, 
                                generateRandomDate(currentJobDate, 0, 0), 
                                LogType.EQUIPMENT_LOG, 
                                { 
                                    equipmentId: equip.id,
                                    action: 'DEPLOYED',
                                    location: 'Living Room',
                                    text: `Placed ${equip.name} in Living Room`
                                }
                            ));
                        }
                    }
                }
            }

            // Add a few logs/labor for IN_PROGRESS state duration
            const inProgressDurationDays = (status === JobStatus.IN_PROGRESS) ? getRandomInt(1, 5) : 0; // Only add for current state if IN_PROGRESS
            const activityEndDate = (status === JobStatus.IN_PROGRESS) ? generateRandomDate(currentJobDate, 0, inProgressDurationDays) : currentJobDate;

            if (assignedTechs.length > 0 && status === JobStatus.IN_PROGRESS) { // Only generate for *currently* IN_PROGRESS
                const numLogs = getRandomInt(1, 4);
                for (let l=0; l < numLogs; l++) {
                    const logDate = generateRandomDate(currentJobDate, 0, (activityEndDate.getTime() - currentJobDate.getTime()) / (1000*60*60*24));
                    generatedLogEntries.push(createLogEntry(
                        baseJob, 
                        assignedTechs[0].id, 
                        logDate, 
                        LogType.NOTE, 
                        { 
                            category: getRandomElement(Object.values(NoteCategory)), 
                            text: `Progress update: Work continuing as planned. ${getRandomInt(10, 50)}% complete.`
                        }
                    ));
                }
                
                // Add some moisture readings
                const numReadings = getRandomInt(1, 3);
                for (let r=0; r < numReadings; r++) {
                    const readingDate = generateRandomDate(currentJobDate, 0, (activityEndDate.getTime() - currentJobDate.getTime()) / (1000*60*60*24));
                    generatedLogEntries.push(createLogEntry(
                        baseJob, 
                        assignedTechs[0].id, 
                        readingDate, 
                        LogType.MOISTURE_READING, 
                        { 
                            location: getRandomElement(['Living Room', 'Kitchen', 'Bathroom', 'Bedroom']),
                            value: getRandomInt(10, 80),
                            text: `Standard moisture reading`
                        }
                    ));
                }
                
                const numLabor = getRandomInt(1, 2);
                for (let lb=0; lb < numLabor; lb++) {
                    const laborDate = generateRandomDate(currentJobDate, 0, (activityEndDate.getTime() - currentJobDate.getTime()) / (1000*60*60*24));
                    const laborStart = new Date(laborDate);
                    laborStart.setHours(getRandomInt(8, 12));
                    const laborEnd = new Date(laborStart);
                    laborEnd.setHours(laborStart.getHours() + getRandomInt(2, 8));
                    generatedLaborEntries.push(createLaborEntry(baseJob, assignedTechs[0].id, laborStart, laborEnd));
                }
            }
        }

        if (status === JobStatus.PENDING_COMPLETION || status === JobStatus.COMPLETED || 
            status === JobStatus.INVOICE_APPROVAL || status === JobStatus.INVOICED || 
            status === JobStatus.PAID) {
            // PENDING_COMPLETION requirements
            baseJob.completionTasks.finalReadingsLogged = true;
            baseJob.completionTasks.afterPhotosTaken = true;
            baseJob.completionTasks.mark_ready_for_review = true;
            
            // Add completion request log
            if (assignedTechs.length > 0) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    assignedTechs[0].id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Job marked ready for review. Final readings logged and photos taken.`
                    }
                ));
            }
        }

        if (status === JobStatus.COMPLETED || status === JobStatus.INVOICE_APPROVAL || 
            status === JobStatus.INVOICED || status === JobStatus.PAID) {
            // COMPLETED requirements
            baseJob.completedDate = generateRandomDate(currentJobDate, 1, 3).toISOString();
            currentJobDate = new Date(baseJob.completedDate);
            
            // Estimate costs
            baseJob.laborCost = parseFloat((getRandomInt(20, 60) * getRandomInt(5, 15)).toFixed(2));
            baseJob.equipmentCost = parseFloat((baseJob.equipmentIds.length * getRandomInt(50, 200)).toFixed(2));
            baseJob.materialsCost = parseFloat(getRandomInt(100, 1000).toFixed(2));
            baseJob.finalNotes = "Job completed successfully. Site cleaned and customer satisfied.";
            baseJob.lineItems = generateLineItems(baseJob);
            
            // Calculate total
            baseJob.total = (baseJob.laborCost + baseJob.equipmentCost + baseJob.materialsCost);

            // Add completion log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Job marked as completed. Final costs calculated.`
                    }
                ));
            }
        }

        if (status === JobStatus.INVOICE_APPROVAL || status === JobStatus.INVOICED || 
            status === JobStatus.PAID) {
            // Update to add approval date
            baseJob.approvalDate = generateRandomDate(new Date(baseJob.completedDate), 1, 3).toISOString();
            currentJobDate = new Date(baseJob.approvalDate);
            
            // Add approval log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Invoice approved and ready for generation.`
                    }
                ));
            }
        }

        if (status === JobStatus.INVOICED || status === JobStatus.PAID) {
            // INVOICED requirements
            baseJob.invoiceDate = generateRandomDate(currentJobDate, 1, 5).toISOString();
            baseJob.invoiceDueDate = generateRandomDate(new Date(baseJob.invoiceDate), 30, 30).toISOString();
            baseJob.invoiceNumber = `INV-${new Date().getFullYear()}-${String(jobCounter).padStart(4, '0')}`;
            currentJobDate = new Date(baseJob.invoiceDate);

            // Add invoice log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Invoice #${baseJob.invoiceNumber} generated and sent to customer. Amount: $${baseJob.total.toFixed(2)}`
                    }
                ));
            }
        }

        if (status === JobStatus.PAID) {
            // PAID requirements
            const paymentDate = generateRandomDate(new Date(baseJob.invoiceDate), 1, 14).toISOString();
            baseJob.payment = {
                amount: baseJob.total,
                method: getRandomElement(['CREDIT_CARD', 'CHECK', 'BANK_TRANSFER', 'CASH']),
                date: paymentDate,
                reference: `PAY-${getRandomInt(10000, 99999)}`
            };
            currentJobDate = new Date(paymentDate);

            // Add payment log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Payment received: $${baseJob.total.toFixed(2)} via ${baseJob.payment.method}. Reference: ${baseJob.payment.reference}`
                    }
                ));
            }
        }

        if (status === JobStatus.CANCELLED) {
            baseJob.cancellationDate = generateRandomDate(new Date(baseJob.createdAt), 1, 10).toISOString();
            currentJobDate = new Date(baseJob.cancellationDate);
            baseJob.cancellationReason = getRandomElement([
                'Customer request', 
                'Duplicate entry', 
                'Out of service area',
                'Insurance claim denied',
                'Customer went with another provider'
            ]);

            // Add cancellation log
            if (officeOrAdminUser) {
                generatedLogEntries.push(createLogEntry(
                    baseJob, 
                    officeOrAdminUser.id, 
                    currentJobDate, 
                    LogType.NOTE, 
                    { 
                        category: NoteCategory.SYSTEM, 
                        text: `Job cancelled. Reason: ${baseJob.cancellationReason}`
                    }
                ));
            }
        }

        // Add the fully processed job
        generatedJobs.push(baseJob);
    }
}

console.log('Job generation complete.');

// 3. Write Output Files
console.log(`Writing output files to ${OUTPUT_DIR}...`);

try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'jobs.json'),
        JSON.stringify(generatedJobs, null, 2), // Pretty print
        'utf-8'
    );
    console.log(` -> Successfully wrote jobs.json (${generatedJobs.length} entries)`);

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'logEntries.json'),
        JSON.stringify(generatedLogEntries, null, 2),
        'utf-8'
    );
    console.log(` -> Successfully wrote logEntries.json (${generatedLogEntries.length} entries)`);

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'laborEntries.json'),
        JSON.stringify(generatedLaborEntries, null, 2),
        'utf-8'
    );
    console.log(` -> Successfully wrote laborEntries.json (${generatedLaborEntries.length} entries)`);

} catch (error) {
    console.error('Error writing output files:', error);
    process.exit(1);
}

console.log('Mock data generation finished successfully!');