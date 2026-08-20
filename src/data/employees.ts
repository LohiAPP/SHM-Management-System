import type { Employee } from '../types';

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: 'Rahul Sharma', role: 'ENGINEER', teamId: 'team-a', workLocation: 'SITE', availability: 'BUSY', currentTaskId: 'task-1', productivity: 85 },
  { id: 'emp-2', name: 'Amit Kumar', role: 'TECHNICIAN', teamId: 'team-a', workLocation: 'SITE', availability: 'BUSY', currentTaskId: 'task-1', productivity: 90 },
  { id: 'emp-3', name: 'Sneha Patel', role: 'ENGINEER', teamId: 'team-b', workLocation: 'OFFICE', availability: 'AVAILABLE', productivity: 95 },
  { id: 'emp-4', name: 'Vikram Singh', role: 'MANAGER', teamId: 'team-b', workLocation: 'OFFICE', availability: 'BUSY', currentTaskId: 'task-3', productivity: 80 },
  { id: 'emp-5', name: 'Priya Desai', role: 'ENGINEER', teamId: 'team-c', workLocation: 'OFFICE', availability: 'AVAILABLE', productivity: 88 },
  { id: 'emp-6', name: 'Anil Gupta', role: 'HOD', teamId: 'team-c', workLocation: 'OFFICE', availability: 'BUSY', productivity: 92 },
];
