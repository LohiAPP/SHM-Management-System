import type { ActivityLog } from '../types';

export const mockActivities: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '2026-08-20T10:30:00Z',
    actorId: 'emp-1',
    actorName: 'Rahul Sharma',
    action: 'STARTED_WORK',
    description: 'Started work on Controlled Load Testing - Phase 1',
    projectId: 'proj-1',
    bridgeId: 'bridge-1',
    taskId: 'task-1'
  },
  {
    id: 'act-2',
    timestamp: '2026-08-19T16:45:00Z',
    actorId: 'emp-4',
    actorName: 'Vikram Singh',
    action: 'UPLOADED_DOCUMENT',
    description: 'Uploaded preliminary AutoCAD sections',
    projectId: 'proj-1',
    bridgeId: 'bridge-2',
    taskId: 'task-3'
  }
];
