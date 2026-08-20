export type WorkSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface WorkLog {
  id: string;
  employeeId: string;
  taskId: string;
  projectId: string;
  bridgeId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number; // Calculated elapsed time in minutes
  status: WorkSessionStatus;
  summary?: string;
}
