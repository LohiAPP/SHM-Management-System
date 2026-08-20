export type WorkflowStageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'REJECTED';

export interface WorkflowStage {
  id: string;
  bridgeId: string;
  stageNumber: number;
  name: string;
  team: string; // Team code
  status: WorkflowStageStatus;
  progress: number;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  tasks: string[]; // task IDs
}
