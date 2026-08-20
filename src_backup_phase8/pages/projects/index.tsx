import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import type { Project } from '../../types';
import { useRole } from '../../context/RoleContext';
import { Search, ChevronRight, AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'ACTIVE': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><PlayCircle size={14}/> Active</span>;
    case 'COMPLETED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle2 size={14}/> Completed</span>;
    case 'DELAYED': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><AlertCircle size={14}/> Delayed</span>;
    case 'ON_HOLD': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"><Clock size={14}/> On Hold</span>;
    default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
  }
};

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');

  useEffect(() => {
    DataService.getProjects().then(data => {
      setProjects(data);
      setFilteredProjects(data);
    });
  }, []);

  useEffect(() => {
    let result = projects;
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.projectCode.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (clientFilter !== 'ALL') {
      result = result.filter(p => p.client === clientFilter);
    }
    setFilteredProjects(result);
  }, [search, statusFilter, clientFilter, projects]);

  const clients = Array.from(new Set(projects.map(p => p.client)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all structural health monitoring projects.</p>
        </div>
        {role === 'ADMIN' && (
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
            onClick={() => alert('New Project modal not implemented in this prototype.')}
          >
            New Project
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select 
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select 
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
            >
              <option value="ALL">All Clients</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Client & Location</th>
                <th className="px-6 py-4 font-medium">Bridges</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{project.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{project.projectCode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{project.client}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{project.location}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {project.bridges.length}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(project.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No projects found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
