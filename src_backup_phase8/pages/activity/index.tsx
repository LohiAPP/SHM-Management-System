import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { ActivityLog, Employee, WorkLog, Task } from '../../types';
import { Clock, CheckCircle2, Calendar, LayoutGrid, FileText } from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [productiveHours, setProductiveHours] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      let aList: ActivityLog[] = [];
      if (employeeId) {
        const emp = await DataService.getEmployeeById(employeeId);
        if (emp) setEmployee(emp);
        aList = await DataService.getActivitiesByEmployeeId(employeeId);
        
        const wLogs = await DataService.getWorkLogs(employeeId);
        setWorkLogs(wLogs);
        
        const ph = await DataService.calculateDailyProductiveHours(employeeId);
        setProductiveHours(ph);
        
        const t = await DataService.getTasksByEmployeeId(employeeId);
        setTasks(t);
      } else {
        aList = await DataService.getActivities();
      }
      setActivities(aList);
    };
    loadData();
  }, [employeeId]);

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{employee ? `${employee.name}'s Activity` : 'Global Activity Log'}</h1>
        <p className="text-slate-500 text-sm mt-1">{employee ? 'Personal work history and session logs.' : 'System-wide chronological activity.'}</p>
      </div>

      {employee && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <Clock className="text-indigo-500 mb-2" size={24} />
            <div className="text-3xl font-bold text-slate-900 mb-1">{productiveHours}h</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Productive Today</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <LayoutGrid className="text-blue-500 mb-2" size={24} />
            <div className="text-3xl font-bold text-slate-900 mb-1">{tasks.length}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
            <div className="text-3xl font-bold text-slate-900 mb-1">{completedTasks}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Tasks</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <FileText className="text-amber-500 mb-2" size={24} />
            <div className="text-3xl font-bold text-slate-900 mb-1">{workLogs.length}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Work Sessions</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Calendar size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-800">Chronological Timeline</h3>
        </div>

        <div className="space-y-6 relative pl-4">
          <div className="absolute left-[7.5px] top-2 bottom-0 w-px bg-slate-200"></div>
          
          {activities.length > 0 ? activities.map(act => (
            <div key={act.id} className="relative pl-6">
              <div className={`absolute -left-2 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                act.action.includes('COMPLETED') ? 'bg-emerald-500' :
                act.action.includes('STARTED') ? 'bg-indigo-500' :
                act.action.includes('PAUSED') ? 'bg-amber-500' : 'bg-blue-400'
              }`}></div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">{act.actorName}</span>
                <span className="text-xs text-slate-500">{new Date(act.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">{act.action.replace(/_/g, ' ')}:</span> {act.description}
              </div>
            </div>
          )) : (
            <div className="text-slate-500 text-sm italic py-4">No activity logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
