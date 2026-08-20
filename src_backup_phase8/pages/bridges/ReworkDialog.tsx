import React, { useState, useEffect } from 'react';
import type { Bridge, WorkflowStage, Task } from '../../types';
import { DataService } from '../../services/mock/dataService';
import { RotateCcw } from 'lucide-react';

interface Props {
  bridge: Bridge;
  onClose: () => void;
  onSubmit: (data: { reason: string, comments: string, returnStageId: string, returnTaskId?: string }) => Promise<void>;
}

export const ReworkDialog: React.FC<Props> = ({ bridge, onClose, onSubmit }) => {
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [returnStageId, setReturnStageId] = useState('');
  const [returnTaskId, setReturnTaskId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const s = await DataService.getBridgeWorkflows(bridge.id);
      const sorted = [...s].sort((a, b) => a.stageNumber - b.stageNumber);
      const t = await DataService.getTasksByBridgeId(bridge.id);
      setStages(sorted);
      setTasks(t);
      if (sorted.length > 0) setReturnStageId(sorted[0].id);
    };
    loadData();
  }, [bridge.id]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Reason is mandatory.');
      return;
    }
    if (!comments.trim()) {
      setError('Comments are mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ reason, comments, returnStageId, returnTaskId: returnTaskId || undefined });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to submit rework.');
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.workflowStageId === returnStageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw size={20} className="text-red-600" />
            Initiate Rework
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm text-red-800">
              Initiating rework will reopen the selected workflow stage and flag it as "REWORK REQUIRED".
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Rework <span className="text-red-500">*</span></label>
            <input 
              type="text"
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" 
              placeholder="e.g., Client requested additional sensor mapping"
              value={reason} onChange={e => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Comments <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" 
              rows={3} placeholder="Explain exactly what needs to be fixed..."
              value={comments} onChange={e => setComments(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Return Workflow Stage <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={returnStageId} onChange={e => { setReturnStageId(e.target.value); setReturnTaskId(''); }}
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specific Task (Optional)</label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={returnTaskId} onChange={e => setReturnTaskId(e.target.value)}
              >
                <option value="">-- Reopen entire stage --</option>
                {filteredTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium text-sm hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700">
            {isSubmitting ? 'Submitting...' : 'Initiate Rework'}
          </button>
        </div>
      </div>
    </div>
  );
};
