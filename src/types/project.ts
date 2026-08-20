export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'ON_HOLD';

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  client: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  bridges: string[]; // bridge IDs
  team: string[]; // team IDs
  createdAt: string;
  updatedAt: string;
}
