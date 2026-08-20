import { initialDemoEmployees, initialDemoTasks, initialDemoWorkLogs, initialDemoReviews } from './data';
import type { DemoEmployee, DemoTask, DemoWorkLog, DemoDelayReview, DemoPerformanceRecord } from './types';

// Browser persistence helper specific to demo
const load = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem('kdm_demo_accountability_' + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, data: any) => {
  try {
    localStorage.setItem('kdm_demo_accountability_' + key, JSON.stringify(data));
  } catch {}
};

export const DemoDataService = {
  resetDemoData: () => {
    save('employees', initialDemoEmployees);
    save('tasks', initialDemoTasks);
    save('worklogs', initialDemoWorkLogs);
    save('reviews', initialDemoReviews);
    window.location.reload();
  },
  
  initializeDataIfMissing: () => {
    if (!localStorage.getItem('kdm_demo_accountability_employees')) {
      save('employees', initialDemoEmployees);
      save('tasks', initialDemoTasks);
      save('worklogs', initialDemoWorkLogs);
      save('reviews', initialDemoReviews);
    }
  },

  getEmployees: async (): Promise<DemoEmployee[]> => load('employees', initialDemoEmployees),
  
  getEmployeeById: async (id: string): Promise<DemoEmployee | null> => {
    const employees = load<DemoEmployee[]>('employees', initialDemoEmployees);
    return employees.find(e => e.id === id || e.employeeId === id) || null;
  },

  getTasks: async (): Promise<DemoTask[]> => load('tasks', initialDemoTasks),

  getTasksByEmployeeId: async (employeeId: string): Promise<DemoTask[]> => {
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    return tasks.filter(t => t.employeeId === employeeId);
  },

  getTaskById: async (taskId: string): Promise<DemoTask | null> => {
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    return tasks.find(t => t.id === taskId) || null;
  },

  assignTask: async (task: Partial<DemoTask>): Promise<DemoTask> => {
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    const newTask: DemoTask = {
      ...task,
      id: 'dt-new-' + Date.now(),
      status: 'ASSIGNED',
      progress: 0,
      completedAt: null
    } as DemoTask;
    save('tasks', [newTask, ...tasks]);
    return newTask;
  },

  startWorkSession: async (employeeId: string, taskId: string): Promise<DemoWorkLog> => {
    const logs = load<DemoWorkLog[]>('worklogs', initialDemoWorkLogs);
    if (logs.find(l => l.employeeId === employeeId && !l.endedAt)) {
      throw new Error('Another task is already active.');
    }
    const newLog: DemoWorkLog = {
      id: 'dwl-new-' + Date.now(),
      taskId,
      employeeId,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSeconds: 0
    };
    save('worklogs', [newLog, ...logs]);
    
    // Update task status
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS' as const } : t);
    save('tasks', updatedTasks);

    return newLog;
  },

  pauseWorkSession: async (employeeId: string): Promise<void> => {
    const logs = load<DemoWorkLog[]>('worklogs', initialDemoWorkLogs);
    const active = logs.find(l => l.employeeId === employeeId && !l.endedAt);
    if (active) {
      const endedAt = new Date();
      active.endedAt = endedAt.toISOString();
      active.durationSeconds = Math.floor((endedAt.getTime() - new Date(active.startedAt).getTime()) / 1000);
      save('worklogs', logs);
    }
  },

  getActiveWorkSession: async (employeeId: string): Promise<DemoWorkLog | null> => {
    const logs = load<DemoWorkLog[]>('worklogs', initialDemoWorkLogs);
    return logs.find(l => l.employeeId === employeeId && !l.endedAt) || null;
  },

  getWorkLogsByTask: async (taskId: string): Promise<DemoWorkLog[]> => {
    const logs = load<DemoWorkLog[]>('worklogs', initialDemoWorkLogs);
    return logs.filter(l => l.taskId === taskId);
  },

  completeTask: async (taskId: string): Promise<{ success: boolean, late: boolean }> => {
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const completedAt = new Date().toISOString();
    const isLate = new Date(completedAt) > new Date(task.deadline);
    
    task.completedAt = completedAt;
    task.status = isLate ? 'DELAYED' : 'COMPLETED';
    task.progress = 100;

    save('tasks', tasks);
    return { success: true, late: isLate };
  },

  submitDelayReason: async (taskId: string, employeeId: string, reason: string): Promise<DemoDelayReview> => {
    const reviews = load<DemoDelayReview[]>('reviews', initialDemoReviews);
    const newReview: DemoDelayReview = {
      id: 'ddr-' + Date.now(),
      taskId,
      employeeId,
      reason,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
      reviewedBy: null,
      reviewedAt: null,
      managerComment: null,
      performanceImpact: 'NONE',
      negativePoints: 0
    };
    save('reviews', [newReview, ...reviews]);

    // Update task status
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'DELAY_REVIEW_PENDING' as const } : t);
    save('tasks', updatedTasks);

    return newReview;
  },

  getPendingReviews: async (): Promise<DemoDelayReview[]> => {
    const reviews = load<DemoDelayReview[]>('reviews', initialDemoReviews);
    return reviews.filter(r => r.status === 'PENDING');
  },

  getReviewsByEmployeeId: async (employeeId: string): Promise<DemoDelayReview[]> => {
    const reviews = load<DemoDelayReview[]>('reviews', initialDemoReviews);
    return reviews.filter(r => r.employeeId === employeeId);
  },

  reviewDelayReason: async (reviewId: string, decision: 'ACCEPTED' | 'REJECTED', managerId: string, comment: string): Promise<void> => {
    const reviews = load<DemoDelayReview[]>('reviews', initialDemoReviews);
    const review = reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    review.status = decision;
    review.reviewedBy = managerId;
    review.reviewedAt = new Date().toISOString();
    review.managerComment = comment;
    
    if (decision === 'REJECTED') {
      review.performanceImpact = 'NEGATIVE';
      review.negativePoints = -1;
    }

    save('reviews', reviews);

    // Update task status
    const tasks = load<DemoTask[]>('tasks', initialDemoTasks);
    const updatedTasks = tasks.map(t => t.id === review.taskId ? { ...t, status: decision === 'ACCEPTED' ? 'DELAY_ACCEPTED' as const : 'DELAY_REJECTED' as const } : t);
    save('tasks', updatedTasks);
  }
};

export const DemoPerformanceService = {
  getPerformanceRecord: async (employeeId: string): Promise<DemoPerformanceRecord> => {
    const tasks = await DemoDataService.getTasksByEmployeeId(employeeId);
    const reviews = await DemoDataService.getReviewsByEmployeeId(employeeId);

    const completed = tasks.filter(t => t.completedAt);
    const onTime = completed.filter(t => new Date(t.completedAt!) <= new Date(t.deadline));
    const delayed = completed.filter(t => new Date(t.completedAt!) > new Date(t.deadline));

    const accepted = reviews.filter(r => r.status === 'ACCEPTED');
    const rejected = reviews.filter(r => r.status === 'REJECTED');

    const points = rejected.reduce((acc, r) => acc + r.negativePoints, 0);

    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      onTimeTasks: onTime.length,
      delayedTasks: delayed.length,
      acceptedDelays: accepted.length,
      rejectedDelays: rejected.length,
      negativePoints: points
    };
  }
};

DemoDataService.initializeDataIfMissing();
