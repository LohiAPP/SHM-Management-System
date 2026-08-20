import React, { useEffect, useState, useRef } from 'react';
import type { DemoTask, DemoWorkLog } from './types';
import { DemoDataService } from './DemoDataService';
import { Play, Pause, CheckCircle2, Clock, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../contexts/AuthContext';

export const DemoActiveTask: React.FC = () => {
  const { currentEmployeeId } = useRole();
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [activeSession, setActiveSession] = useState<DemoWorkLog | null>(null);
  const [employee, setEmployee] = useState<any>(null);

  // Local timer state for presentation flexibility
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTicking, setIsTicking] = useState(false);
  const timerRef = useRef<any>(null);

  const [showDelayForm, setShowDelayForm] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const { currentUser } = useAuth();

  const rawId = currentUser?.employeeId || currentEmployeeId;
  const activeId = ['emp-1', 'admin', 'manager', 'EMP-MOCK-ADMIN', 'EMP-MOCK-HOD_MANAGER'].includes(rawId) ? 'emp-s1' : rawId;

  const load = async () => {
    if (!activeId) return;
    const emp = await DemoDataService.getEmployeeById(activeId);
    setEmployee(emp);
    const t = await DemoDataService.getTasksByEmployeeId(activeId);
    setTasks(t);
    const session = await DemoDataService.getActiveWorkSession(activeId);
    setActiveSession(session);
    
    // Auto-start ticking if there's a backend session
    if (session) {
      if (!isTicking) {
        setIsTicking(true);
      }
    } else {
      setIsTicking(false);
    }
  };

  useEffect(() => { load(); }, [activeId]);

  // Tick the local timer
  useEffect(() => {
    if (isTicking) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTicking]);

  // Format timer
  const h = Math.floor(timerSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((timerSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  const formattedTime = `${h}:${m}:${s}`;

  const handleStart = async (taskId: string) => {
    if (!activeId) return;
    await DemoDataService.startWorkSession(activeId, taskId);
    setIsTicking(true);
    await load();
  };

  const handlePause = async () => {
    if (!activeId) return;
    setIsTicking(false);
    await DemoDataService.pauseWorkSession(activeId);
    await load();
  };
  
  const handleReset = () => {
    setIsTicking(false);
    setTimerSeconds(0);
    if (activeId) {
       DemoDataService.pauseWorkSession(activeId);
       load();
    }
  };

  const handleCompleteClick = async (taskId: string) => {
    setIsTicking(false);
    if (activeSession) {
      await DemoDataService.pauseWorkSession(activeId);
    }
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    
    // Check if late based on current time
    const isLate = new Date() > new Date(t.deadline);
    if (isLate) {
      setCompletingTaskId(taskId);
      setShowDelayForm(true);
    } else {
      await DemoDataService.completeTask(taskId);
      alert('Task completed successfully. No delay review required.');
      await load();
    }
  };

  const submitDelay = async () => {
    if (!activeId || !completingTaskId) return;
    if (!delayReason.trim()) {
      alert('Please explain why this task was delayed.');
      return;
    }
    await DemoDataService.completeTask(completingTaskId);
    await DemoDataService.submitDelayReason(completingTaskId, activeId, delayReason);
    alert('Task completed after the assigned deadline.\\nDelay reason submitted for Manager/HOD review.');
    setShowDelayForm(false);
    setDelayReason('');
    await load();
  };

  if (!employee) return null;

  // Find any task that is in progress, or use the active session's task
  const activeTask = tasks.find(t => t.status === 'IN_PROGRESS') || (activeSession ? tasks.find(t => t.id === activeSession.taskId) : null);
  // Pending tasks are ASSIGNED tasks (not in progress)
  const pendingTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const isSite = employee.employeeType === 'SITE';

  return (
    <div className="mb-8 space-y-6">
      {activeTask && (
        <div className="bg-indigo-600 rounded-2xl shadow-xl overflow-hidden text-white relative">
          <div className="absolute top-4 right-4 bg-indigo-800/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
            {isSite ? 'SITE WORK' : 'OFFICE WORK'}
          </div>
          <div className="p-8">
            <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">Current Active Task</h3>
            <h2 className="text-3xl font-extrabold mb-2">{activeTask.title}</h2>
            <p className="text-indigo-200 mb-6">{activeTask.bridgeName}</p>
            
            <div className="flex items-center gap-12 mb-8">
              <div>
                <div className="text-indigo-200 text-xs uppercase mb-1">Progress</div>
                <div className="text-2xl font-bold">{activeTask.progress}% COMPLETE</div>
              </div>
              <div>
                <div className="text-indigo-200 text-xs uppercase mb-1">Session Timer</div>
                <div className="text-4xl font-mono tracking-wider font-bold text-emerald-400">{formattedTime}</div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              {isTicking ? (
                <button onClick={handlePause} className="bg-amber-500 hover:bg-amber-400 text-white py-3 px-8 rounded-xl font-bold transition-colors flex items-center gap-2 text-lg">
                  <Pause size={24} /> PAUSE TIMER
                </button>
              ) : (
                <button onClick={() => handleStart(activeTask.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-8 rounded-xl font-bold transition-colors flex items-center gap-2 text-lg">
                  <Play size={24} /> START TIMER
                </button>
              )}
              
              <button onClick={handleReset} className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-xl font-bold transition-colors flex items-center gap-2 text-lg">
                <RotateCcw size={24} /> RESET
              </button>

              <button onClick={() => handleCompleteClick(activeTask.id)} className="ml-auto bg-blue-500 hover:bg-blue-400 text-white py-3 px-8 rounded-xl font-bold transition-colors flex items-center gap-2 text-lg shadow-lg">
                <CheckCircle2 size={24} /> {isSite ? 'COMPLETE WORK' : 'FINISH WORK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelayForm && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle /> Task Delayed
          </h3>
          <p className="text-red-700 mb-4">Please explain why this task was delayed. Your reason will be reviewed by your Manager/HOD.</p>
          <textarea
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            className="w-full border-2 border-red-200 rounded-lg p-3 mb-4 focus:outline-none focus:border-red-400"
            rows={3}
            placeholder="I was delayed because..."
          />
          <div className="flex gap-3">
            <button onClick={submitDelay} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
              <Check size={18} /> Submit Reason
            </button>
            <button onClick={() => setShowDelayForm(false)} className="text-slate-600 hover:bg-slate-100 px-6 py-2 rounded-lg font-bold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!activeTask && pendingTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Ready to Start</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingTasks.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">{t.title}</h4>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                    <span>{t.bridgeName}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> Assigned: {t.expectedHours}h</span>
                    <span className="text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded">Deadline: {new Date(t.deadline).toLocaleTimeString()}</span>
                  </div>
                </div>
                <button onClick={() => handleStart(t.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  <Play size={18} /> START WORK
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!activeTask && !showDelayForm && pendingTasks.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold text-emerald-800 mb-2">All Caught Up!</h3>
          <p className="text-emerald-600 font-medium">You have completed all your assigned tasks for today.</p>
        </div>
      )}
    </div>
  );
};
