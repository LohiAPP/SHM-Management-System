export type DemoEmployeeType = 'SITE' | 'OFFICE';

export type DemoTaskStatus = 
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'DELAY_REVIEW_PENDING'
  | 'DELAY_ACCEPTED'
  | 'DELAY_REJECTED';

export interface DemoEmployee {
  id: string;
  employeeId: string; // EMP-S001, etc.
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  employeeType: DemoEmployeeType;
  team: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DemoWorkLog {
  id: string;
  taskId: string;
  employeeId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
}

export interface DemoDelayReview {
  id: string;
  taskId: string;
  employeeId: string;
  reason: string;
  submittedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  managerComment: string | null;
  performanceImpact: 'NONE' | 'NEGATIVE';
  negativePoints: number;
}

export interface DemoTask {
  id: string;
  title: string;
  bridgeId: string;
  bridgeName: string; // denormalized for demo
  employeeId: string;
  employeeType: DemoEmployeeType;
  assignedBy: string;
  startDate: string;
  deadline: string;
  completedAt: string | null;
  expectedHours: number;
  progress: number;
  status: DemoTaskStatus;
}

export interface DemoPerformanceRecord {
  totalTasks: number;
  completedTasks: number;
  onTimeTasks: number;
  delayedTasks: number;
  acceptedDelays: number;
  rejectedDelays: number;
  negativePoints: number;
}
