// import { ApiDataService } from '../api/ApiDataService';
// export const DataService = ApiDataService; // Uncomment to use real backend!

import { mockProjects } from '../../data/projects';
import { mockBridges } from '../../data/bridges';
import { mockTeams } from '../../data/teams';
import { mockEmployees } from '../../data/employees';
import { mockTasks, mockTaskUpdates, mockTaskAttachments } from '../../data/tasks';
import { mockActivities } from '../../data/activities';
import { WORKFLOW_STAGES } from '../../data/workflow';
import { mockBridgeWorkflows } from '../../data/bridgeWorkflows';
import type { Task, TaskUpdate, TaskAttachment, ActivityLog, WorkLog } from '../../types';

// Browser persistence helper
const load = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// Mutable state for the session
let sessionTasks = load<Task[]>('shm_tasks', mockTasks);
let sessionTaskUpdates = load<TaskUpdate[]>('shm_updates', mockTaskUpdates);
let sessionTaskAttachments = load<TaskAttachment[]>('shm_attachments', mockTaskAttachments);
let sessionActivities = load<ActivityLog[]>('shm_activities', mockActivities);
let sessionWorkLogs = load<WorkLog[]>('shm_worklogs', []);

const calculateBridgeProgress = (bridgeId: string): number => {
  const workflows = mockBridgeWorkflows.filter(wf => wf.bridgeId === bridgeId);
  if (workflows.length === 0) return 0;
  
  const totalProgress = workflows.reduce((sum, wf) => sum + (wf.status === 'COMPLETED' ? 100 : (wf.progress || 0)), 0);
  return Math.round(totalProgress / workflows.length);
};

const calculateProjectProgress = (projectId: string): number => {
  const bridges = mockBridges.filter(b => b.projectId === projectId);
  if (bridges.length === 0) return 0;
  
  const total = bridges.reduce((sum, b) => sum + calculateBridgeProgress(b.id), 0);
  return Math.round(total / bridges.length);
};

const enrichedBridges = mockBridges.map(b => ({
  ...b,
  progress: calculateBridgeProgress(b.id)
}));

const enrichedProjects = mockProjects.map(p => ({
  ...p,
  progress: calculateProjectProgress(p.id)
}));

