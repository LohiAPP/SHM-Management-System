import React, { useEffect, useState } from 'react';
import { DemoDataService } from './DemoDataService';
import type { DemoDelayReview, DemoTask } from './types';
import { MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../context/RoleContext';

export const DemoEmployeeFeedback: React.FC = () => {
  const [reviews, setReviews] = useState<DemoDelayReview[]>([]);
  const [tasks, setTasks] = useState<Record<string, DemoTask>>({});
  const { currentUser } = useAuth();
  const { currentEmployeeId } = useRole();
  
  const rawId = currentUser?.employeeId || currentEmployeeId;
  const activeId = ['emp-1', 'admin', 'manager', 'EMP-MOCK-ADMIN', 'EMP-MOCK-HOD_MANAGER'].includes(rawId) ? 'emp-s1' : rawId;

  const load = async () => {
    if (!activeId) return;
    
    const revs = await DemoDataService.getReviewsByEmployeeId(activeId);
    setReviews(revs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    
    const ts = await DemoDataService.getTasks();
    setTasks(ts.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
  };

  useEffect(() => { load(); }, [activeId]);

  if (reviews.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MessageSquare className="text-indigo-600" /> Manager Feedback & Delay Reviews
      </h2>
      <div className="space-y-4">
        {reviews.map(r => {
          const t = tasks[r.taskId];
          if (!t) return null;
          
          return (
            <div key={r.id} className={`border-l-4 p-4 rounded-r-lg shadow-sm ${r.status === 'ACCEPTED' ? 'border-emerald-500 bg-emerald-50' : r.status === 'REJECTED' ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{t.title} <span className="text-sm font-normal text-slate-500">— {t.bridgeName}</span></h3>
                  <div className="text-xs text-slate-500 mt-1">Submitted: {new Date(r.submittedAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${r.status === 'ACCEPTED' ? 'bg-emerald-200 text-emerald-800' : r.status === 'REJECTED' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                    {r.status === 'ACCEPTED' && <CheckCircle size={14}/>}
                    {r.status === 'REJECTED' && <XCircle size={14}/>}
                    {r.status === 'PENDING' && <Clock size={14}/>}
                    {r.status}
                  </span>
                  {r.performanceImpact === 'NEGATIVE' && (
                    <span className="text-xs font-bold text-red-600 mt-1 bg-red-100 px-2 py-0.5 rounded">Impact: {r.negativePoints} Point</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="bg-white/60 p-3 rounded border border-black/5">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-1">Your Reason</div>
                  <p className="text-slate-700 italic">"{r.reason}"</p>
                </div>
                {r.status !== 'PENDING' && (
                  <div className="bg-white/60 p-3 rounded border border-black/5">
                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Manager Comment</div>
                    <p className="text-slate-700 font-medium">{r.managerComment || 'Reviewed without comment.'}</p>
                    <div className="text-xs text-slate-400 mt-2">Reviewed at: {r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : 'N/A'}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
