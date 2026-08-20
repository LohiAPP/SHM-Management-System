import React, { useEffect, useState } from 'react';
import { DemoDataService, DemoPerformanceService } from './DemoDataService';
import type { DemoEmployee, DemoPerformanceRecord, DemoWorkLog, DemoTask } from './types';
import { HardHat, Building, UserCog, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../context/RoleContext';

const TimerDisplay: React.FC<{ startedAt: string }> = ({ startedAt }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return <span className="font-mono text-indigo-700 font-bold">{elapsed}</span>;
};

export const DemoEmployeePanel: React.FC = () => {
  const [employees, setEmployees] = useState<DemoEmployee[]>([]);
  const [performance, setPerformance] = useState<Record<string, DemoPerformanceRecord>>({});
  const [activeSessions, setActiveSessions] = useState<Record<string, { log: DemoWorkLog, task: DemoTask }>>({});
  const { currentUser } = useAuth();
  const { role } = useRole();

  const load = async () => {
    const emps = await DemoDataService.getEmployees();
    setEmployees(emps);
    
    const perf: Record<string, DemoPerformanceRecord> = {};
    const sessions: Record<string, { log: DemoWorkLog, task: DemoTask }> = {};
    
    for (const emp of emps) {
      perf[emp.id] = await DemoPerformanceService.getPerformanceRecord(emp.id);
      
      const log = await DemoDataService.getActiveWorkSession(emp.id);
      if (log) {
        const t = await DemoDataService.getTaskById(log.taskId);
        if (t) sessions[emp.id] = { log, task: t };
      }
    }
    setPerformance(perf);
    setActiveSessions(sessions);
  };

  useEffect(() => { load(); }, []);

  // Filter to show only if current user is ADMIN or MANAGER
  if (currentUser?.role === 'EMPLOYEE' || role === 'EMPLOYEE' || role === 'ENGINEER' || role === 'TECHNICIAN') return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <UserCog className="text-indigo-600" /> Employee Classification & Performance Panel
        </h2>
        <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Admin / HOD View
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map(e => {
          const p = performance[e.id];
          const isSite = e.employeeType === 'SITE';
          const session = activeSessions[e.id];
          
          return (
            <div key={e.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{e.displayName}</h3>
                  <div className="text-sm text-slate-500">{e.employeeId} • {e.team}</div>
                </div>
                <div className={isSite ? 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700' : 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-700'}>
                  {isSite ? <HardHat size={14}/> : <Building size={14}/>}
                  {e.employeeType}
                </div>
              </div>
              
              {session ? (
                <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1">
                      <Clock size={12} /> Active Task
                    </span>
                    <TimerDisplay startedAt={session.log.startedAt} />
                  </div>
                  <div className="text-sm font-semibold text-slate-800 truncate">{session.task.title}</div>
                  <div className="text-xs text-slate-500 truncate">{session.task.bridgeName}</div>
                </div>
              ) : (
                <div className="mb-4 bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-center text-slate-400 text-xs uppercase font-bold tracking-wider">
                  No Active Task
                </div>
              )}
              
              {p && (
                <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-700 text-lg">{p.totalTasks}</div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px]">Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600 text-lg">{p.onTimeTasks}</div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px]">On-Time</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-500 text-lg">{p.delayedTasks}</div>
                    <div className="text-slate-500 uppercase font-semibold text-[10px]">Delayed</div>
                  </div>
                  <div className={p.negativePoints < 0 ? 'bg-red-100 rounded text-red-700' : ''}>
                    <div className="font-bold text-lg">{p.negativePoints}</div>
                    <div className="uppercase font-semibold text-[10px]">Impact</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
