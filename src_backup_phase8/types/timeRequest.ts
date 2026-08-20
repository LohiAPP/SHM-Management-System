export type TimeRequestDecision = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TimeRequestUnit = 'HOURS' | 'DAYS';

export interface TimeRequest {
  id: string;
  employeeId: string;
  taskId: string;
  projectId: string;
  bridgeId: string;
  workMode: string;
  originalDeadline: string;
  requestedAdditionalTime: number;
  requestedTimeType: TimeRequestUnit;
  reason: string;
  currentProgress: number;
  remainingWork: string;
  requestDate: string;
  approverId?: string;
  decision: TimeRequestDecision;
  decisionDate?: string;
  approvedAdditionalTime?: number;
  HODComments?: string;
}
