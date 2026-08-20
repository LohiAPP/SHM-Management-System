export type BridgeStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface Bridge {
  id: string;
  projectId: string;
  name: string;
  location: string;
  client: string;
  progress: number;
  currentWorkflowStage: number;
  responsibleTeam: string;
  assignedEmployees: string[];
  deadline: string;
  status: BridgeStatus;
}
