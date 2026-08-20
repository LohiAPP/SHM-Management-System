import type { Task, TaskUpdate, TaskAttachment } from '../types';

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    bridgeId: 'bridge-1',
    workflowStageId: 'wf-1-7',
    title: 'Controlled Load Testing - Phase 1',
    description: 'Execute the initial phase of controlled load testing.',
    teamId: 'team-a',
    assignedEmployeeIds: ['emp-1', 'emp-2'],
    workMode: 'SITE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    progress: 40,
    plannedHours: 24,
    actualHours: 10,
    plannedStartDate: '2026-08-18T09:00:00Z',
    plannedEndDate: '2026-08-20T18:00:00Z',
    actualStartDate: '2026-08-18T09:30:00Z',
    deadline: '2026-08-25T18:00:00Z',
    createdAt: '2026-08-18T09:00:00Z'
  },
  {
    id: 'task-2',
    projectId: 'proj-2',
    bridgeId: 'bridge-3',
    workflowStageId: 'wf-3-4',
    title: 'Sensor Installation Delay Fix',
    description: 'Resolve the missing sensor mounts at pier 4.',
    teamId: 'team-a',
    assignedEmployeeIds: [],
    workMode: 'SITE',
    priority: 'CRITICAL',
    status: 'BLOCKED',
    progress: 20,
    plannedHours: 8,
    actualHours: 12,
    plannedStartDate: '2026-08-10T09:00:00Z',
    plannedEndDate: '2026-08-11T18:00:00Z',
    actualStartDate: '2026-08-10T10:00:00Z',
    deadline: '2026-08-19T18:00:00Z',
    createdAt: '2026-08-10T09:00:00Z'
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    bridgeId: 'bridge-2',
    workflowStageId: 'wf-2-2',
    title: 'Draft Methodology Report',
    description: 'Prepare the initial draft for methodology report.',
    teamId: 'team-b',
    assignedEmployeeIds: ['emp-4'],
    workMode: 'OFFICE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    progress: 60,
    plannedHours: 16,
    actualHours: 10,
    plannedStartDate: '2026-08-15T09:00:00Z',
    plannedEndDate: '2026-08-17T18:00:00Z',
    actualStartDate: '2026-08-15T09:15:00Z',
    deadline: '2026-08-22T18:00:00Z',
    createdAt: '2026-08-15T09:00:00Z'
  }
];

export const mockTaskUpdates: TaskUpdate[] = [
  {
    id: 'upd-1',
    taskId: 'task-1',
    employeeId: 'emp-1',
    message: 'Completed initial sensor placement, moving to load zone A.',
    progress: 25,
    timestamp: '2026-08-18T14:30:00Z'
  }
];

export const mockTaskAttachments: TaskAttachment[] = [
  {
    id: 'att-1',
    taskId: 'task-1',
    name: 'site_photo_1.jpg',
    type: 'Inspection Photo',
    uploadedBy: 'emp-1',
    uploadedAt: '2026-08-18T14:35:00Z'
  }
];
