import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { Bridge, Project, WorkflowStage, Task, ReworkHistory, Employee } from '../../types';
import { ChevronRight, Building, MapPin, Calendar, AlertTriangle, Play, CheckCircle2, AlertCircle, Timer, RotateCcw } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { ReworkDialog } from './ReworkDialog';

const StageStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircle2 className="text-emerald-500" size={20} />;
    case 'IN_PROGRESS': return <Play className="text-blue-500" size={20} />;
    case 'DELAYED': return <AlertCircle className="text-red-500" size={20} />;
    case 'REJECTED': return <AlertTriangle className="text-amber-500" size={20} />;
    default: return <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>;
  }
};

export const BridgeDetails: React.FC = () => {
  const { bridgeId } = useParams();
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reworkHistory, setReworkHistory] = useState<ReworkHistory[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | null>(null);
  
  const { role, currentEmployeeId } = useRole();
  const [showReworkDialog, setShowReworkDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (bridgeId) {
        const b = await DataService.getBridgeById(bridgeId);
        if (b) {
          setBridge(b);
          const p = await DataService.getProjectById(b.projectId);
          if (p) setProject(p);
        }
        
        const [wf, tList, rList, eList] = await Promise.all([
          DataService.getBridgeWorkflows(bridgeId),
          DataService.getTasksByBridgeId(bridgeId),
          DataService.getReworkHistoryByBridgeId(bridgeId),
          DataService.getEmployees()
        ]);
        
        const sorted = [...wf].sort((a, b) => a.stageNumber - b.stageNumber);
        setWorkflowStages(sorted);
        setTasks(tList);
        setReworkHistory(rList);
        setEmployees(eList.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
        
        if (!selectedStage) {
          const active = sorted.find(s => s.status === 'IN_PROGRESS' || s.status === 'DELAYED' || s.status === 'REJECTED') || sorted[sorted.length - 1];
          setSelectedStage(active);
        }
      }
    };
    loadData();
  }, [bridgeId]);

  const handleInitiateRework = async (data: any) => {
    if (!bridge || !selectedStage) return;
    await DataService.createRework({
      projectId: bridge.projectId,
      bridgeId: bridge.id,
      workflowStageId: selectedStage.id,
      initiatedBy: currentEmployeeId,
      ...data
    });
    // Trigger UI reload
    const rList = await DataService.getReworkHistoryByBridgeId(bridge.id);
    setReworkHistory(rList);
    
    // Visually update the stage to REJECTED (Rework Required)
    setWorkflowStages(prev => prev.map(s => s.id === data.returnStageId ? { ...s, status: 'REJECTED' } : s));
    if (selectedStage?.id === data.returnStageId) {
      setSelectedStage(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    }
  };

  if (!bridge || !project) return <div className="p-8 text-slate-500">Loading bridge details...</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
          <ChevronRight size={14} />
          <Link to={`/projects/${project.id}`} className="hover:text-indigo-600 transition-colors">{project.projectCode}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium">{bridge.name}</span>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{bridge.name}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Building size={16} className="text-slate-400"/> {bridge.client}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {bridge.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400"/> Deadline: {new Date(bridge.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0 border-l border-slate-200 pl-6">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Overall Progress</div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${bridge.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${bridge.progress}%` }}></div>
                </div>
                <span className="text-xl font-bold text-slate-900">{bridge.progress}%</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                bridge.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 
                bridge.status === 'DELAYED' ? 'bg-red-50 text-red-700' : 
                bridge.status === 'PENDING' ? 'bg-slate-100 text-slate-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {bridge.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 13-Stage Workflow Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">13-Stage SHM Workflow</h3>
          </div>
          
          <div className="p-6 flex-1 overflow-x-auto">
            <div className="relative" style={{ minWidth: '600px' }}>
              {/* Timeline connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200"></div>
              
              <div className="space-y-6">
                {workflowStages.map((stage) => {
                  const isSelected = selectedStage?.id === stage.id;
                  let bgClass = "bg-white hover:bg-slate-50";
                  if (isSelected) bgClass = "bg-indigo-50 border-indigo-200";
                  
                  return (
                    <div 
                      key={stage.id}
                      className={`relative pl-14 pr-4 py-3 border rounded-lg cursor-pointer transition-colors ${bgClass} ${isSelected ? 'shadow-sm' : 'border-slate-200'}`}
                      onClick={() => setSelectedStage(stage)}
                    >
                      <div className="absolute left-[13px] top-1/2 -translate-y-1/2 bg-white w-6 h-6 flex items-center justify-center">
                        <StageStatusIcon status={stage.status} />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">STAGE {stage.stageNumber}</span>
                            <h4 className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{stage.name}</h4>
                          </div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                            <span>{stage.team.replace('_', ' ')}</span>
                            {stage.status !== 'NOT_STARTED' && (
                              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                {stage.progress}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm">
                          {stage.status === 'NOT_STARTED' ? (
                            <span className="text-slate-400">Pending</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className={`font-medium ${stage.status === 'COMPLETED' ? 'text-emerald-600' : stage.status === 'DELAYED' ? 'text-red-600' : stage.status === 'REJECTED' ? 'text-amber-600' : 'text-blue-600'}`}>
                                {stage.status.replace('_', ' ')}
                              </span>
                              {stage.startDate && (
                                <span className="text-xs text-slate-500 mt-0.5">Started {new Date(stage.startDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Stage Details Panel */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)] sticky top-24">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Stage Details</h3>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {selectedStage ? (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold text-indigo-600 tracking-wider mb-1">STAGE {selectedStage.stageNumber}</div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedStage.name}</h2>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      selectedStage.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      selectedStage.status === 'DELAYED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      selectedStage.status === 'REJECTED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      selectedStage.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedStage.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedStage.team.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                  {selectedStage.stageNumber === 8 && selectedStage.status === 'IN_PROGRESS' ? (
                    <div className="flex flex-col items-center text-center py-2">
                      <Timer size={32} className="text-indigo-600 mb-2" />
                      <h4 className="font-bold text-lg text-slate-900">48:12:05</h4>
                      <p className="text-slate-500 text-xs mt-1">Remaining in 72-Hour Monitoring</p>
                    </div>
                  ) : selectedStage.stageNumber === 3 && selectedStage.status === 'REJECTED' ? (
                     <div className="text-amber-800">
                       <p className="font-semibold mb-1">Client Rejection Notes:</p>
                       <p className="text-sm">"The proposed methodology for sensor placement at pier 4 is insufficient for accurate strain measurement under high wind loads. Please revise."</p>
                     </div>
                  ) : (
                    <p>Standard operating procedure for {selectedStage.name}. Team will complete necessary inspections and data gathering according to protocol.</p>
                  )}
                </div>

                {selectedStage.status !== 'NOT_STARTED' && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Progress</h4>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full ${selectedStage.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${selectedStage.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{selectedStage.progress}% Complete</span>
                      {selectedStage.expectedEndDate && <span>Due {new Date(selectedStage.expectedEndDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider flex justify-between">
                    <span>Related Tasks</span>
                    <span className="text-indigo-600 text-xs cursor-pointer hover:underline">Add Task</span>
                  </h4>
                  <div className="space-y-3">
                    {tasks.filter(t => t.workflowStageId === selectedStage.id).length > 0 ? (
                      tasks.filter(t => t.workflowStageId === selectedStage.id).map(task => (
                        <div key={task.id} className="p-3 border border-slate-200 rounded-md bg-white hover:border-indigo-300 transition-colors cursor-pointer">
                          <div className="font-medium text-sm text-slate-900">{task.title}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : task.status === 'OVERDUE' || task.status === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-500">{task.progress}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-300 rounded-md">
                        No active tasks
                      </div>
                    )}
                  </div>
                </div>

                {selectedStage.status === 'IN_PROGRESS' || selectedStage.status === 'DELAYED' ? (
                  <div className="pt-4 border-t border-slate-200 flex gap-3">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium text-sm transition-colors">
                      Update Progress
                    </button>
                    <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-md font-medium text-sm transition-colors">
                      Mark Complete
                    </button>
                  </div>
                ) : selectedStage.status === 'REJECTED' ? (
                  <div className="pt-4 border-t border-slate-200">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium text-sm transition-colors">
                      Submit Revision
                    </button>
                  </div>
                ) : selectedStage.status === 'NOT_STARTED' && (
                  <div className="pt-4 border-t border-slate-200">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium text-sm transition-colors">
                      Begin Stage
                    </button>
                  </div>
                )}
                
                {/* Rework History Display */}
                {reworkHistory.filter(r => r.workflowStageId === selectedStage.id).length > 0 && (
                  <div className="pt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <RotateCcw size={16} className="text-slate-500" />
                      Rework History
                    </h4>
                    <div className="space-y-3">
                      {reworkHistory.filter(r => r.workflowStageId === selectedStage.id).map(r => (
                        <div key={r.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">Round {r.roundNumber}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>{r.status}</span>
                          </div>
                          <div className="text-slate-700 font-medium mb-1">{r.reason}</div>
                          <div className="text-slate-600 text-xs mb-2 bg-white p-2 rounded border border-slate-100">{r.comments}</div>
                          <div className="text-xs text-slate-500 flex justify-between">
                            <span>Initiated by: {employees[r.initiatedBy]?.name || 'System'}</span>
                            <span>{new Date(r.initiatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Initiate Rework Action */}
                {(role === 'ADMIN' || role === 'MANAGER' || role === 'HOD') && (
                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <button 
                      onClick={() => setShowReworkDialog(true)}
                      className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} /> Initiate Rework / Rejection
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Select a stage from the timeline
              </div>
            )}
          </div>
        </div>
      </div>

      {showReworkDialog && bridge && (
        <ReworkDialog 
          bridge={bridge} 
          onClose={() => setShowReworkDialog(false)} 
          onSubmit={handleInitiateRework} 
        />
      )}
    </div>
  );
};