export const DataService = {
  // PROJECTS
  getProjects: async () => enrichedProjects,
  getProjectById: async (id: string) => enrichedProjects.find(p => p.id === id) || null,
  
  // BRIDGES
  getBridges: async () => enrichedBridges,
  getBridgesByProjectId: async (projectId: string) => enrichedBridges.filter(b => b.projectId === projectId),
  getBridgeById: async (id: string) => enrichedBridges.find(b => b.id === id) || null,
  
  // TEAMS & EMPLOYEES
  getTeams: async () => mockTeams,
  getEmployees: async () => mockEmployees,
  getEmployeeById: async (id: string) => mockEmployees.find(e => e.id === id) || null,
  
  // WORKFLOW
  getWorkflowStages: async () => WORKFLOW_STAGES,
  getBridgeWorkflows: async (bridgeId: string) => mockBridgeWorkflows.filter(w => w.bridgeId === bridgeId),
  
  // TASKS
  getTasks: async () => sessionTasks,
  getTasksByBridgeId: async (bridgeId: string) => sessionTasks.filter(t => t.bridgeId === bridgeId),
  getTasksByEmployeeId: async (employeeId: string) => sessionTasks.filter(t => (t as any).assignedTo?.includes(employeeId) || (t as any).employeeId === employeeId),
  getTaskById: async (id: string) => sessionTasks.find(t => t.id === id) || null,
  
  createTask: async (taskData: any) => {
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessionTasks = [newTask, ...sessionTasks];
    save('shm_tasks', sessionTasks);
    return newTask;
  },

  updateTaskProgress: async (taskId: string, progress: number) => {
    sessionTasks = sessionTasks.map(t => 
      t.id === taskId ? { ...t, progress, updatedAt: new Date().toISOString() } : t
    );
    save('shm_tasks', sessionTasks);
  },
  
  //  // LIFECYCLE
  getAllWorkLogs: async () => sessionWorkLogs,
  getWorkLogs: async (employeeId?: string) => employeeId ? sessionWorkLogs.filter(l => l.employeeId === employeeId) : sessionWorkLogs,
  calculateDailyProductiveHours: async (_employeeId: string) => 8,
  startWorkSession: async (employeeId: string, taskId: string) => {
    const active = sessionWorkLogs.find(l => l.employeeId === employeeId && l.status === 'ACTIVE');
    if (active) throw new Error('You already have an active work session. Please pause or complete it first.');
    
    const newLog: any = {
      id: `wl-${Date.now()}`,
      taskId,
      employeeId,
      startTime: new Date().toISOString(),
      status: 'ACTIVE'
    };
    sessionWorkLogs = [newLog, ...sessionWorkLogs];
    save('shm_worklogs', sessionWorkLogs);

    // Update task status if it was pending
    sessionTasks = sessionTasks.map(t => 
      t.id === taskId && (t.status as any) === 'PENDING' ? { ...t, status: 'IN_PROGRESS' as any } : t
    );
    save('shm_tasks', sessionTasks);

    return newLog;
  },

  pauseWorkSession: async (employeeId: string, status: 'PAUSED' | 'COMPLETED', summary?: string) => {
    const active = sessionWorkLogs.find(l => l.employeeId === employeeId && l.status === 'ACTIVE');
    if (!active) throw new Error('No active session found.');

    const endTime = new Date().toISOString();
    const duration = Math.round((new Date(endTime).getTime() - new Date(active.startTime).getTime()) / 60000);

    sessionWorkLogs = sessionWorkLogs.map(l => 
      l.id === active.id ? { ...l, endTime, durationMinutes: duration, status, summary } : l
    );
    save('shm_worklogs', sessionWorkLogs);

    if (status === 'COMPLETED') {
      sessionTasks = sessionTasks.map(t => 
        t.id === active.taskId ? { ...t, status: 'COMPLETED', progress: 100 } : t
      );
      save('shm_tasks', sessionTasks);
    }
  },

  getActiveWorkSession: async (employeeId: string) => {
    return sessionWorkLogs.find(l => l.employeeId === employeeId && l.status === 'ACTIVE') || null;
  },

  getWorkLogsByTask: async (taskId: string) => {
    return sessionWorkLogs.filter(l => l.taskId === taskId);
  },
  
  // UPDATES
  getTaskUpdates: async (taskId: string) => sessionTaskUpdates.filter(u => u.taskId === taskId),
  addTaskUpdate: async (update: any) => {
    const newUpdate = {
      ...update,
      id: `upd-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    sessionTaskUpdates = [newUpdate, ...sessionTaskUpdates];
    save('shm_updates', sessionTaskUpdates);
    return newUpdate;
  },
  
  // ATTACHMENTS
  getTaskAttachments: async (taskId: string) => sessionTaskAttachments.filter(a => a.taskId === taskId),
  addTaskAttachment: async (attachment: any) => {
    const newAttachment = {
      ...attachment,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    sessionTaskAttachments = [newAttachment, ...sessionTaskAttachments];
    save('shm_attachments', sessionTaskAttachments);
    return newAttachment;
  },
  
  // ACTIVITY
  getActivities: async () => sessionActivities,
  getActivitiesByProjectId: async (projectId: string) => sessionActivities.filter(a => a.projectId === projectId),
  getActivitiesByTaskId: async (taskId: string) => sessionActivities.filter(a => a.taskId === taskId),
  getActivitiesByEmployeeId: async (employeeId: string) => sessionActivities.filter(a => (a as any).employeeId === employeeId),
  logActivity: async (activity: any) => {
    const newActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    sessionActivities = [newActivity, ...sessionActivities];
    save('shm_activities', sessionActivities);
    return newActivity;
  },

  // TIME REQUESTS
  getTimeRequests: async () => {
    return load<any[]>('shm_time_requests', []);
  },
  getTimeRequestsByTaskId: async (taskId: string) => {
    const reqs = load<any[]>('shm_time_requests', []);
    return reqs.filter(r => r.taskId === taskId);
  },
  getTimeRequestsByEmployeeId: async (employeeId: string) => {
    const reqs = load<any[]>('shm_time_requests', []);
    return reqs.filter(r => r.requestedBy === employeeId);
  },
  createTimeRequest: async (data: any) => {
    let reqs = load<any[]>('shm_time_requests', []);
    const newReq = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    reqs = [newReq, ...reqs];
    save('shm_time_requests', reqs);
    return newReq;
  },
  reviewTimeRequest: async (id: string, decision: 'APPROVED' | 'REJECTED', approverId: string, approvedHours?: number, comments?: string) => {
    let reqs = load<any[]>('shm_time_requests', []);
    reqs = reqs.map(r => r.id === id ? {
      ...r,
      status: decision,
      reviewedBy: approverId,
      reviewedAt: new Date().toISOString(),
      approvedHours,
      reviewerComments: comments
    } : r);
    save('shm_time_requests', reqs);
  },
  calculateEffectiveDeadline: async (taskId: string) => {
    const t = sessionTasks.find(x => x.id === taskId);
    if (!t) return new Date().toISOString();
    let base = new Date(t.deadline);
    const reqs = await DataService.getTimeRequestsByTaskId(taskId);
    reqs.filter(r => r.status === 'APPROVED').forEach(r => {
      base = new Date(base.getTime() + (r.approvedHours || 0) * 3600000);
    });
    return base.toISOString();
  },

  // REWORK
  getReworkHistory: async () => {
    return load<any[]>('shm_rework', []);
  },
  getReworkHistoryByBridgeId: async (bridgeId: string) => {
    const r = load<any[]>('shm_rework', []);
    return r.filter(x => x.bridgeId === bridgeId);
  },
  createRework: async (data: any) => {
    let r = load<any[]>('shm_rework', []);
    const newRework = {
      ...data,
      id: `rwk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    r = [newRework, ...r];
    save('shm_rework', r);
    
    // Auto-update task progress to 0
    if (data.taskId) {
      await DataService.updateTaskProgress(data.taskId, 0);
    }
    return newRework;
  },

  // DOCUMENTS
  getDocumentsByTaskId: async (taskId: string): Promise<any[]> => {
    return sessionTaskAttachments.filter(a => a.taskId === taskId);
  },
  createDocument: async (data: any) => data,
  deleteDocument: async (_id: string) => null,
  
  // NOTIFICATIONS
  getNotifications: async (_employeeId: string) => {
    return load<any[]>('shm_notifications', []);
  },
  getUnreadNotifications: async (employeeId: string) => {
    const notifs = load<any[]>('shm_notifications', []);
    return notifs.filter(n => n.recipientEmployeeId === employeeId && !n.read);
  },
  markNotificationRead: async (id: string) => {
    let notifs = load<any[]>('shm_notifications', []);
    notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    save('shm_notifications', notifs);
  },
  markAllNotificationsRead: async (employeeId: string) => {
    let notifs = load<any[]>('shm_notifications', []);
    notifs = notifs.map(n => n.recipientEmployeeId === employeeId ? { ...n, read: true } : n);
    save('shm_notifications', notifs);
  },
  createNotification: async (notifData: any) => {
    let notifs = load<any[]>('shm_notifications', []);
    const newNotif = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifs = [newNotif, ...notifs];
    save('shm_notifications', notifs);
    return newNotif;
  }
};
