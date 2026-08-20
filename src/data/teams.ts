import type { Team } from '../types';

export const mockTeams: Team[] = [
  {
    id: 'team-a',
    name: 'Team A - Instrumentation',
    code: 'TEAM_A',
    responsibilities: ['Sensor installation', 'Sensor deployment', 'Site instrumentation', 'Controlled load testing', '72-hour monitoring', 'Sensor data collection'],
    employeeIds: ['emp-1', 'emp-2']
  },
  {
    id: 'team-b',
    name: 'Team B - Numerical Analysis',
    code: 'TEAM_B',
    responsibilities: ['Bridge inspection', 'Inspection reports', 'Methodology reports', 'AutoCAD sections', 'Numerical model', 'Sensor mapping', 'Numerical validation', 'Higher axle load analysis', 'Numerical sheet'],
    employeeIds: ['emp-3', 'emp-4']
  },
  {
    id: 'team-c',
    name: 'Team C - Data Analysis',
    code: 'TEAM_C',
    responsibilities: ['Sensor validation', 'Model validation', 'Structural adequacy', 'Fatigue assessment', 'Instrumentation report', 'Final report'],
    employeeIds: ['emp-5', 'emp-6']
  }
];
