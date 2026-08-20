export type NotificationType = 'TASK_ASSIGNED' | 'TASK_DUE' | 'TASK_OVERDUE' | 'EXTENSION_REQUESTED' | 'EXTENSION_APPROVED' | 'EXTENSION_REJECTED' | 'STAGE_APPROVAL_REQUIRED' | 'CLIENT_APPROVED' | 'CLIENT_REJECTED' | 'STAGE_REOPENED' | 'WORK_UPDATE' | 'MONITORING_COMPLETED' | 'REWORK_REQUIRED' | 'DOCUMENT_UPLOADED';

export interface AppNotification {
  id: string;
  recipientEmployeeId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  projectId?: string;
  bridgeId?: string;
  taskId?: string;
  workflowStageId?: string;
  relatedEntityId?: string;
}
