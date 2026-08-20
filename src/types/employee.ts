export type EmployeeRole = 'ADMIN' | 'HOD' | 'MANAGER' | 'EMPLOYEE' | 'ENGINEER' | 'TECHNICIAN';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  teamId: string;
  workLocation: 'SITE' | 'OFFICE' | 'LEAVE';
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  currentTaskId?: string;
  productivity: number; // percentage
}
