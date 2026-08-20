import type { Bridge } from '../types';

export const mockBridges: Bridge[] = [
  {
    id: 'bridge-1',
    projectId: 'proj-1',
    name: 'Chenab Rail Bridge',
    location: 'Jammu & Kashmir',
    client: 'Northern Railways',
    progress: 60,
    currentWorkflowStage: 7,
    responsibleTeam: 'TEAM_A',
    assignedEmployees: ['emp-1', 'emp-2'],
    deadline: '2026-11-30',
    status: 'IN_PROGRESS'
  },
  {
    id: 'bridge-2',
    projectId: 'proj-1',
    name: 'Bogibeel Bridge',
    location: 'Assam',
    client: 'Northeast Frontier Railway',
    progress: 10,
    currentWorkflowStage: 2,
    responsibleTeam: 'TEAM_B',
    assignedEmployees: ['emp-3', 'emp-4'],
    deadline: '2026-12-31',
    status: 'PENDING'
  },
  {
    id: 'bridge-3',
    projectId: 'proj-2',
    name: 'Godavari Arch Bridge',
    location: 'Andhra Pradesh',
    client: 'South Central Railway',
    progress: 30,
    currentWorkflowStage: 4,
    responsibleTeam: 'TEAM_A',
    assignedEmployees: [],
    deadline: '2026-10-31',
    status: 'DELAYED'
  },
  {
    id: 'bridge-4',
    projectId: 'proj-3',
    name: 'Pamban Rail Bridge',
    location: 'Tamil Nadu',
    client: 'Southern Railway',
    progress: 100,
    currentWorkflowStage: 13,
    responsibleTeam: 'CLIENT',
    assignedEmployees: [],
    deadline: '2026-07-31',
    status: 'COMPLETED'
  }
, { id: 'bridge-5', projectId: 'proj-3', name: 'Vivekananda Setu', location: 'West Bengal', client: 'Eastern Railway', progress: 80, currentWorkflowStage: 10, responsibleTeam: 'TEAM_C', assignedEmployees: ['emp-5', 'emp-6'], deadline: '2026-09-30', status: 'DELAYED' } ];
