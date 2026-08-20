import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/mock/dataService';
import type { TimeRequest, Employee, Task, Project, Bridge } from '../../types';
import { Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Filter } from 'lucide-react';
export const AdditionalTimePage: React.FC = () => {
  const [requests, setRequests] = useState<TimeRequest[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [bridges, setBridges] = useState<Record<string, Bridge>>({});

  useEffect(() => {
    const loadData = async () => {
      const [reqs, eList, tList, pList, bList] = await Promise.all([
        DataService.getTimeRequests(),
        DataService.getEmployees(),
        DataService.getTasks(),
        DataService.getProjects(),
        DataService.getBridges()
      ]);
      setRequests(reqs);
      setEmployees(eList.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
      setTasks(tList.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
      setProjects(pList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}));
      setBridges(bList.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
    };
    loadData();
  }, []);

  const total = requests.length;
  const pending = requests.filter(r => r.decision === 'PENDING').length;
  const approved = requests.filter(r => r.decision === 'APPROVED').length;
  const rejected = requests.filter(r => r.decision === 'REJECTED').length;
  const approvalRate = total > 0 ? Math.round((approved / (approved + rejected || 1)) * 100) : 0;
  
  const avgAdditionalDays = approved > 0 
    ? (requests.filter(r => r.decision === 'APPROVED' && r.requestedTimeType === 'DAYS').reduce((acc, r) => acc + (r.approvedAdditionalTime || 0), 0) / approved).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="text-indigo-600" /> Extension Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">Overview of time extension requests and approval rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm flex flex-col items-center justify-center text-center bg-amber-50">
          <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><AlertCircle size={14}/> Pending</div>
          <div className="text-2xl font-bold text-amber-700">{pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center bg-emerald-50">
          <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> Approved</div>
          <div className="text-2xl font-bold text-emerald-700">{approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm flex flex-col items-center justify-center text-center bg-red-50">
          <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><XCircle size={14}/> Rejected</div>
          <div className="text-2xl font-bold text-red-700">{rejected}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={14}/> Approval Rate</div>
          <div className="text-2xl font-bold text-indigo-600">{approvalRate}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Extension</div>
          <div className="text-2xl font-bold text-slate-900">+{avgAdditionalDays} <span className="text-sm font-medium">Days</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Extension Table</h3>
          <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
                <th className="p-4">Employee</th>
                <th className="p-4">Task</th>
                <th className="p-4">Project / Bridge</th>
                <th className="p-4">Orig. Deadline</th>
                <th className="p-4">Req. Time</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Decision</th>
                <th className="p-4">Appvd. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{employees[req.employeeId]?.name}</td>
                  <td className="p-4">{tasks[req.taskId]?.title}</td>
                  <td className="p-4 text-xs text-slate-500">{projects[req.projectId]?.projectCode}<br/>{bridges[req.bridgeId]?.name}</td>
                  <td className="p-4 text-slate-700">{new Date(req.originalDeadline).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-900">{req.requestedAdditionalTime} {req.requestedTimeType}</td>
                  <td className="p-4 text-xs text-slate-600 max-w-[200px] truncate">{req.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      req.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.decision === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{req.decision}</span>
                  </td>
                  <td className="p-4 text-indigo-700 font-bold">
                    {req.decision === 'APPROVED' ? `${req.approvedAdditionalTime} ${req.requestedTimeType}` : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No time extension requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
