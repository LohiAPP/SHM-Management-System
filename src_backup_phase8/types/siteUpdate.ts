export interface SiteUpdate {
  id: string;
  taskId: string;
  employeeId: string;
  timestamp: string;
  message: string;
  progress: number;
  attachments: string[]; // URLs or file names
}
