export interface LaborEntry {
  id: string;
  jobId: string;
  userId: string; // Technician ID
  userName: string; // Denormalized for easy display
  hours: number;
  dateSubmitted: string; // When these hours were entered (completion date)
} 