import type { LogEntry } from '$lib/types/LogEntry';
import { LogEntryType } from '$lib/types/LogEntry';
import { EQUIPMENT_DAILY_RATES } from '$lib/config/equipmentRates';

interface EquipmentUsageData {
  durationDays: number;
  type: string;
  model: string;
  serialNumber?: string;
  placementDate: Date;
  removalDate: Date;
}

export interface BillingDetailItem {
  equipmentId: string;
  type: string;
  model: string;
  durationDays: number;
  rate: number;
  cost: number;
}

export interface BillingSummary {
  details: BillingDetailItem[];
  totalCost: number;
}

/**
 * Calculates the equipment usage duration based on placement and removal log entries
 * 
 * @param logEntries Array of log entries for the job
 * @returns Map of equipment IDs to their usage data
 */
export function calculateEquipmentUsage(logEntries: LogEntry[]): Map<string, EquipmentUsageData> {
  // Map to track equipment placements
  const placementMap = new Map<string, LogEntry>();
  
  // Map to store the results
  const usageMap = new Map<string, EquipmentUsageData>();

  // Sort log entries by timestamp to ensure proper sequencing
  const sortedEntries = [...logEntries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  for (const entry of sortedEntries) {
    if (entry.type === LogEntryType.EQUIPMENT_PLACEMENT) {
      const content = entry.content as any;
      if (content && content.equipmentId) {
        placementMap.set(content.equipmentId, entry);
      }
    } 
    else if (entry.type === LogEntryType.EQUIPMENT_REMOVAL) {
      const content = entry.content as any;
      if (content && content.equipmentId) {
        const placementEntry = placementMap.get(content.equipmentId);
        if (placementEntry) {
          const placementContent = placementEntry.content as any;
          const removalTimestamp = new Date(entry.timestamp);
          const placementTimestamp = new Date(placementEntry.timestamp);
          
          // Calculate duration in milliseconds
          const durationMs = removalTimestamp.getTime() - placementTimestamp.getTime();
          
          // Convert to days, rounded up to the nearest day (minimum 1 day)
          const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
          
          usageMap.set(content.equipmentId, {
            durationDays,
            type: content.equipmentType || 'OTHER',
            model: content.equipmentModel || 'Unknown',
            serialNumber: content.equipmentSerialNumber,
            placementDate: placementTimestamp,
            removalDate: removalTimestamp
          });
          
          // Remove from placement map to avoid double counting
          placementMap.delete(content.equipmentId);
        }
      }
    }
  }
  
  // Handle equipment that was placed but not yet removed (assume current date for billing)
  const currentDate = new Date();
  placementMap.forEach((entry, equipmentId) => {
    const content = entry.content as any;
    if (content) {
      const placementTimestamp = new Date(entry.timestamp);
      
      // Calculate duration in milliseconds
      const durationMs = currentDate.getTime() - placementTimestamp.getTime();
      
      // Convert to days, rounded up to the nearest day (minimum 1 day)
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      
      usageMap.set(equipmentId, {
        durationDays,
        type: content.equipmentType || 'OTHER',
        model: content.equipmentModel || 'Unknown',
        serialNumber: content.equipmentSerialNumber,
        placementDate: placementTimestamp,
        removalDate: currentDate
      });
    }
  });
  
  return usageMap;
}

/**
 * Calculates total costs for equipment usage
 * 
 * @param usageData Map of equipment IDs to their usage data
 * @returns Object containing detailed billing items and total cost
 */
export function calculateTotalCosts(usageData: Map<string, EquipmentUsageData>): BillingSummary {
  const details: BillingDetailItem[] = [];
  let totalCost = 0;
  
  usageData.forEach((data, equipmentId) => {
    // Get the rate for this equipment type
    const rate = EQUIPMENT_DAILY_RATES[data.type] || EQUIPMENT_DAILY_RATES['OTHER'];
    
    // Calculate cost
    const cost = data.durationDays * rate;
    
    // Add to the details array
    details.push({
      equipmentId,
      type: data.type,
      model: data.model,
      durationDays: data.durationDays,
      rate,
      cost
    });
    
    // Accumulate total cost
    totalCost += cost;
  });
  
  return {
    details: details.sort((a, b) => b.cost - a.cost), // Sort by cost descending
    totalCost
  };
}

/**
 * Formats a date as a string in the format MM/DD/YYYY
 */
export function formatDateShort(date: Date): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
} 