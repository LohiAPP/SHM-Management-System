export type ClientApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ClientApproval {
  id: string;
  projectId: string;
  bridgeId: string;
  workflowStageId: string;
  documentType: string;
  status: ClientApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  clientComments?: string;
  returnWorkflowStageId?: string;
}
