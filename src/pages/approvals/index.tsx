import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/mock/dataService';
import type { TimeRequest, Employee, Task, Project, Bridge } from '../../types';
import { useRole } from '../../context/RoleContext';
import { ReviewTimeDialog } from './ReviewTimeDialog';
import { Shield, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { currentEmployeeId, role } = useRole();
  const [requests, setRequests] = useState<TimeRequest[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [bridges, setBridges] = useState<Record<string, Bridge>>({});
  
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<TimeRequest | null>(null);

  const loadData = async () => {
    const [reqs, eList, tList, pList, bList] = await Promise.all([
      DataService.getTimeRequests(),
      DataService.getEmployees(),
      DataService.getTasks(),
      DataService.getProjects(),
      DataService.getBridges()
    ]);
    
    // Sort reqs by date desc
    reqs.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    
    setRequests(reqs);
    setEmployees(eList.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
    setTasks(tList.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
    setProjects(pList.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}));
    setBridges(bList.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (decision: 'APPROVED' | 'REJECTED', approvedTime: number, comments: string) => {
    if (!selectedRequest) return;
    await DataService.reviewTimeRequest(selectedRequest.id, decision, currentEmployeeId, approvedTime, comments);
    
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: decision === 'APPROVED' ? 'EXTENSION_APPROVED' : 'EXTENSION_REJECTED',
      description: `Time request ${decision.toLowerCase()} for ${selectedRequest.requestedAdditionalTime} ${selectedRequest.requestedTimeType}`,
      projectId: selectedRequest.projectId, bridgeId: selectedRequest.bridgeId, taskId: selectedRequest.taskId
    });
    
    setSelectedRequest(null);
    loadData();
  };

  const filteredRequests = requests.filter(r => r.decision === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="text-indigo-600" /> Approvals
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage team requests for additional time.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex border-b border-slate-200">
          <button 
            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 ${tab === 'PENDING' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('PENDING')}
          >
            <Clock size={18}/> Pending ({requests.filter(r => r.decision === 'PENDING').length})
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 ${tab === 'APPROVED' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('APPROVED')}
          >
            <CheckCircle2 size={18}/> Approved
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 ${tab === 'REJECTED' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setTab('REJECTED')}
          >
            <XCircle size={18}/> Rejected
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Task & Context</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Deadline / Requested</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{employees[req.employeeId]?.name}</div>
                    <div className="text-xs text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 line-clamp-1">{tasks[req.taskId]?.title}</div>
                    <div className="text-xs text-slate-500">{projects[req.projectId]?.projectCode} / {bridges[req.bridgeId]?.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900">{new Date(req.originalDeadline).toLocaleDateString()}</div>
                    <div className="text-xs font-bold text-indigo-600">+{req.requestedAdditionalTime} {req.requestedTimeType}</div>
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <div className="text-sm text-slate-600 line-clamp-2">{req.reason}</div>
                  </td>
                  <td className="p-4 text-right">
                    {req.decision === 'PENDING' ? (
                      <button onClick={() => setSelectedRequest(req)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded text-sm font-medium transition-colors">
                        Review
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500">
                        {req.decision === 'APPROVED' ? `Appvd: +${req.approvedAdditionalTime} ${req.requestedTimeType}` : 'Rejected'}
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No {tab.toLowerCase()} requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <ReviewTimeDialog 
          request={selectedRequest}
          employee={employees[selectedRequest.employeeId]}
          taskTitle={tasks[selectedRequest.taskId]?.title || 'Unknown Task'}
          onClose={() => setSelectedRequest(null)}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
};
