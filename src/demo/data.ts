import type { DemoEmployee, DemoTask, DemoWorkLog, DemoDelayReview } from './types';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const initialDemoEmployees: DemoEmployee[] = [
  { id: 'emp-s1', employeeId: 'EMP-S001', firstName: 'Ravi', lastName: 'Kumar', displayName: 'Ravi Kumar', email: 'ravi@demo.com', employeeType: 'SITE', team: 'Team A — Instrumentation', status: 'ACTIVE' },
  { id: 'emp-s2', employeeId: 'EMP-S002', firstName: 'Suresh', lastName: 'Reddy', displayName: 'Suresh Reddy', email: 'suresh@demo.com', employeeType: 'SITE', team: 'Team A — Instrumentation', status: 'ACTIVE' },
  { id: 'emp-s3', employeeId: 'EMP-S003', firstName: 'Kiran', lastName: 'Kumar', displayName: 'Kiran Kumar', email: 'kiran@demo.com', employeeType: 'SITE', team: 'Team A — Instrumentation', status: 'ACTIVE' },
  { id: 'emp-o1', employeeId: 'EMP-O001', firstName: 'Priya', lastName: 'Sharma', displayName: 'Priya Sharma', email: 'priya@demo.com', employeeType: 'OFFICE', team: 'Team B — Numerical Analysis', status: 'ACTIVE' },
  { id: 'emp-o2', employeeId: 'EMP-O002', firstName: 'Anil', lastName: 'Kumar', displayName: 'Anil Kumar', email: 'anil@demo.com', employeeType: 'OFFICE', team: 'Team B — Numerical Analysis', status: 'ACTIVE' },
  { id: 'emp-o3', employeeId: 'EMP-O003', firstName: 'Meena', lastName: 'Rao', displayName: 'Meena Rao', email: 'meena@demo.com', employeeType: 'OFFICE', team: 'Team C — Data Analysis', status: 'ACTIVE' }
];

// Helper to create exact datetimes
const createTime = (dateStr: string, timeStr: string) => `${dateStr}T${timeStr}`;

export const initialDemoTasks: DemoTask[] = [
  {
    id: 'dt-1', title: 'Sensor Installation', bridgeId: 'B-102', bridgeName: 'Bridge B-102',
    employeeId: 'emp-s1', employeeType: 'SITE', assignedBy: 'Manager',
    startDate: createTime(todayStr, '08:00:00Z'), deadline: createTime(todayStr, '17:00:00Z'),
    completedAt: null, expectedHours: 8, progress: 72, status: 'IN_PROGRESS'
  },
  {
    id: 'dt-2', title: 'Sensor Validation', bridgeId: 'B-102', bridgeName: 'Bridge B-102',
    employeeId: 'emp-s2', employeeType: 'SITE', assignedBy: 'Manager',
    startDate: createTime(yesterdayStr, '08:00:00Z'), deadline: createTime(yesterdayStr, '17:00:00Z'),
    completedAt: createTime(todayStr, '10:30:00Z'), expectedHours: 8, progress: 100, status: 'DELAY_REVIEW_PENDING'
  },
  {
    id: 'dt-3', title: 'Instrumentation Report', bridgeId: 'B-105', bridgeName: 'Bridge B-105',
    employeeId: 'emp-o1', employeeType: 'OFFICE', assignedBy: 'Manager',
    startDate: createTime(yesterdayStr, '08:00:00Z'), deadline: createTime(yesterdayStr, '17:00:00Z'),
    completedAt: createTime(todayStr, '09:00:00Z'), expectedHours: 4, progress: 100, status: 'DELAY_REJECTED'
  },
  {
    id: 'dt-4', title: 'Site Inspection', bridgeId: 'B-101', bridgeName: 'Bridge B-101',
    employeeId: 'emp-s3', employeeType: 'SITE', assignedBy: 'Manager',
    startDate: createTime(todayStr, '08:00:00Z'), deadline: createTime(todayStr, '17:00:00Z'),
    completedAt: createTime(todayStr, '14:00:00Z'), expectedHours: 5, progress: 100, status: 'COMPLETED'
  },
  {
    id: 'dt-5', title: 'Numerical Model Preparation', bridgeId: 'B-103', bridgeName: 'Bridge B-103',
    employeeId: 'emp-o2', employeeType: 'OFFICE', assignedBy: 'Manager',
    startDate: createTime(todayStr, '08:00:00Z'), deadline: createTime(todayStr, '18:00:00Z'),
    completedAt: null, expectedHours: 6, progress: 45, status: 'IN_PROGRESS'
  }
];

export const initialDemoWorkLogs: DemoWorkLog[] = [
  // Task 1: Active log for 2h47m
  { id: 'dwl-1', taskId: 'dt-1', employeeId: 'emp-s1', startedAt: new Date(Date.now() - (2 * 3600000 + 47 * 60000 + 32 * 1000)).toISOString(), endedAt: null, durationSeconds: 0 },
  // Task 5: Active log for 1h32m
  { id: 'dwl-5', taskId: 'dt-5', employeeId: 'emp-o2', startedAt: new Date(Date.now() - (1 * 3600000 + 32 * 60000 + 18 * 1000)).toISOString(), endedAt: null, durationSeconds: 0 },
];

export const initialDemoReviews: DemoDelayReview[] = [
  {
    id: 'ddr-2', taskId: 'dt-2', employeeId: 'emp-s2',
    reason: 'Sensor replacement was delayed because the required equipment was not available at the site.',
    submittedAt: createTime(todayStr, '10:31:00Z'), status: 'PENDING',
    reviewedBy: null, reviewedAt: null, managerComment: null, performanceImpact: 'NONE', negativePoints: 0
  },
  {
    id: 'ddr-3', taskId: 'dt-3', employeeId: 'emp-o1',
    reason: 'I was busy with another task.',
    submittedAt: createTime(todayStr, '09:05:00Z'), status: 'REJECTED',
    reviewedBy: 'manager-id', reviewedAt: createTime(todayStr, '09:15:00Z'),
    managerComment: 'Reason does not justify the delay. Task should have been completed within the assigned time.',
    performanceImpact: 'NEGATIVE', negativePoints: -1
  }
];
