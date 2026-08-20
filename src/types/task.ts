export type TaskStatus = 'ASSIGNED' | 'STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'EXTENSION_REQUESTED' | 'EXTENSION_APPROVED' | 'EXTENSION_REJECTED' | 'COMPLETED' | 'OVERDUE' | 'BLOCKED' | 'REWORK_REQUIRED';
export type WorkMode = 'SITE' | 'OFFICE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  projectId: string;
  bridgeId: string;
  workflowStageId: string;
  title: string;
  description: string;
  teamId: string;
  assignedEmployeeIds: string[];
  workMode: WorkMode;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  plannedHours: number;
  actualHours: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  deadline: string;
  createdAt: string;
  completedAt?: string;
  dependencies?: string[];
  notes?: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  employeeId: string;
  message: string;
  progress: number;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}


