export type ReworkStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ReworkHistory {
  id: string;
  projectId: string;
  bridgeId: string;
  workflowStageId: string; // The stage where the rejection happened
  taskId?: string; // Optional specific task
  initiatedBy: string; // ID of who rejected/initiated rework
  initiatedAt: string;
  reason: string;
  comments: string;
  returnStageId: string; // The stage to return to
  returnTaskId?: string;
  roundNumber: number;
  status: ReworkStatus;
  resolvedAt?: string;
}
