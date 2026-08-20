export interface ActivityLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  description: string;
  projectId?: string;
  bridgeId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}
