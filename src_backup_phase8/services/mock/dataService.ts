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
  getProjects: async () => enrichedProjects,
  getProjectById: async (id: string) => enrichedProjects.find(p => p.id === id),
  getBridges: async () => enrichedBridges,
  getBridgesByProjectId: async (projectId: string) => enrichedBridges.filter(b => b.projectId === projectId),
  getBridgeById: async (id: string) => enrichedBridges.find(b => b.id === id),
  getTeams: async () => mockTeams,
  getEmployees: async () => mockEmployees,
  getEmployeeById: async (id: string) => mockEmployees.find(e => e.id === id),
  
  // Task methods
  getTasks: async () => sessionTasks,
  getTaskById: async (id: string) => sessionTasks.find(t => t.id === id),
  getTasksByProjectId: async (projectId: string) => sessionTasks.filter(t => t.projectId === projectId),
  getTasksByBridgeId: async (bridgeId: string) => sessionTasks.filter(t => t.bridgeId === bridgeId),
  getTasksByWorkflowStageId: async (stageId: string) => sessionTasks.filter(t => t.workflowStageId === stageId),
  getTasksByEmployeeId: async (employeeId: string) => sessionTasks.filter(t => t.assignedEmployeeIds.includes(employeeId)),
  
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    sessionTasks = [newTask, ...sessionTasks];
    save('shm_tasks', sessionTasks);
    return newTask;
  },
  
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    sessionTasks = sessionTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    save('shm_tasks', sessionTasks);
    return sessionTasks.find(t => t.id === taskId);
  },
  
  updateTaskStatus: async (taskId: string, status: Task['status']) => {
    sessionTasks = sessionTasks.map(t => t.id === taskId ? { ...t, status } : t);
    save('shm_tasks', sessionTasks);
    return sessionTasks.find(t => t.id === taskId);
  },
  
  updateTaskProgress: async (taskId: string, progress: number) => {
    sessionTasks = sessionTasks.map(t => t.id === taskId ? { ...t, progress } : t);
    save('shm_tasks', sessionTasks);
    return sessionTasks.find(t => t.id === taskId);
  },

  assignEmployees: async (taskId: string, employeeIds: string[]) => {
    sessionTasks = sessionTasks.map(t => t.id === taskId ? { ...t, assignedEmployeeIds: employeeIds } : t);
    save('shm_tasks', sessionTasks);
    
    // Auto-generate notifications
    employeeIds.forEach(empId => {
      DataService.createNotification({
        recipientEmployeeId: empId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned to a new task.',
        taskId
      });
    });

    return sessionTasks.find(t => t.id === taskId);
  },

  // Updates & Attachments
  getTaskUpdates: async (taskId: string) => sessionTaskUpdates.filter(u => u.taskId === taskId),
  getEmployeeUpdates: async (employeeId: string) => sessionTaskUpdates.filter(u => u.employeeId === employeeId),
  addTaskUpdate: async (updateData: Omit<TaskUpdate, 'id'>) => {
    const newUpdate = { ...updateData, id: `upd-${Date.now()}` };
    sessionTaskUpdates = [newUpdate, ...sessionTaskUpdates];
    save('shm_updates', sessionTaskUpdates);
    return newUpdate;
  },
  
  getTaskAttachments: async (taskId: string) => sessionTaskAttachments.filter(a => a.taskId === taskId),
  addTaskAttachment: async (attachmentData: Omit<TaskAttachment, 'id'>) => {
    const newAttachment = { ...attachmentData, id: `att-${Date.now()}` };
    sessionTaskAttachments = [newAttachment, ...sessionTaskAttachments];
    save('shm_attachments', sessionTaskAttachments);
    return newAttachment;
  },

  // Activities
  getActivities: async () => sessionActivities,
  getActivitiesByProjectId: async (projectId: string) => sessionActivities.filter(a => a.projectId === projectId),
  getActivitiesByTaskId: async (taskId: string) => sessionActivities.filter(a => a.taskId === taskId),
  getActivitiesByEmployeeId: async (employeeId: string) => sessionActivities.filter(a => a.actorId === employeeId),
  
  logActivity: async (activityData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activityData,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    sessionActivities = [newActivity, ...sessionActivities];
    save('shm_activities', sessionActivities);
    return newActivity;
  },

  // Workflow Stages
  getWorkflowStages: async () => WORKFLOW_STAGES,
  getBridgeWorkflows: async (bridgeId: string) => mockBridgeWorkflows.filter(wf => wf.bridgeId === bridgeId),

  // Work Tracking (Phase 4)
  getAllWorkLogs: async () => load<any[]>('shm_worklogs', []),
  getWorkLogs: async (employeeId: string) => sessionWorkLogs.filter(w => w.employeeId === employeeId),
  getWorkLogsByTask: async (taskId: string) => sessionWorkLogs.filter(w => w.taskId === taskId),
  getActiveWorkSession: async (employeeId: string) => sessionWorkLogs.find(w => w.employeeId === employeeId && w.status === 'ACTIVE'),
  
  startWorkSession: async (employeeId: string, taskId: string) => {
    // Check if another task is active
    const active = sessionWorkLogs.find(w => w.employeeId === employeeId && w.status === 'ACTIVE');
    if (active && active.taskId !== taskId) {
      throw new Error('MULTIPLE_ACTIVE_TASKS');
    }
    
    if (active && active.taskId === taskId) return active; // Already active

    const task = sessionTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const newLog: WorkLog = {
      id: `wl-${Date.now()}`,
      employeeId,
      taskId,
      projectId: task.projectId,
      bridgeId: task.bridgeId,
      startTime: new Date().toISOString(),
      status: 'ACTIVE'
    };
    
    sessionWorkLogs = [newLog, ...sessionWorkLogs];
    save('shm_worklogs', sessionWorkLogs);

    // Update actual start date if not set
    if (!task.actualStartDate) {
      await DataService.updateTask(taskId, { actualStartDate: new Date().toISOString() });
    }
    await DataService.updateTaskStatus(taskId, 'IN_PROGRESS');

    return newLog;
  },

  pauseWorkSession: async (employeeId: string, status: 'PAUSED' | 'COMPLETED' = 'PAUSED', summary?: string) => {
    const activeIndex = sessionWorkLogs.findIndex(w => w.employeeId === employeeId && w.status === 'ACTIVE');
    if (activeIndex === -1) return null;
    
    const active = sessionWorkLogs[activeIndex];
    const endTime = new Date();
    const startTime = new Date(active.startTime);
    // duration in minutes (or parts of minutes for testing accuracy)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    
    const updated = {
      ...active,
      endTime: endTime.toISOString(),
      durationMinutes,
      status,
      summary
    };

    sessionWorkLogs = [
      ...sessionWorkLogs.slice(0, activeIndex),
      updated,
      ...sessionWorkLogs.slice(activeIndex + 1)
    ];
    save('shm_worklogs', sessionWorkLogs);

    // Update task actual hours
    const task = sessionTasks.find(t => t.id === active.taskId);
    if (task) {
      const addedHours = Number((durationMinutes / 60).toFixed(2));
      await DataService.updateTask(task.id, { 
        actualHours: Number((task.actualHours + addedHours).toFixed(2)) 
      });
      if (status === 'COMPLETED') {
        await DataService.updateTask(task.id, { 
          status: 'COMPLETED', progress: 100, actualEndDate: new Date().toISOString() 
        });
      } else {
        await DataService.updateTaskStatus(task.id, 'PAUSED');
      }
    }

    return updated;
  },

  calculateDailyProductiveHours: async (employeeId: string, dateStr: string = new Date().toISOString().split('T')[0]) => {
    const logs = sessionWorkLogs.filter(w => w.employeeId === employeeId && w.startTime.startsWith(dateStr));
    const totalMinutes = logs.reduce((sum, log) => {
      if (log.durationMinutes) return sum + log.durationMinutes;
      // if active right now
      if (log.status === 'ACTIVE') {
        return sum + Math.round((Date.now() - new Date(log.startTime).getTime()) / 60000);
      }
      return sum;
    }, 0);
    return Number((totalMinutes / 60).toFixed(2));
  },

  // Time Requests
  getTimeRequests: async () => load<any[]>('shm_timerequests', []),
  getTimeRequestsByEmployeeId: async (employeeId: string) => load<any[]>('shm_timerequests', []).filter(r => r.employeeId === employeeId),
  getTimeRequestsByTaskId: async (taskId: string) => load<any[]>('shm_timerequests', []).filter(r => r.taskId === taskId),
  
  createTimeRequest: async (reqData: any) => {
    let reqs = load<any[]>('shm_timerequests', []);
    const newReq = {
      ...reqData,
      id: `tr-${Date.now()}`,
      requestDate: new Date().toISOString(),
      decision: 'PENDING'
    };
    reqs = [newReq, ...reqs];
    save('shm_timerequests', reqs);
    
    // Also update task status if applicable
    await DataService.updateTaskStatus(reqData.taskId, 'EXTENSION_REQUESTED');
    
    return newReq;
  },

  reviewTimeRequest: async (requestId: string, decision: 'APPROVED' | 'REJECTED', approverId: string, approvedTime?: number, comments?: string) => {
    let reqs = load<any[]>('shm_timerequests', []);
    const idx = reqs.findIndex(r => r.id === requestId);
    if (idx === -1) return null;
    
    reqs[idx] = {
      ...reqs[idx],
      decision,
      decisionDate: new Date().toISOString(),
      approverId,
      approvedAdditionalTime: approvedTime,
      HODComments: comments
    };
    save('shm_timerequests', reqs);
    
    // Revert task status to PAUSED (or IN_PROGRESS if they were working, but PAUSED is safer)
    await DataService.updateTaskStatus(reqs[idx].taskId, 'PAUSED');
    
    return reqs[idx];
  },

  calculateEffectiveDeadline: async (taskId: string) => {
    const task = sessionTasks.find(t => t.id === taskId);
    if (!task) return null;
    
    const reqs = await DataService.getTimeRequestsByTaskId(taskId);
    const approved = reqs.filter(r => r.decision === 'APPROVED');
    
    let baseDate = new Date(task.deadline);
    approved.forEach(req => {
      if (req.requestedTimeType === 'DAYS') {
        baseDate.setDate(baseDate.getDate() + (req.approvedAdditionalTime || 0));
      } else if (req.requestedTimeType === 'HOURS') {
        baseDate.setHours(baseDate.getHours() + (req.approvedAdditionalTime || 0));
      }
    });
    
    return baseDate.toISOString();
  },

  // Rework History
  getReworkHistory: async () => load<any[]>('shm_rework', []),
  getReworkHistoryByBridgeId: async (bridgeId: string) => load<any[]>('shm_rework', []).filter(r => r.bridgeId === bridgeId),
  getReworkHistoryByTaskId: async (taskId: string) => load<any[]>('shm_rework', []).filter(r => r.taskId === taskId),

  createRework: async (reworkData: any) => {
    let reworks = load<any[]>('shm_rework', []);
    // Calculate round number
    const bridgeReworks = reworks.filter(r => r.bridgeId === reworkData.bridgeId);
    
    const newRework = {
      ...reworkData,
      id: `rw-${Date.now()}`,
      initiatedAt: new Date().toISOString(),
      roundNumber: bridgeReworks.length + 1,
      status: 'OPEN'
    };
    reworks = [newRework, ...reworks];
    save('shm_rework', reworks);
    
    // Create an activity
    await DataService.logActivity({
      actorId: reworkData.initiatedBy,
      actorName: 'System',
      action: 'REWORK_INITIATED',
      description: `Rework round ${newRework.roundNumber} initiated. Reason: ${reworkData.reason}`,
      projectId: reworkData.projectId,
      bridgeId: reworkData.bridgeId,
      taskId: reworkData.taskId
    });

    return newRework;
  },
  
  resolveRework: async (reworkId: string) => {
    let reworks = load<any[]>('shm_rework', []);
    const idx = reworks.findIndex(r => r.id === reworkId);
    if (idx === -1) return null;
    
    reworks[idx] = {
      ...reworks[idx],
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    };
    save('shm_rework', reworks);
    return reworks[idx];
  },

  // Documents (Phase 6)
  getDocuments: async () => load<any[]>('shm_documents', []),
  getDocumentById: async (id: string) => load<any[]>('shm_documents', []).find(d => d.id === id),
  getDocumentsByProjectId: async (projectId: string) => load<any[]>('shm_documents', []).filter(d => d.projectId === projectId),
  getDocumentsByBridgeId: async (bridgeId: string) => load<any[]>('shm_documents', []).filter(d => d.bridgeId === bridgeId),
  getDocumentsByWorkflowStageId: async (stageId: string) => load<any[]>('shm_documents', []).filter(d => d.workflowStageId === stageId),
  getDocumentsByTaskId: async (taskId: string) => load<any[]>('shm_documents', []).filter(d => d.taskId === taskId),
  
  createDocument: async (docData: any) => {
    let docs = load<any[]>('shm_documents', []);
    const newDoc = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      version: 1
    };
    docs = [newDoc, ...docs];
    save('shm_documents', docs);

    await DataService.logActivity({
      actorId: docData.uploadedBy,
      actorName: 'System',
      action: 'DOCUMENT_UPLOADED',
      description: `Uploaded document: ${docData.name}`,
      projectId: docData.projectId,
      bridgeId: docData.bridgeId,
      taskId: docData.taskId
    });

    return newDoc;
  },
  
  updateDocument: async (docId: string, updates: any) => {
    let docs = load<any[]>('shm_documents', []);
    const idx = docs.findIndex(d => d.id === docId);
    if (idx > -1) {
      // If uploading new version
      if (updates.newVersion) {
        docs[idx] = { ...docs[idx], ...updates, version: docs[idx].version + 1 };
      } else {
        docs[idx] = { ...docs[idx], ...updates };
      }
      save('shm_documents', docs);
      return docs[idx];
    }
    return null;
  },

  deleteDocument: async (docId: string) => {
    let docs = load<any[]>('shm_documents', []);
    save('shm_documents', docs.filter(d => d.id !== docId));
  },

  // Notifications (Phase 6)
  getNotifications: async (employeeId: string) => load<any[]>('shm_notifications', []).filter(n => n.recipientEmployeeId === employeeId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  getUnreadNotifications: async (employeeId: string) => load<any[]>('shm_notifications', []).filter(n => n.recipientEmployeeId === employeeId && !n.read),
  
  markNotificationRead: async (id: string) => {
    let notifs = load<any[]>('shm_notifications', []);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx > -1) {
      notifs[idx] = { ...notifs[idx], read: true };
      save('shm_notifications', notifs);
    }
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
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifs = [newNotif, ...notifs];
    save('shm_notifications', notifs);
    return newNotif;
  }
};
