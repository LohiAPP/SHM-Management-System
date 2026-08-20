import { api } from './client';
import type { 
  Project, Bridge, Task, Employee, Team, 
  WorkflowStage, WorkLog, TaskUpdate, 
  ActivityLog, ReworkHistory, TimeRequest, AppNotification 
} from '../../types';

// For list endpoints that return ApiListResponse instead of just data (due to pagination)
// In our client.ts, `data.data` is returned. If `data.data` is an array for getAll (from the generated controllers),
// we don't need to unwrap it if the controller returned `res.json({ success: true, data: data.rows, pagination: ... })`
// Wait, the controller returns `data: data.rows`. So `client.ts` `return data.data` returns the array directly!
// But if we need the pagination, we lose it. For now, we assume the UI expects the array directly (since it used to be mock arrays).

export const ApiDataService = {
  // PROJECTS
  getProjects: async (): Promise<Project[]> => api.get<Project[]>('/projects'),
  getProjectById: async (id: string): Promise<Project> => api.get<Project>('/projects/' + id),
  createProject: async (data: Partial<Project>): Promise<Project> => api.post<Project>('/projects', data),
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => api.put<Project>('/projects/' + id, data),

  // BRIDGES
  getBridges: async (): Promise<Bridge[]> => api.get<Bridge[]>('/bridges'),
  getBridgeById: async (id: string): Promise<Bridge> => api.get<Bridge>('/bridges/' + id),
  getBridgesByProjectId: async (projectId: string): Promise<Bridge[]> => api.get<Bridge[]>('/projects/' + projectId + '/bridges'),

  // WORKFLOW
  getWorkflowStages: async (): Promise<WorkflowStage[]> => api.get<WorkflowStage[]>('/workflow-stages'),
  getBridgeWorkflows: async (bridgeId: string): Promise<any[]> => api.get<any[]>('/bridges/' + bridgeId + '/workflow'), // Assuming BridgeWorkflowStage type

  // TASKS
  getTasks: async (): Promise<Task[]> => api.get<Task[]>('/tasks'),
  getTaskById: async (id: string): Promise<Task> => api.get<Task>('/tasks/' + id),
  getTasksByBridgeId: async (bridgeId: string): Promise<Task[]> => api.get<Task[]>('/tasks?bridge=' + bridgeId),
  getTasksByEmployeeId: async (employeeId: string): Promise<Task[]> => api.get<Task[]>('/employees/' + employeeId + '/tasks'),
  createTask: async (data: Partial<Task>): Promise<Task> => api.post<Task>('/tasks', data),
  updateTaskProgress: async (taskId: string, progress: number): Promise<Task> => api.post<Task>('/tasks/' + taskId + '/progress', { progress }),

  // TASK ASSIGNMENT
  assignTask: async (taskId: string, employeeId: string): Promise<void> => api.post<void>('/tasks/' + taskId + '/employees', { employeeId }),
  
  // LIFECYCLE
  startWorkSession: async (employeeId: string, taskId: string): Promise<WorkLog> => api.post<WorkLog>('/work-logs/start', { employeeId, taskId }),
  pauseWorkSession: async (employeeId: string, status: string, summary?: string): Promise<WorkLog> => {
    if (status === 'COMPLETED') return api.post<WorkLog>('/work-logs/finish', { employeeId, summary });
    return api.post<WorkLog>('/work-logs/pause', { employeeId });
  },

  getActiveWorkSession: async (employeeId: string): Promise<WorkLog | null> => {
    const logs = await api.get<WorkLog[]>('/employees/' + employeeId + '/work-logs?active=true');
    return logs.length ? logs[0] : null;
  },
  getWorkLogsByTask: async (taskId: string): Promise<WorkLog[]> => api.get<WorkLog[]>('/tasks/' + taskId + '/work-logs'),

  // UPDATES
  addTaskUpdate: async (data: Partial<TaskUpdate>): Promise<TaskUpdate> => api.post<TaskUpdate>('/tasks/' + data.taskId + '/updates', data),
  getTaskUpdates: async (taskId: string): Promise<TaskUpdate[]> => api.get<TaskUpdate[]>('/tasks/' + taskId + '/updates'),
  addTaskAttachment: async (data: any): Promise<any> => api.post<any>('/documents', data),

  // EMPLOYEES & TEAMS
  getEmployees: async (): Promise<Employee[]> => api.get<Employee[]>('/employees'),
  getEmployeeById: async (id: string): Promise<Employee> => api.get<Employee>('/employees/' + id),
  getTeams: async (): Promise<Team[]> => api.get<Team[]>('/teams'),

  // EXTENSIONS
  getTimeRequests: async (): Promise<TimeRequest[]> => api.get<TimeRequest[]>('/extension-requests'),
  getTimeRequestsByEmployeeId: async (employeeId: string): Promise<TimeRequest[]> => api.get<TimeRequest[]>('/extension-requests?employee=' + employeeId),
  getTimeRequestsByTaskId: async (taskId: string): Promise<TimeRequest[]> => api.get<TimeRequest[]>('/extension-requests?task=' + taskId),
  createTimeRequest: async (data: Partial<TimeRequest>): Promise<TimeRequest> => api.post<TimeRequest>('/extension-requests', data),
  reviewTimeRequest: async (id: string, decision: string, approverId: string, value: number, comments: string): Promise<TimeRequest> => {
    if (decision === 'APPROVED') return api.post<TimeRequest>('/extension-requests/' + id + '/approve', { approverId, value, comments });
    return api.post<TimeRequest>('/extension-requests/' + id + '/reject', { approverId, comments });
  },
  calculateEffectiveDeadline: async (taskId: string): Promise<string> => api.get<string>('/tasks/' + taskId + '/deadline'),

  // REWORK
  createRework: async (data: Partial<ReworkHistory>): Promise<ReworkHistory> => api.post<ReworkHistory>('/tasks/' + data.taskId + '/rework', data),
  getReworkHistory: async (): Promise<ReworkHistory[]> => api.get<ReworkHistory[]>('/rework-history'),
  getReworkHistoryByBridgeId: async (bridgeId: string): Promise<ReworkHistory[]> => api.get<ReworkHistory[]>('/rework-history?bridge=' + bridgeId),

  // DOCUMENTS
  getDocumentsByTaskId: async (taskId: string): Promise<any[]> => api.get<any[]>('/documents?task=' + taskId),
  addDocument: async (data: any): Promise<any> => api.post<any>('/documents', data),
  createDocument: async (data: any): Promise<any> => api.post<any>('/documents', data),
  deleteDocument: async (id: string): Promise<any> => api.delete<any>('/documents/' + id),

  // NOTIFICATIONS
  getNotifications: async (employeeId: string): Promise<AppNotification[]> => api.get<AppNotification[]>('/notifications?employee=' + employeeId),
  getUnreadNotifications: async (employeeId: string): Promise<AppNotification[]> => {
    const all = await api.get<AppNotification[]>('/notifications?employee=' + employeeId);
    return all.filter((n: any) => !n.read);
  },
  markNotificationRead: async (id: string): Promise<AppNotification> => api.patch<AppNotification>('/notifications/' + id + '/read'),
  markAllNotificationsRead: async (employeeId: string): Promise<void> => api.patch<void>('/notifications/read-all', { employeeId }),

  // ACTIVITY LOG
  getActivities: async (): Promise<ActivityLog[]> => api.get<ActivityLog[]>('/activity-logs'),
  getActivitiesByProjectId: async (projectId: string): Promise<ActivityLog[]> => api.get<ActivityLog[]>('/activity-logs?project=' + projectId),
  getActivitiesByTaskId: async (taskId: string): Promise<ActivityLog[]> => api.get<ActivityLog[]>('/activity-logs?task=' + taskId),
  getActivitiesByEmployeeId: async (employeeId: string): Promise<ActivityLog[]> => api.get<ActivityLog[]>('/activity-logs?employee=' + employeeId),
  logActivity: async (data: Partial<ActivityLog>): Promise<ActivityLog> => api.post<ActivityLog>('/activity-logs', data),

  // ANALYTICS MOCKS / EXTRA
  getAllWorkLogs: async (): Promise<WorkLog[]> => api.get<WorkLog[]>('/work-logs'),
  getWorkLogs: async (employeeId?: string): Promise<WorkLog[]> => {
    if (employeeId) return api.get<WorkLog[]>('/employees/' + employeeId + '/work-logs');
    return api.get<WorkLog[]>('/work-logs');
  },
  calculateDailyProductiveHours: async (_employeeId: string): Promise<number> => Promise.resolve(8)
};
