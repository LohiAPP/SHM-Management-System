import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import { useRole } from '../../context/RoleContext';
import type { Task, Project, Bridge, WorkLog, TimeRequest, ReworkHistory } from '../../types';
import { Play, Pause, CheckCircle2, AlertCircle, Clock, Briefcase, RotateCcw } from 'lucide-react';
import { useDemo } from '../../demo/DemoProvider';
import { DemoPerformanceSummary } from '../../demo/DemoPerformanceSummary';
import { DemoActiveTask } from '../../demo/DemoActiveTask';
import { DemoEmployeeFeedback } from '../../demo/DemoEmployeeFeedback';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentEmployeeId } = useRole();
  const { isDemoMode } = useDemo();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [bridges, setBridges] = useState<Record<string, Bridge>>({});
  const [activeSession, setActiveSession] = useState<WorkLog | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeRequests, setTimeRequests] = useState<TimeRequest[]>([]);
  const [reworkHistory, setReworkHistory] = useState<ReworkHistory[]>([]);

  // Live timer for active session
  const [elapsedString, setElapsedString] = useState('00:00:00');

  const loadData = async () => {
    if (!currentEmployeeId) return;
    const [t, pList, bList, session, tReqs, rHist] = await Promise.all([
      DataService.getTasksByEmployeeId(currentEmployeeId),
      DataService.getProjects(),
      DataService.getBridges(),
      DataService.getActiveWorkSession(currentEmployeeId),
      DataService.getTimeRequestsByEmployeeId(currentEmployeeId),
      DataService.getReworkHistory()
    ]);
    
    setTasks(t);
    setProjects(pList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}));
    setBridges(bList.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
    setActiveSession(session || null);
    setTimeRequests(tReqs.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
    
    // Rework Tasks (Tasks assigned to me that are in a workflow stage currently requiring rework)
    const activeReworks = rHist.filter(r => r.status !== 'RESOLVED');
    setReworkHistory(activeReworks);
    if (session) {
      const activeT = t.find(task => task.id === session.taskId);
      setActiveTask(activeT || null);
    } else {
      setActiveTask(null);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmployeeId]);

  useEffect(() => {
    if (!activeSession) {
      setElapsedString('00:00:00');
      return;
    }
    const interval = setInterval(() => {
      const start = new Date(activeSession.startTime).getTime();
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedString(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartTask = async (taskId: string) => {
    try {
      await DataService.startWorkSession(currentEmployeeId, taskId);
      await DataService.logActivity({
        actorId: currentEmployeeId, actorName: 'Employee', action: 'STARTED_WORK_SESSION',
        description: 'Started active work session',
        taskId
      });
      loadData();
    } catch (e: any) {
      if (e.message === 'MULTIPLE_ACTIVE_TASKS') {
        alert('You already have an active task. Please pause or finish it before starting a new one.');
      }
    }
  };

  const handlePause = async () => {
    if (!activeSession) return;
    await DataService.pauseWorkSession(currentEmployeeId, 'PAUSED');
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: 'Employee', action: 'PAUSED_WORK_SESSION',
      description: 'Paused work session',
      taskId: activeSession.taskId
    });
    loadData();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeTaskIds = [activeTask?.id].filter(Boolean);
  
  const todayTasks = tasks.filter(t => !activeTaskIds.includes(t.id) && t.status !== 'COMPLETED' && t.deadline.startsWith(todayStr));
  const upcomingTasks = tasks.filter(t => !activeTaskIds.includes(t.id) && t.status !== 'COMPLETED' && !t.deadline.startsWith(todayStr) && new Date(t.deadline) > new Date());
  const overdueTasks = tasks.filter(t => !activeTaskIds.includes(t.id) && t.status !== 'COMPLETED' && new Date(t.deadline) < new Date() && !t.deadline.startsWith(todayStr));
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  
  // Find which tasks are part of an active rework
  const reworkTasks = tasks.filter(t => 
    reworkHistory.some(r => r.workflowStageId === t.workflowStageId || r.taskId === t.id)
  );

  const renderTaskCard = (task: Task) => (
    <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-900 truncate pr-4">{task.title}</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
        }`}>{task.priority}</span>
      </div>
      <div className="text-xs text-slate-500 mb-3 line-clamp-1">
        {projects[task.projectId]?.projectCode} / {bridges[task.bridgeId]?.name}
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <div className="flex gap-3">
          <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">{task.workMode}</span>
          <span className="text-xs text-slate-600 font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{task.progress}%</span>
        </div>
        {task.status !== 'COMPLETED' && (
          <button onClick={(e) => { e.stopPropagation(); handleStartTask(task.id); }} className="text-indigo-600 hover:text-indigo-800 p-1">
            <Play size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {isDemoMode && <DemoPerformanceSummary />}
      {isDemoMode && <DemoActiveTask />}
      {isDemoMode && <DemoEmployeeFeedback />}
      
      <div className={isDemoMode ? 'hidden' : 'block space-y-6'}>
          <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your active work and assignments.</p>
        </div>
        <button onClick={() => navigate(`/employees/${currentEmployeeId}/activity`)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
          <Clock size={16} /> My Activity
        </button>
      </div>

      {/* Weekly Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Weekly Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase">Productive Hours</div>
            <div className="text-2xl font-bold text-indigo-600">
              {tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0).toFixed(1)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase">Tasks Completed</div>
            <div className="text-2xl font-bold text-emerald-600">{completedTasks.length}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase">Avg Task Progress</div>
            <div className="text-2xl font-bold text-slate-800">
              {tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0}%
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase">Extensions Req</div>
            <div className="text-2xl font-bold text-amber-600">{timeRequests.length}</div>
          </div>
        </div>
      </div>

      {/* Active Work Section */}
      <div className="bg-indigo-900 rounded-xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
          <Briefcase size={200} />
        </div>
        <h2 className="text-indigo-200 font-semibold uppercase tracking-wider text-sm mb-4">Current Active Task</h2>
        
        {activeTask && activeSession ? (
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
            <div>
              <div className="flex gap-2 mb-2">
                <span className="bg-indigo-800 text-indigo-100 text-xs px-2 py-0.5 rounded border border-indigo-700">{activeTask.workMode}</span>
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-medium">IN PROGRESS</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 cursor-pointer hover:underline" onClick={() => navigate(`/tasks/${activeTask.id}`)}>{activeTask.title}</h3>
              <div className="text-indigo-200 text-sm">
                {projects[activeTask.projectId]?.projectCode} â€” {bridges[activeTask.bridgeId]?.name}
              </div>
            </div>
            
            <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50 flex flex-col items-center min-w-[200px]">
              <div className="text-xs text-indigo-300 font-medium uppercase tracking-widest mb-1">Session Duration</div>
              <div className="text-3xl font-mono font-bold text-white mb-4 tracking-tight">{elapsedString}</div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full">
                  <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded font-medium text-xs transition-colors">
                    <Pause size={14} /> Pause
                  </button>
                  <button onClick={() => navigate(`/tasks/${activeTask.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded font-medium text-xs transition-colors">
                    <CheckCircle2 size={14} /> Finish
                  </button>
                </div>
                <button onClick={() => navigate(`/tasks/${activeTask.id}`)} className="w-full flex items-center justify-center bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded font-medium text-xs border border-indigo-500 transition-colors">
                  Add Work Update
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-indigo-200 relative z-10">
            <Clock size={40} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">No active task</p>
            <p className="text-sm opacity-80 mt-1">Select a task below and press Start Work to begin tracking.</p>
          </div>
        )}
      </div>
            {activeTask && activeSession ? (
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-indigo-800 text-indigo-100 text-xs px-2 py-0.5 rounded border border-indigo-700">{activeTask.workMode}</span>
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded font-medium">IN PROGRESS</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1 cursor-pointer hover:underline" onClick={() => navigate(`/tasks/${activeTask.id}`)}>{activeTask.title}</h3>
                  <div className="text-indigo-200 text-sm">
                    {projects[activeTask.projectId]?.projectCode} â€” {bridges[activeTask.bridgeId]?.name}
                  </div>
                </div>
                
                <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50 flex flex-col items-center min-w-[200px]">
                  <div className="text-xs text-indigo-300 font-medium uppercase tracking-widest mb-1">Session Duration</div>
                  <div className="text-3xl font-mono font-bold text-white mb-4 tracking-tight">{elapsedString}</div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2 w-full">
                      <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded font-medium text-xs transition-colors">
                        <Pause size={14} /> Pause
                      </button>
                      <button onClick={() => navigate(`/tasks/${activeTask.id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded font-medium text-xs transition-colors">
                        <CheckCircle2 size={14} /> Finish
                      </button>
                    </div>
                    <button onClick={() => navigate(`/tasks/${activeTask.id}`)} className="w-full flex items-center justify-center bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-2 rounded font-medium text-xs border border-indigo-500 transition-colors">
                      Add Work Update
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-indigo-200 relative z-10">
                <Clock size={40} className="mb-3 opacity-50" />
                <p className="text-lg font-medium">No active task</p>
                <p className="text-sm opacity-80 mt-1">Select a task below and press Start Work to begin tracking.</p>
              </div>
            )}
          </div>

      {/* Task Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Rework Tasks */}
          {reworkTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <RotateCcw className="text-red-600" size={20} /> Tasks Requiring Rework
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {reworkTasks.map(t => {
                  const rw = reworkHistory.find(r => r.workflowStageId === t.workflowStageId || r.taskId === t.id);
                  return (
                    <div key={t.id} className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm cursor-pointer hover:border-red-300" onClick={() => navigate(`/tasks/${t.id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900 truncate pr-4">{t.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-100 text-red-700">REWORK</span>
                      </div>
                      <div className="text-xs text-slate-600 mb-2 font-medium">Reason: {rw?.reason}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{projects[t.projectId]?.projectCode} / {bridges[t.bridgeId]?.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
                <AlertCircle size={20} /> Overdue Tasks
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {overdueTasks.map(renderTaskCard)}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
              <span>Today's Tasks</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{todayTasks.length}</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {todayTasks.length > 0 ? todayTasks.map(renderTaskCard) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-500">
                  No tasks due today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming & Completed & Extensions */}
        <div className="space-y-6">
          
          {/* Extension Requests */}
          {timeRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Clock className="text-indigo-600" size={20} /> My Extension Requests
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {timeRequests.map(req => (
                  <div key={req.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm text-sm" onClick={() => navigate(`/tasks/${req.taskId}`)}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-slate-900 truncate pr-2">{tasks.find(t => t.id === req.taskId)?.title || 'Task'}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        req.decision === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{req.decision}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-slate-500">Requested: +{req.requestedAdditionalTime} {req.requestedTimeType}</span>
                      {req.decision === 'APPROVED' && <span className="font-bold text-indigo-600">Approved: {req.approvedAdditionalTime} {req.requestedTimeType}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
              <span>Upcoming Tasks</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{upcomingTasks.length}</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {upcomingTasks.length > 0 ? upcomingTasks.map(renderTaskCard) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-500">
                  No upcoming assigned tasks.
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
              <span>Recently Completed</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 opacity-75">
              {completedTasks.slice(0, 3).map(renderTaskCard)}
              {completedTasks.length === 0 && (
                <div className="text-sm text-slate-500 italic">No completed tasks yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
