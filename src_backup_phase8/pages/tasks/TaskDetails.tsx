import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { Task, Project, Bridge, Employee, TaskUpdate, WorkLog, TimeRequest } from '../../types';
import { ChevronRight, Clock, Play, Pause, CheckCircle2, Image as ImageIcon, Video, StopCircle, Calendar } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { RequestTimeDialog } from './RequestTimeDialog';
import { DocumentList } from '../../components/documents/DocumentList';
import type { Document } from '../../types';

export const TaskDetails: React.FC = () => {
  const { taskId } = useParams();
  const { role, currentEmployeeId } = useRole();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  
  // Work Tracking
  const [activeSession, setActiveSession] = useState<WorkLog | null>(null);
  const [elapsedString, setElapsedString] = useState('00:00:00');

  const [newProgress, setNewProgress] = useState<number>(0);
  const [newUpdate, setNewUpdate] = useState('');
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const [timeRequests, setTimeRequests] = useState<TimeRequest[]>([]);
  const [effectiveDeadline, setEffectiveDeadline] = useState<string>('');
  const [showTimeRequestDialog, setShowTimeRequestDialog] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);

  const loadData = async () => {
    if (!taskId) return;
    const t = await DataService.getTaskById(taskId);
    if (t) {
      setTask(t);
      setNewProgress(t.progress);
      
      const [p, b, , eList, uList, , ] = await Promise.all([
        DataService.getProjectById(t.projectId),
        DataService.getBridgeById(t.bridgeId),
        DataService.getTeams().then(ts => ts.find(x => x.id === t.teamId) || null),
        DataService.getEmployees(),
        DataService.getTaskUpdates(taskId),
        DataService.getActivitiesByTaskId(taskId),
        DataService.getWorkLogsByTask(taskId)
      ]);
      
      const [tReqs, eDeadline, docs] = await Promise.all([
        DataService.getTimeRequestsByTaskId(taskId),
        DataService.calculateEffectiveDeadline(taskId),
        DataService.getDocumentsByTaskId(taskId)
      ]);
      
      setProject(p || null);
      setBridge(b || null);
      setEmployees(eList.reduce((acc, e) => ({ ...acc, [e.id]: e }), {}));
      setUpdates(uList);
      setTimeRequests(tReqs);
      setEffectiveDeadline(eDeadline || t.deadline);
      setDocuments(docs);
      
      // Determine active session for this specific task
      if (currentEmployeeId) {
        const session = await DataService.getActiveWorkSession(currentEmployeeId);
        if (session && session.taskId === taskId) {
          setActiveSession(session);
        } else {
          setActiveSession(null);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, currentEmployeeId]);

  useEffect(() => {
    if (!activeSession) {
      setElapsedString('00:00:00');
      return;
    }
    const interval = setInterval(() => {
      const start = new Date(activeSession.startTime).getTime();
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedString(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartWork = async () => {
    if (!task) return;
    try {
      await DataService.startWorkSession(currentEmployeeId, task.id);
      await DataService.logActivity({
        actorId: currentEmployeeId, actorName: role, action: 'STARTED_WORK_SESSION',
        description: `Started work on task`,
        projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
      });
      loadData();
    } catch (e: any) {
      if (e.message === 'MULTIPLE_ACTIVE_TASKS') {
        alert('You already have an active task. Please pause or finish it before starting a new one.');
      }
    }
  };

  const handlePauseWork = async () => {
    if (!task) return;
    await DataService.pauseWorkSession(currentEmployeeId, 'PAUSED');
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: 'PAUSED_WORK_SESSION',
      description: `Paused work session`,
      projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
    });
    loadData();
  };

  const submitFinish = async () => {
    if (!task) return;
    await DataService.pauseWorkSession(currentEmployeeId, 'COMPLETED', summaryText);
    
    // Also submit update if summary is provided
    if (summaryText.trim()) {
      await DataService.addTaskUpdate({
        taskId: task.id,
        employeeId: currentEmployeeId,
        message: summaryText,
        progress: 100,
        timestamp: new Date().toISOString()
      });
    }
    
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: 'COMPLETED_WORK_SESSION',
      description: `Task completed. Summary: ${summaryText}`,
      projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
    });
    
    setShowSummaryDialog(false);
    loadData();
  };

  const submitUpdate = async () => {
    if (!task || !newUpdate.trim()) return;
    await DataService.addTaskUpdate({
      taskId: task.id,
      employeeId: currentEmployeeId,
      message: newUpdate,
      progress: newProgress,
      timestamp: new Date().toISOString()
    });
    
    if (newProgress !== task.progress) {
      await DataService.updateTaskProgress(task.id, newProgress);
    }
    
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: 'PROGRESS_UPDATED',
      description: `Task progress updated to ${newProgress}%`,
      projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
    });
    
    setNewUpdate('');
    loadData();
  };

  const mockFileUpload = async (type: string) => {
    if (!task) return;
    await DataService.addTaskAttachment({
      taskId: task.id,
      name: `site_${type.toLowerCase()}_${Date.now()}.jpg`,
      type: type,
      uploadedBy: currentEmployeeId,
      uploadedAt: new Date().toISOString()
    });
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: 'ATTACHMENT_ADDED',
      description: `Added ${type} attachment`,
      projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
    });
    alert(`Mock ${type} uploaded successfully!`);
    loadData();
  };

  const handleRequestTime = async (data: any) => {
    if (!task) return;
    await DataService.createTimeRequest({
      employeeId: currentEmployeeId,
      taskId: task.id,
      projectId: task.projectId,
      bridgeId: task.bridgeId,
      workMode: task.workMode,
      originalDeadline: task.deadline,
      currentProgress: task.progress,
      ...data
    });
    await DataService.logActivity({
      actorId: currentEmployeeId, actorName: role, action: 'EXTENSION_REQUESTED',
      description: `Requested ${data.requestedAdditionalTime} ${data.requestedTimeType} additional time`,
      projectId: task.projectId, bridgeId: task.bridgeId, taskId: task.id
    });
    loadData();
  };

  if (!task || !project || !bridge) return <div className="p-8 text-slate-500">Loading task details...</div>;

  const canEdit = role === 'ADMIN' || role === 'MANAGER' || role === 'HOD';
  const isAssigned = task.assignedEmployeeIds.includes(currentEmployeeId);
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/tasks" className="hover:text-indigo-600 transition-colors">Tasks</Link>
        <ChevronRight size={14} />
        <Link to={`/projects/${project.id}`} className="hover:text-indigo-600 transition-colors">{project.projectCode}</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium truncate max-w-xs">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                    task.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' :
                    task.status === 'BLOCKED' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded uppercase">{task.priority} Priority</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{task.workMode} WORK</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
              </div>
              {canEdit && (
                <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-colors">
                  Edit Task
                </button>
              )}
            </div>
            
            <p className="text-slate-600 text-sm mb-6">{task.description}</p>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project</div>
                <div className="text-sm font-medium text-slate-900">{project.projectCode}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bridge</div>
                <div className="text-sm font-medium text-slate-900">{bridge.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Workflow Stage</div>
                <div className="text-sm font-medium text-slate-900">{task.workflowStageId}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Progress & Work Updates</h3>
            
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Current Progress</span>
                <span className="font-bold text-slate-900">{task.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                <div className={`h-2.5 rounded-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${task.progress}%` }}></div>
              </div>
              
              {isAssigned && task.status !== 'COMPLETED' && (
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Update Progress & Add Note</label>
                  <div className="flex items-center gap-4 mb-3">
                    <input type="range" min="0" max="100" value={newProgress} onChange={e => setNewProgress(parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <span className="w-12 text-right font-medium text-sm">{newProgress}%</span>
                  </div>
                  <textarea 
                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3" 
                    rows={2} placeholder="What did you work on?"
                    value={newUpdate} onChange={e => setNewUpdate(e.target.value)}
                  ></textarea>
                  <button onClick={submitUpdate} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Post Update
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-700 uppercase tracking-wider mb-2">Work History</h4>
              {updates.map(upd => (
                <div key={upd.id} className="flex gap-4 p-4 border border-slate-100 rounded-lg bg-white">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {employees[upd.employeeId]?.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm text-slate-900">{employees[upd.employeeId]?.name}</div>
                      <div className="text-xs text-slate-500">{new Date(upd.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">{upd.message}</div>
                    <div className="text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                      Progress marked as {upd.progress}%
                    </div>
                  </div>
                </div>
              ))}
              {updates.length === 0 && <div className="text-slate-500 text-sm italic">No work updates posted yet.</div>}
            </div>
          </div>

          <div className="h-96">
            <DocumentList 
              documents={documents} 
              onRefresh={loadData} 
              entityContext={{ taskId: task.id, bridgeId: task.bridgeId, projectId: task.projectId }} 
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Work Controls (Conditional based on mode) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 uppercase tracking-wider text-sm">
              {task.workMode === 'OFFICE' ? 'Office Timer' : 'Site Controls'}
            </h3>
            
            {task.workMode === 'OFFICE' ? (
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-1">Session Duration</div>
                  <div className="text-3xl font-mono text-white tracking-widest">{elapsedString}</div>
                </div>
                {isAssigned && task.status !== 'COMPLETED' && (
                  <div className="grid grid-cols-2 gap-2">
                    {!activeSession ? (
                      <button onClick={handleStartWork} className="col-span-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md font-medium transition-colors">
                        <Play size={18}/> Start Working
                      </button>
                    ) : (
                      <>
                        <button onClick={handlePauseWork} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-md font-medium transition-colors">
                          <Pause size={18}/> Pause
                        </button>
                        <button onClick={() => setShowSummaryDialog(true)} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-md font-medium transition-colors">
                          <CheckCircle2 size={18}/> Finish
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // SITE CONTROLS
              <div className="space-y-3">
                {isAssigned && task.status !== 'COMPLETED' && (
                  <>
                    {!activeSession ? (
                      <button onClick={handleStartWork} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold text-lg shadow-sm transition-transform active:scale-95">
                        <Play size={24}/> START WORK
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handlePauseWork} className="flex flex-col items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 p-4 rounded-xl font-semibold transition-transform active:scale-95">
                          <Pause size={24}/> Pause
                        </button>
                        <button onClick={() => setShowSummaryDialog(true)} className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-transform active:scale-95 shadow-sm">
                          <StopCircle size={24}/> FINISH
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <button onClick={() => mockFileUpload('Photo')} className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
                        <ImageIcon size={18}/> Photo
                      </button>
                      <button onClick={() => mockFileUpload('Video')} className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
                        <Video size={18}/> Video
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 uppercase tracking-wider text-sm">Planning & Time</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                <Clock className="text-slate-400 mt-0.5" size={16} />
                <div className="w-full">
                  <div className="text-xs text-slate-500 mb-1 flex justify-between">
                    <span>Hours (Actual / Planned)</span>
                    <span className={task.actualHours > task.plannedHours ? 'text-red-500 font-bold' : 'text-slate-700'}>
                      {task.actualHours > task.plannedHours ? '+' : ''}{(task.actualHours - task.plannedHours).toFixed(1)}h variance
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{task.actualHours} / {task.plannedHours} h</div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className={`h-1.5 rounded-full ${task.actualHours > task.plannedHours ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((task.actualHours / task.plannedHours) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-slate-400 mt-0.5" size={16} />
                <div className="w-full">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Deadlines</div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-slate-600">Original:</span>
                    <span className="font-medium text-slate-900">{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  {effectiveDeadline && effectiveDeadline !== task.deadline && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Effective:</span>
                      <span className="font-bold text-indigo-700">{new Date(effectiveDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Requests List */}
              {timeRequests.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Extension Requests</div>
                  {timeRequests.map(req => (
                    <div key={req.id} className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-800">+{req.requestedAdditionalTime} {req.requestedTimeType}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          req.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          req.decision === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>{req.decision}</span>
                      </div>
                      {req.decision === 'APPROVED' && req.approvedAdditionalTime !== req.requestedAdditionalTime && (
                        <div className="text-xs text-indigo-600 font-medium">Approved for: {req.approvedAdditionalTime} {req.requestedTimeType}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isAssigned && task.status !== 'COMPLETED' && (
                <div className="pt-2">
                  <button onClick={() => setShowTimeRequestDialog(true)} className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md font-medium text-sm transition-colors">
                    Request Additional Time
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-sm">Assignment</h3>
            </div>
            <div className="space-y-3">
              {task.assignedEmployeeIds.map(eid => (
                <div key={eid} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {employees[eid]?.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">{employees[eid]?.name}</div>
                    <div className="text-xs text-slate-500">{employees[eid]?.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Summary Dialog */}
      {showSummaryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Finish Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Final Progress (%)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="100" value={newProgress} onChange={e => setNewProgress(parseInt(e.target.value))} className="flex-1 accent-emerald-600" />
                  <span className="w-12 text-right font-medium text-slate-900">{newProgress}%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Summary</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  rows={4} placeholder="Summarize the work completed..."
                  value={summaryText} onChange={e => setSummaryText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowSummaryDialog(false)} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium">Cancel</button>
                <button onClick={submitFinish} className="px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700">Complete Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Request Dialog */}
      {showTimeRequestDialog && (
        <RequestTimeDialog 
          task={task} 
          onClose={() => setShowTimeRequestDialog(false)} 
          onSubmit={handleRequestTime} 
        />
      )}
    </div>
  );
};
