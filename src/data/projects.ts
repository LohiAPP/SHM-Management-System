import type { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    projectCode: 'KDM-SHM-2026-001',
    name: 'Northern Railway Bridge Network',
    client: 'Northern Railways',
    location: 'North India',
    status: 'ACTIVE',
    progress: 45,
    deadline: '2026-12-31',
    bridges: ['bridge-1', 'bridge-2'],
    team: ['team-a', 'team-b', 'team-c'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'proj-2',
    projectCode: 'KDM-SHM-2026-002',
    name: 'Southern Highway Expansions',
    client: 'NHAI',
    location: 'South India',
    status: 'DELAYED',
    progress: 20,
    deadline: '2026-10-31',
    bridges: ['bridge-3'],
    team: ['team-a', 'team-b'],
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z'
  },
  {
    id: 'proj-3',
    projectCode: 'KDM-SHM-2026-003',
    name: 'Eastern Coastal Bridges',
    client: 'Eastern Railways',
    location: 'East India',
    status: 'COMPLETED',
    progress: 100,
    deadline: '2026-07-31',
    bridges: ['bridge-4'],
    team: ['team-c'],
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z'
  }
];
