import { DataService } from './dataService';

export const AnalyticsService = {
  getOrganizationMetrics: async () => {
    const [projects, bridges, tasks, employees, exts, workLogs] = await Promise.all([
      DataService.getProjects(),
      DataService.getBridges(),
      DataService.getTasks(),
      DataService.getEmployees(),
      DataService.getTimeRequests(),
      DataService.getAllWorkLogs()
    ]);
    
    return {
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'ACTIVE').length,
        completed: projects.filter(p => p.status === 'COMPLETED').length,
        delayed: projects.filter(p => p.status === 'DELAYED').length
      },
      bridges: {
        total: bridges.length,
        active: bridges.filter(b => b.status === 'IN_PROGRESS').length,
        completed: bridges.filter(b => b.status === 'COMPLETED').length,
        delayed: bridges.filter(b => b.status === 'DELAYED').length
      },
      tasks: {
        total: tasks.length,
        active: tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PAUSED').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        overdue: tasks.filter(t => t.status === 'OVERDUE').length,
        blocked: tasks.filter(t => t.status === 'BLOCKED').length,
        rework: tasks.filter(t => t.status === 'REWORK_REQUIRED').length
      },
      employees: {
        total: employees.length,
        working: workLogs.filter(w => w.status === 'ACTIVE').length,
        site: employees.filter(e => e.role === 'TECHNICIAN').length,
        office: employees.filter(e => e.role === 'ENGINEER').length
      },
      extensions: {
        total: exts.length,
        pending: exts.filter(e => e.decision === 'PENDING').length,
        approved: exts.filter(e => e.decision === 'APPROVED').length,
        rejected: exts.filter(e => e.decision === 'REJECTED').length,
        approvalRate: exts.length ? Math.round(exts.filter(e => e.decision === 'APPROVED').length / exts.length * 100) : 0,
        avgTime: parseFloat((exts.filter(e => e.decision === 'APPROVED').reduce((acc, e) => acc + (e.approvedAdditionalTime || 0), 0) / (exts.filter(e => e.decision === 'APPROVED').length || 1)).toFixed(1))
      }
    };
  }
};
