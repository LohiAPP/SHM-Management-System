import React, { useState } from 'react';
import type { Task, TimeRequestUnit } from '../../types';
import { Clock } from 'lucide-react';

interface Props {
  task: Task;
  onClose: () => void;
  onSubmit: (data: { requestedAdditionalTime: number, requestedTimeType: TimeRequestUnit, reason: string, remainingWork: string }) => Promise<void>;
}

export const RequestTimeDialog: React.FC<Props> = ({ task, onClose, onSubmit }) => {
  const [requestedTime, setRequestedTime] = useState<number>(0);
  const [timeType, setTimeType] = useState<TimeRequestUnit>('DAYS');
  const [reason, setReason] = useState('');
  const [remainingWork, setRemainingWork] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (requestedTime <= 0) {
      setError('Requested time must be greater than 0.');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        requestedAdditionalTime: requestedTime,
        requestedTimeType: timeType,
        reason,
        remainingWork
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to submit request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Request Additional Time
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Task</div>
              <div className="text-sm font-bold text-slate-900 truncate">{task.title}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Deadline</div>
              <div className="text-sm font-bold text-slate-900">{new Date(task.deadline).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Progress</div>
              <div className="text-sm font-bold text-slate-900">{task.progress}%</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remaining Work Summary</label>
            <textarea 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={2} placeholder="Describe the remaining work..."
              value={remainingWork} onChange={e => setRemainingWork(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Time</label>
              <input 
                type="number" min="0" step="0.5"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={requestedTime} onChange={e => setRequestedTime(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={timeType} onChange={e => setTimeType(e.target.value as TimeRequestUnit)}
              >
                <option value="DAYS">Days</option>
                <option value="HOURS">Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Extension <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={3} placeholder="Why is this additional time needed?"
              value={reason} onChange={e => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium text-sm hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium text-sm hover:bg-indigo-700">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
};
