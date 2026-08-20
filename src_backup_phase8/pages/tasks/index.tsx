import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { Task, Project, Bridge, Team, Employee } from '../../types';
import { Search, Plus, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

import { CreateTaskDialog } from './CreateTaskDialog';

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status.replace('_', ' ');
  switch (status) {
    case 'ASSIGNED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{normalized}</span>;
    case 'STARTED':
    case 'IN_PROGRESS': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{normalized}</span>;
    case 'PAUSED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{normalized}</span>;
    case 'COMPLETED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">{normalized}</span>;
    case 'OVERDUE':
    case 'BLOCKED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">{normalized}</span>;
    default: return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{normalized}</span>;
  }
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  switch (priority) {
    case 'CRITICAL': return <span className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertCircle size={12}/> CRITICAL</span>;
    case 'HIGH': return <span className="text-xs font-bold text-orange-600">HIGH</span>;
    case 'MEDIUM': return <span className="text-xs font-bold text-blue-600">MEDIUM</span>;
    case 'LOW': return <span className="text-xs font-bold text-slate-500">LOW</span>;
    default: return null;
  }
};

export const TasksList: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [bridges, setBridges] = useState<Record<string, Bridge>>({});
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const loadData = async () => {
    const [t, pList, bList, tmList, eList] = await Promise.all([
      DataService.getTasks(),
      DataService.getProjects(),
      DataService.getBridges(),
      DataService.getTeams(),
      DataService.getEmployees()
    ]);
    setTasks(t);
    setFilteredTasks(t);
    setProjects(pList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}));
    setBridges(bList.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
    setTeams(tmList.reduce((acc, tm) => ({ ...acc, [tm.id]: tm }), {}));
    setEmployees(eList.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = tasks;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => {
        const p = projects[t.projectId];
        const b = bridges[t.bridgeId];
        const empNames = t.assignedEmployeeIds.map(eid => employees[eid]?.name || '').join(' ').toLowerCase();
        return (
          t.title.toLowerCase().includes(s) ||
          (p && p.projectCode.toLowerCase().includes(s)) ||
          (b && b.name.toLowerCase().includes(s)) ||
          empNames.includes(s)
        );
      });
    }
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'ALL') result = result.filter(t => t.priority === priorityFilter);
    
    setFilteredTasks(result);
  }, [search, statusFilter, priorityFilter, tasks, projects, bridges, employees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, assign, and track structural health monitoring tasks.</p>
        </div>
        {(role === 'ADMIN' || role === 'MANAGER' || role === 'HOD') && (
          <button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks, projects, bridges, or employees..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PAUSED">Paused</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Project & Bridge</th>
                <th className="px-6 py-4 font-medium">Assignment</th>
                <th className="px-6 py-4 font-medium">Status & Priority</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">Hours / Deadline</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.map((task) => {
                const project = projects[task.projectId];
                const bridge = bridges[task.bridgeId];
                const team = teams[task.teamId];
                
                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 max-w-[200px] truncate">{task.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{task.workMode} WORK</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{project?.projectCode}</div>
                      <div className="text-slate-500 text-xs mt-0.5 max-w-[150px] truncate">{bridge?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 text-xs font-medium">{team?.name}</div>
                      <div className="flex -space-x-2 overflow-hidden mt-1.5">
                        {task.assignedEmployeeIds.map(eid => (
                          <div key={eid} title={employees[eid]?.name} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                            {employees[eid]?.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {task.assignedEmployeeIds.length === 0 && <span className="text-xs text-slate-400">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-1.5"><StatusBadge status={task.status} /></div>
                      <div><PriorityBadge priority={task.priority} /></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-900 font-medium">{task.actualHours} / {task.plannedHours}h</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={12}/> {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <CreateTaskDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSaved={loadData} 
      />
    </div>
  );
};
