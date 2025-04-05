import type { Equipment, EquipmentStatus } from '$lib/types/Equipment';
import mockEquipmentData from '$lib/mock/equipment.json';
import mockJobs from '$lib/mock/jobs.json';

// Simulate API delay
const SIMULATED_DELAY_MS = 300;

/**
 * Transform raw equipment data from JSON to typed Equipment objects
 * @param data Raw equipment data
 * @returns Equipment objects with proper types
 */
function transformEquipmentData(data: any[]): Equipment[] {
  return data.map(item => ({
    ...item,
    purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
    lastMaintenanceDate: item.lastMaintenanceDate ? new Date(item.lastMaintenanceDate) : undefined
  }));
}

/**
 * Get all equipment items in the inventory
 * @returns Promise resolving to an array of Equipment objects
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Create a deep copy and transform dates
  return transformEquipmentData(JSON.parse(JSON.stringify(mockEquipmentData)));
}

/**
 * Get equipment items that are currently available for deployment
 * @returns Promise resolving to an array of available Equipment objects
 */
export async function getAvailableEquipment(): Promise<Equipment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Filter only available equipment
  const availableEquipment = (mockEquipmentData as any[]).filter(
    equip => equip.status === 'AVAILABLE'
  );
  
  // Create a deep copy and transform dates
  return transformEquipmentData(JSON.parse(JSON.stringify(availableEquipment)));
}

/**
 * Get equipment items by their IDs
 * @param ids Array of equipment IDs to retrieve
 * @returns Promise resolving to an array of Equipment objects matching the provided IDs
 */
export async function getEquipmentByIds(ids: string[]): Promise<Equipment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Filter equipment by IDs
  const filteredEquipment = (mockEquipmentData as any[]).filter(
    equip => ids.includes(equip.id)
  );
  
  // Create a deep copy and transform dates
  return transformEquipmentData(JSON.parse(JSON.stringify(filteredEquipment)));
}

/**
 * Get equipment currently deployed to a specific job
 * @param jobId The job ID to check
 * @returns Promise resolving to an array of Equipment objects deployed to the job
 */
export async function getEquipmentByJobId(jobId: string): Promise<Equipment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS));
  
  // Filter equipment by current job ID
  const jobEquipment = (mockEquipmentData as any[]).filter(
    equip => equip.currentJobId === jobId
  );
  
  // Create a deep copy and transform dates
  return transformEquipmentData(JSON.parse(JSON.stringify(jobEquipment)));
}

/**
 * Change the status of an equipment item
 * @param equipmentId ID of the equipment to update
 * @param status New status to set
 * @param jobId Job ID to associate with the equipment (for DEPLOYED status) or null
 * @returns Updated Equipment object
 */
export function setEquipmentStatus(
  equipmentId: string, 
  status: EquipmentStatus, 
  jobId: string | null
): Equipment | null {
  // Find equipment in mock data
  const equipmentIndex = (mockEquipmentData as any[]).findIndex(e => e.id === equipmentId);
  
  if (equipmentIndex === -1) {
    console.error(`Equipment with ID ${equipmentId} not found`);
    return null;
  }
  
  // Update equipment status and job association
  (mockEquipmentData as any[])[equipmentIndex].status = status;
  (mockEquipmentData as any[])[equipmentIndex].currentJobId = jobId;
  
  console.log(`Updated equipment ${equipmentId} status to ${status}${jobId ? ` on job ${jobId}` : ''}`);
  
  // Return the updated equipment
  return transformEquipmentData([JSON.parse(JSON.stringify((mockEquipmentData as any[])[equipmentIndex]))])[0];
}

/**
 * Add equipment to a job's equipment list
 * @param jobId ID of the job to update
 * @param equipmentId ID of the equipment to add
 * @returns Whether the operation was successful
 */
export function addEquipmentToJob(jobId: string, equipmentId: string): boolean {
  // Find job in mock data
  const jobIndex = (mockJobs as any[]).findIndex(j => j.id === jobId);
  
  if (jobIndex === -1) {
    console.error(`Job with ID ${jobId} not found`);
    return false;
  }
  
  // Initialize equipmentIds array if it doesn't exist
  if (!Array.isArray((mockJobs as any[])[jobIndex].equipmentIds)) {
    (mockJobs as any[])[jobIndex].equipmentIds = [];
  }
  
  // Add equipment ID if not already in the list
  if (!(mockJobs as any[])[jobIndex].equipmentIds.includes(equipmentId)) {
    (mockJobs as any[])[jobIndex].equipmentIds.push(equipmentId);
    console.log(`Added equipment ${equipmentId} to job ${jobId}`);
  }
  
  return true;
}

/**
 * Remove equipment from a job's equipment list
 * @param jobId ID of the job to update
 * @param equipmentId ID of the equipment to remove
 * @returns Whether the operation was successful
 */
export function removeEquipmentFromJob(jobId: string, equipmentId: string): boolean {
  // Find job in mock data
  const jobIndex = (mockJobs as any[]).findIndex(j => j.id === jobId);
  
  if (jobIndex === -1) {
    console.error(`Job with ID ${jobId} not found`);
    return false;
  }
  
  // Check if equipmentIds array exists
  if (!Array.isArray((mockJobs as any[])[jobIndex].equipmentIds)) {
    console.error(`Job ${jobId} has no equipment array`);
    return false;
  }
  
  // Filter out the equipment ID
  const initialLength = (mockJobs as any[])[jobIndex].equipmentIds.length;
  (mockJobs as any[])[jobIndex].equipmentIds = (mockJobs as any[])[jobIndex].equipmentIds.filter(
    (id: string) => id !== equipmentId
  );
  
  if ((mockJobs as any[])[jobIndex].equipmentIds.length < initialLength) {
    console.log(`Removed equipment ${equipmentId} from job ${jobId}`);
    return true;
  } else {
    console.warn(`Equipment ${equipmentId} was not found in job ${jobId}`);
    return false;
  }
} 