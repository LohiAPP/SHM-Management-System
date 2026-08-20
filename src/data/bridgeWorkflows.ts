import type { WorkflowStage } from '../types';
import { WORKFLOW_STAGES } from './workflow';

export const mockBridgeWorkflows: WorkflowStage[] = [];

// For Bridge 1 - Chenab Rail Bridge (Current stage 8: 72-Hour Monitoring)
WORKFLOW_STAGES.forEach(template => {
  let status = 'NOT_STARTED' as any;
  let progress = 0;
  
  if (template.stageNumber < 8) {
    status = 'COMPLETED';
    progress = 100;
  } else if (template.stageNumber === 8) {
    status = 'IN_PROGRESS';
    progress = 45;
  }

  mockBridgeWorkflows.push({
    id: `wf-1-${template.stageNumber}`,
    bridgeId: 'bridge-1',
    stageNumber: template.stageNumber,
    name: template.name,
    team: template.team,
    status: status,
    progress: progress,
    startDate: status !== 'NOT_STARTED' ? '2026-08-10T10:00:00Z' : undefined,
    expectedEndDate: '2026-08-25T10:00:00Z',
    actualEndDate: status === 'COMPLETED' ? '2026-08-15T10:00:00Z' : undefined,
    tasks: template.stageNumber === 7 ? ['task-1'] : []
  });
});

// For Bridge 2 - Bogibeel Bridge (Current stage 3: Client Methodology Approval, Client Approval Pending)
WORKFLOW_STAGES.forEach(template => {
  let status = 'NOT_STARTED' as any;
  let progress = 0;
  
  if (template.stageNumber < 3) {
    status = 'COMPLETED';
    progress = 100;
  } else if (template.stageNumber === 3) {
    status = 'IN_PROGRESS'; // Pending approval
    progress = 50;
  }

  mockBridgeWorkflows.push({
    id: `wf-2-${template.stageNumber}`,
    bridgeId: 'bridge-2',
    stageNumber: template.stageNumber,
    name: template.name,
    team: template.team,
    status: status,
    progress: progress,
    tasks: template.stageNumber === 2 ? ['task-3'] : []
  });
});

// For Bridge 3 - Godavari Arch Bridge (Current stage 4: Sensor Installation, Delayed)
WORKFLOW_STAGES.forEach(template => {
  let status = 'NOT_STARTED' as any;
  let progress = 0;
  
  if (template.stageNumber < 4) {
    status = 'COMPLETED';
    progress = 100;
  } else if (template.stageNumber === 4) {
    status = 'DELAYED';
    progress = 20;
  }

  mockBridgeWorkflows.push({
    id: `wf-3-${template.stageNumber}`,
    bridgeId: 'bridge-3',
    stageNumber: template.stageNumber,
    name: template.name,
    team: template.team,
    status: status,
    progress: progress,
    tasks: template.stageNumber === 4 ? ['task-2'] : []
  });
});

// For Bridge 4 - Pamban Rail Bridge (Current stage 12: Client Final Approval, Completed)
WORKFLOW_STAGES.forEach(template => {
  mockBridgeWorkflows.push({
    id: `wf-4-${template.stageNumber}`,
    bridgeId: 'bridge-4',
    stageNumber: template.stageNumber,
    name: template.name,
    team: template.team,
    status: 'COMPLETED',
    progress: 100,
    startDate: '2025-12-01T10:00:00Z',
    expectedEndDate: '2026-07-31T10:00:00Z',
    actualEndDate: '2026-07-28T10:00:00Z',
    tasks: []
  });
});

// For Bridge 5 - Vivekananda Setu (Current stage 10: Instrumentation Report, REJECTED)
WORKFLOW_STAGES.forEach(template => {
  let status = 'NOT_STARTED' as any;
  let progress = 0;
  
  if (template.stageNumber < 10) {
    status = 'COMPLETED';
    progress = 100;
  } else if (template.stageNumber === 10) {
    status = 'REJECTED'; // Revision Required
    progress = 80;
  }

  mockBridgeWorkflows.push({
    id: `wf-5-${template.stageNumber}`,
    bridgeId: 'bridge-5',
    stageNumber: template.stageNumber,
    name: template.name,
    team: template.team,
    status: status,
    progress: progress,
    tasks: []
  });
});
