import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { Project, Bridge, ActivityLog } from '../../types';
import { ChevronRight, Calendar, MapPin, Building, Clock, Users, Activity } from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (projectId) {
      DataService.getProjectById(projectId).then(p => {
        if (p) setProject(p);
      });
      DataService.getBridgesByProjectId(projectId).then(b => setBridges(b));
      DataService.getActivitiesByProjectId(projectId).then(a => setActivities(a));
    }
  }, [projectId]);

  if (!project) return <div className="p-8 text-slate-500">Loading project...</div>;

  const tabs = ['Overview', 'Bridges', 'Workflow', 'Timeline', 'Tasks', 'Team Activity', 'Site Updates', 'Documents', 'Client Approvals'];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link to="/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium">{project.projectCode}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Building size={16}/> {project.client}</span>
              <span className="flex items-center gap-1"><MapPin size={16}/> {project.location}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Edit Project
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Add Bridge
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Progress</h3>
                <div className="flex items-end gap-4 mb-2">
                  <div className="text-4xl font-bold text-slate-900">{project.progress}%</div>
                  <div className="text-slate-500 pb-1">Overall completion</div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                  <div className={`h-3 rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${project.progress}%` }}></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Bridges</div>
                    <div className="text-xl font-semibold text-slate-800">{bridges.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Active</div>
                    <div className="text-xl font-semibold text-blue-600">{bridges.filter(b => b.status === 'IN_PROGRESS').length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Completed</div>
                    <div className="text-xl font-semibold text-emerald-600">{bridges.filter(b => b.status === 'COMPLETED').length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Delayed</div>
                    <div className="text-xl font-semibold text-red-600">{bridges.filter(b => b.status === 'DELAYED').length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Bridges Workflow Status</h3>
                  <button onClick={() => setActiveTab('Bridges')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {bridges.map(bridge => (
                    <div key={bridge.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={() => navigate(`/bridges/${bridge.id}`)}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                          <Building size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{bridge.name}</div>
                          <div className="text-xs text-slate-500">Stage {bridge.currentWorkflowStage} • {bridge.responsibleTeam.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{bridge.progress}%</div>
                        <div className={`text-xs font-medium mt-0.5 ${bridge.status === 'COMPLETED' ? 'text-emerald-600' : bridge.status === 'DELAYED' ? 'text-red-600' : 'text-blue-600'}`}>
                          {bridge.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Project Info</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="text-slate-400 mt-0.5" size={16} />
                    <div>
                      <div className="text-xs text-slate-500">Deadline</div>
                      <div className="text-sm font-medium text-slate-900">{new Date(project.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-slate-400 mt-0.5" size={16} />
                    <div>
                      <div className="text-xs text-slate-500">Started</div>
                      <div className="text-sm font-medium text-slate-900">{new Date(project.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-slate-400 mt-0.5" size={16} />
                    <div>
                      <div className="text-xs text-slate-500">Teams</div>
                      <div className="text-sm font-medium text-slate-900 mt-1 flex flex-wrap gap-2">
                        {project.team.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200">
                            {t.replace('-', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {activities.slice(0, 4).map(act => (
                    <div key={act.id} className="relative pl-4 border-l-2 border-slate-200">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></div>
                      <div className="text-sm text-slate-900">{act.description}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{new Date(act.timestamp).toLocaleString()} • {act.actorName}</div>
                    </div>
                  ))}
                  {activities.length === 0 && <div className="text-sm text-slate-500">No recent activity</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Bridges' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Monitored Bridges</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Bridge Name</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Current Stage</th>
                    <th className="px-6 py-4 font-medium">Team</th>
                    <th className="px-6 py-4 font-medium">Progress</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bridges.map(bridge => (
                    <tr key={bridge.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/bridges/${bridge.id}`)}>
                      <td className="px-6 py-4 font-medium text-slate-900">{bridge.name}</td>
                      <td className="px-6 py-4 text-slate-600">{bridge.location}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Stage {bridge.currentWorkflowStage}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{bridge.responsibleTeam.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${bridge.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${bridge.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500">{bridge.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                          bridge.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 
                          bridge.status === 'DELAYED' ? 'bg-red-50 text-red-700' : 
                          bridge.status === 'PENDING' ? 'bg-slate-100 text-slate-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {bridge.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Timeline' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-3xl">
            <h3 className="font-semibold text-slate-800 mb-6">Project Timeline</h3>
            <div className="space-y-6">
              {activities.map((act, index) => (
                <div key={act.id} className="flex gap-4 relative">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-5 top-8 bottom-[-24px] w-0.5 bg-slate-200"></div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10 text-slate-500">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="font-medium text-slate-900">{act.actorName} <span className="text-slate-500 font-normal">{act.action.replace('_', ' ')}</span></div>
                      <div className="text-xs text-slate-500">{new Date(act.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-slate-600">{act.description}</div>
                    {act.bridgeId && (
                      <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => navigate(`/bridges/${act.bridgeId}`)}>
                        Related Bridge
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {activities.length === 0 && <div className="text-slate-500 text-center py-8">No activity recorded for this project yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'Workflow' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Bridges Workflow Overview</h3>
              <p className="text-sm text-slate-500 mt-1">Current active stage for all bridges in this project.</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {bridges.map(bridge => (
                  <div key={bridge.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{bridge.name}</h4>
                        <div className="text-sm text-slate-500">Stage {bridge.currentWorkflowStage} Active</div>
                      </div>
                      <button onClick={() => navigate(`/bridges/${bridge.id}`)} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium transition-colors">
                        View Full Workflow
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(stage => {
                        let bgColor = 'bg-slate-100';
                        if (stage < bridge.currentWorkflowStage) bgColor = 'bg-emerald-500';
                        else if (stage === bridge.currentWorkflowStage) bgColor = bridge.status === 'DELAYED' ? 'bg-red-500' : bridge.status === 'PENDING' ? 'bg-blue-300' : 'bg-indigo-600';
                        
                        return (
                          <div key={stage} className="flex-1 flex items-center group relative">
                            <div className={`h-2 flex-1 ${bgColor} first:rounded-l-full last:rounded-r-full`}></div>
                            {stage !== 13 && <div className="w-0.5 h-4 bg-white z-10"></div>}
                            
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded pointer-events-none whitespace-nowrap z-20">
                              Stage {stage}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-800">Project Tasks</h3>
              <button onClick={() => navigate('/tasks')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Manage All Tasks</button>
            </div>
            <div className="space-y-4">
              {bridges.map(bridge => (
                <div key={bridge.id} className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">{bridge.name}</h4>
                  <div className="space-y-2 text-sm">
                    {/* Tasks will be fetched via DataService... but wait, I can just render a link to Tasks list with filter. Let's do a simple placeholder to guide user to Tasks page */}
                    <div className="text-slate-500 bg-slate-50 p-3 rounded-md text-center">
                      <p>View tasks for {bridge.name} in the Task Management module.</p>
                      <button onClick={() => navigate('/tasks')} className="mt-2 text-indigo-600 font-medium hover:underline">Go to Tasks</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {['Team Activity', 'Site Updates', 'Documents', 'Client Approvals'].includes(activeTab) && activeTab !== 'Bridges' && activeTab !== 'Timeline' && activeTab !== 'Overview' && activeTab !== 'Workflow' && activeTab !== 'Tasks' && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <Activity className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">{activeTab}</h3>
            <p className="text-slate-500 mt-2">This module is currently in development (Phase 3+).</p>
          </div>
        )}
      </div>
    </div>
  );
};
