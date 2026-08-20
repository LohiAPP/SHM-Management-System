import React, { useState } from 'react';
import type { TimeRequest, Employee } from '../../types';
import { Shield } from 'lucide-react';

interface Props {
  request: TimeRequest;
  employee: Employee | undefined;
  taskTitle: string;
  onClose: () => void;
  onSubmit: (decision: 'APPROVED' | 'REJECTED', approvedTime: number, comments: string) => Promise<void>;
}

export const ReviewTimeDialog: React.FC<Props> = ({ request, employee, taskTitle, onClose, onSubmit }) => {
  const [approvedTime, setApprovedTime] = useState<number>(request.requestedAdditionalTime);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !comments.trim()) {
      setError('Comments are mandatory for rejection.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(decision, approvedTime, comments);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to submit decision.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Review Time Request
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Employee</div>
              <div className="text-sm font-bold text-slate-900">{employee?.name} ({employee?.role})</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Task</div>
              <div className="text-sm font-bold text-slate-900">{taskTitle}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Original Deadline</div>
                <div className="text-sm font-medium text-slate-900">{new Date(request.originalDeadline).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Requested Time</div>
                <div className="text-sm font-bold text-indigo-700">{request.requestedAdditionalTime} {request.requestedTimeType}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Reason for Extension</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                {request.reason}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Remaining Work</div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                {request.remainingWork}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Approved Time ({request.requestedTimeType})</label>
              <input 
                type="number" min="0" step="0.5"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={approvedTime} onChange={e => setApprovedTime(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-slate-500 mt-1">You can approve a partial amount.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manager Comments</label>
              <textarea 
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                rows={3} placeholder="Add notes for the employee..."
                value={comments} onChange={e => setComments(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between gap-3 shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium text-sm hover:bg-slate-100">
            Cancel
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleAction('REJECTED')} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700">
              Reject
            </button>
            <button onClick={() => handleAction('APPROVED')} disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium text-sm hover:bg-emerald-700">
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
