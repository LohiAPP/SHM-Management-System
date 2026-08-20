import React, { useEffect, useState } from 'react';
import { DemoDataService } from './DemoDataService';
import type { DemoDelayReview, DemoTask, DemoEmployee } from './types';
import { Check, X, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DemoManagerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<DemoDelayReview[]>([]);
  const [tasks, setTasks] = useState<Record<string, DemoTask>>({});
  const [employees, setEmployees] = useState<Record<string, DemoEmployee>>({});
  const { currentUser } = useAuth();

  const load = async () => {
    const revs = await DemoDataService.getPendingReviews();
    setReviews(revs);
    
    const ts = await DemoDataService.getTasks();
    setTasks(ts.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}));
    
    const emps = await DemoDataService.getEmployees();
    setEmployees(emps.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (reviewId: string, decision: 'ACCEPTED' | 'REJECTED') => {
    const comment = decision === 'REJECTED' ? prompt('Enter reason for rejection:') || 'Reason not justified.' : '';
    await DemoDataService.reviewDelayReason(reviewId, decision, currentUser?.employeeId || 'manager', comment);
    alert(decision === 'ACCEPTED' ? '✓ Delay Reason Accepted\\nNo negative performance impact.' : 'Delay reason rejected.\\nPerformance impact: -1');
    load();
  };

  if (reviews.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Clock className="text-orange-600" /> Pending Delay Reviews
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {reviews.map(r => {
          const t = tasks[r.taskId];
          const e = employees[r.employeeId];
          if (!t || !e) return null;
          
          return (
            <div key={r.id} className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded font-bold">LATE COMPLETION</span>
                  <span className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded uppercase">{e.employeeType}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{e.displayName} — {t.title}</h3>
                <div className="text-slate-600 text-sm mb-4">Bridge: {t.bridgeName} | Assigned: {new Date(t.deadline).toLocaleTimeString()}</div>
                
                <div className="bg-white border border-orange-200 p-4 rounded-lg">
                  <div className="text-xs font-bold text-orange-800 uppercase mb-1 flex items-center gap-1"><MessageSquare size={14}/> Employee Reason</div>
                  <p className="text-slate-700 italic">"{r.reason}"</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                <button onClick={() => handleReview(r.id, 'ACCEPTED')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm">
                  <Check size={18} /> ACCEPT REASON
                </button>
                <button onClick={() => handleReview(r.id, 'REJECTED')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm">
                  <X size={18} /> REJECT REASON
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
