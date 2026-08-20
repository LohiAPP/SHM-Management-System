import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/mock/dataService';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [exts, setExts] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [tList, teamList, extList, empList] = await Promise.all([
        DataService.getTasks(),
        DataService.getTeams(),
        DataService.getTimeRequests(),
        DataService.getEmployees()
      ]);
      setTasks(tList);
      setTeams(teamList);
      setExts(extList);
      // Hack for mock data since updates don't have get all currently
      setUpdates([{ id: 1, message: 'Sensor installed on Pier 3', progress: 50, employeeId: empList[0]?.id, timestamp: new Date().toISOString() }]);
      setEmployees(empList);
    };
    load();
  }, []);

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-indigo-600" /> Manager Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Department operational visibility and approvals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Team Workload */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">Team Workload</div>
            <div className="p-4 space-y-4">
              {teams.map(team => {
                const teamTasks = tasks.filter(t => t.teamId === team.id);
                const active = teamTasks.filter(t => t.status === 'IN_PROGRESS').length;
                const completed = teamTasks.filter(t => t.status === 'COMPLETED').length;
                const overdue = teamTasks.filter(t => t.status === 'OVERDUE').length;
                return (
                  <div key={team.id} className="border border-slate-100 rounded-lg p-4">
                    <div className="font-bold text-slate-800 mb-2">{team.name}</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div className="bg-slate-50 p-2 rounded"><span className="block text-xl font-bold text-slate-700">{teamTasks.length}</span>Total Tasks</div>
                      <div className="bg-indigo-50 p-2 rounded"><span className="block text-xl font-bold text-indigo-700">{active}</span>Active</div>
                      <div className="bg-emerald-50 p-2 rounded"><span className="block text-xl font-bold text-emerald-700">{completed}</span>Completed</div>
                      <div className="bg-red-50 p-2 rounded"><span className="block text-xl font-bold text-red-700">{overdue}</span>Overdue</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800 flex justify-between">
              Extension Requests Awaiting Approval
            </div>
            <div className="divide-y divide-slate-100">
              {exts.filter(e => e.decision === 'PENDING').map(ext => (
                <div key={ext.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-sm text-slate-900">{getEmpName(ext.employeeId)} requested {ext.requestedAdditionalTime} {ext.requestedTimeType}</div>
                    <div className="text-xs text-slate-500">Reason: {ext.reason}</div>
                  </div>
                  <button onClick={() => navigate('/approvals')} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 transition-colors">
                    Review
                  </button>
                </div>
              ))}
              {exts.filter(e => e.decision === 'PENDING').length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">No pending extension requests.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">Pending Reviews</div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 items-center p-3 bg-amber-50 rounded border border-amber-100 text-amber-800 text-sm">
                <AlertCircle size={18} />
                <div className="flex-1">
                  <div className="font-semibold">3 Tasks Blocked</div>
                  <div className="text-xs opacity-80">Requires immediate attention</div>
                </div>
              </div>
              <div className="flex gap-3 items-center p-3 bg-blue-50 rounded border border-blue-100 text-blue-800 text-sm">
                <CheckCircle2 size={18} />
                <div className="flex-1">
                  <div className="font-semibold">5 Tasks Completed</div>
                  <div className="text-xs opacity-80">Awaiting HOD sign-off</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800">Latest Site Updates</div>
            <div className="divide-y divide-slate-100">
              {updates.map(upd => (
                <div key={upd.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-700">{getEmpName(upd.employeeId)}</span>
                    <span>{new Date(upd.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-slate-800">{upd.message}</div>
                  <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                    Progress: {upd.progress}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
