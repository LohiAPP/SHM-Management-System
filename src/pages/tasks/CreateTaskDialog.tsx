import React, { useState, useEffect } from 'react';
import { DataService } from '../../services/mock/dataService';
import type { Project, Bridge, WorkflowStage, Team, Employee } from '../../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CreateTaskDialog: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    bridgeId: '',
    workflowStageId: '',
    teamId: '',
    assignedEmployeeIds: [] as string[],
    workMode: 'OFFICE' as any,
    priority: 'MEDIUM' as any,
    plannedHours: 8,
    plannedStartDate: '',
    plannedEndDate: '',
    deadline: ''
  });

  useEffect(() => {
    if (isOpen) {
      DataService.getProjects().then(setProjects);
      DataService.getTeams().then(setTeams);
      DataService.getEmployees().then(setEmployees);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.projectId) {
      DataService.getBridgesByProjectId(formData.projectId).then(setBridges);
      setFormData(prev => ({ ...prev, bridgeId: '', workflowStageId: '' }));
    }
  }, [formData.projectId]);

  useEffect(() => {
    if (formData.bridgeId) {
      DataService.getBridgeWorkflows(formData.bridgeId).then(setStages);
      setFormData(prev => ({ ...prev, workflowStageId: '' }));
    }
  }, [formData.bridgeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createTask({
      projectId: formData.projectId,
      bridgeId: formData.bridgeId,
      workflowStageId: formData.workflowStageId,
      title: formData.title,
      description: formData.description,
      teamId: formData.teamId,
      assignedEmployeeIds: formData.assignedEmployeeIds,
      workMode: formData.workMode,
      priority: formData.priority,
      status: 'ASSIGNED',
      progress: 0,
      plannedHours: formData.plannedHours,
      actualHours: 0,
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate).toISOString() : undefined,
      plannedEndDate: formData.plannedEndDate ? new Date(formData.plannedEndDate).toISOString() : undefined,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date().toISOString()
    });
    onSaved();
    onClose();
  };

  const handleEmployeeToggle = (empId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedEmployeeIds.includes(empId);
      if (isSelected) {
        return { ...prev, assignedEmployeeIds: prev.assignedEmployeeIds.filter(id => id !== empId) };
      } else {
        return { ...prev, assignedEmployeeIds: [...prev.assignedEmployeeIds, empId] };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 rounded-t-lg z-10">
          <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title *</label>
                <input required type="text" className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500" rows={2}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project *</label>
                  <select required className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bridge *</label>
                  <select required disabled={!formData.projectId} className="w-full border border-slate-300 rounded-md p-2 text-sm disabled:bg-slate-100" value={formData.bridgeId} onChange={e => setFormData({...formData, bridgeId: e.target.value})}>
                    <option value="">Select Bridge</option>
                    {bridges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Workflow Stage *</label>
                  <select required disabled={!formData.bridgeId} className="w-full border border-slate-300 rounded-md p-2 text-sm disabled:bg-slate-100" value={formData.workflowStageId} onChange={e => setFormData({...formData, workflowStageId: e.target.value})}>
                    <option value="">Select Stage</option>
                    {stages.map(s => <option key={s.id} value={s.id}>Stage {s.stageNumber}: {s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Team *</label>
                  <select required className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value, assignedEmployeeIds: []})}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employees (Multiple)</label>
                  <div className="border border-slate-300 rounded-md p-2 max-h-32 overflow-y-auto bg-slate-50 space-y-1">
                    {formData.teamId ? employees.filter(e => e.teamId === formData.teamId).map(emp => (
                      <label key={emp.id} className="flex items-center gap-2 text-sm p-1 hover:bg-slate-100 rounded cursor-pointer">
                        <input type="checkbox" checked={formData.assignedEmployeeIds.includes(emp.id)} onChange={() => handleEmployeeToggle(emp.id)} className="accent-indigo-600" />
                        {emp.name} ({emp.role})
                      </label>
                    )) : <span className="text-xs text-slate-400">Select a team first</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Work Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Work Mode</label>
                  <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value as any})}>
                    <option value="OFFICE">Office</option>
                    <option value="SITE">Site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Planned Hours</label>
                  <input type="number" min="1" className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.plannedHours} onChange={e => setFormData({...formData, plannedHours: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Planned Start Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.plannedStartDate} onChange={e => setFormData({...formData, plannedStartDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Planned End Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.plannedEndDate} onChange={e => setFormData({...formData, plannedEndDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline *</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-md p-2 text-sm" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
            </div>

          </form>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 sticky bottom-0 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button type="submit" form="taskForm" className="px-4 py-2 bg-indigo-600 rounded-md text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};
