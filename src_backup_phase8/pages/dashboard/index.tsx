import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../../services/mock/analyticsService';
import { LayoutDashboard, Users, Briefcase, Activity, Building, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AnalyticsService.getOrganizationMetrics();
      setMetrics(data);
    };
    load();
  }, []);

  if (!metrics) return <div className="p-8 text-slate-500">Loading Admin Dashboard metrics...</div>;

  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

  const taskData = [
    { name: 'Active', value: metrics.tasks.active },
    { name: 'Completed', value: metrics.tasks.completed },
    { name: 'Overdue', value: metrics.tasks.overdue },
    { name: 'Rework', value: metrics.tasks.rework }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-indigo-600" /> Admin Organization Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Organization-wide operational overview and productivity analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Projects */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm uppercase"><Briefcase size={16}/> Projects</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 text-xs block">Total</span> <span className="font-bold text-lg">{metrics.projects.total}</span></div>
            <div><span className="text-slate-500 text-xs block">Active</span> <span className="font-bold text-lg text-indigo-600">{metrics.projects.active}</span></div>
            <div><span className="text-slate-500 text-xs block">Delayed</span> <span className="font-bold text-lg text-red-600">{metrics.projects.delayed}</span></div>
          </div>
        </div>

        {/* Bridges */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm uppercase"><Building size={16}/> Bridges</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 text-xs block">Total</span> <span className="font-bold text-lg">{metrics.bridges.total}</span></div>
            <div><span className="text-slate-500 text-xs block">Active</span> <span className="font-bold text-lg text-indigo-600">{metrics.bridges.active}</span></div>
            <div><span className="text-slate-500 text-xs block">Delayed</span> <span className="font-bold text-lg text-red-600">{metrics.bridges.delayed}</span></div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm uppercase"><Activity size={16}/> Tasks</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 text-xs block">Active</span> <span className="font-bold text-lg text-indigo-600">{metrics.tasks.active}</span></div>
            <div><span className="text-slate-500 text-xs block">Overdue</span> <span className="font-bold text-lg text-amber-600">{metrics.tasks.overdue}</span></div>
            <div><span className="text-slate-500 text-xs block">Blocked</span> <span className="font-bold text-lg text-red-600">{metrics.tasks.blocked}</span></div>
            <div><span className="text-slate-500 text-xs block">Rework</span> <span className="font-bold text-lg text-orange-600">{metrics.tasks.rework}</span></div>
          </div>
        </div>

        {/* Workforce */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm uppercase"><Users size={16}/> Workforce</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 text-xs block">Total</span> <span className="font-bold text-lg">{metrics.employees.total}</span></div>
            <div><span className="text-slate-500 text-xs block">Working Now</span> <span className="font-bold text-lg text-emerald-600">{metrics.employees.working}</span></div>
            <div><span className="text-slate-500 text-xs block">Site</span> <span className="font-bold text-lg">{metrics.employees.site}</span></div>
            <div><span className="text-slate-500 text-xs block">Office</span> <span className="font-bold text-lg">{metrics.employees.office}</span></div>
          </div>
        </div>

        {/* Extensions */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold text-sm uppercase"><Clock size={16}/> Extensions</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500 text-xs block">Requests</span> <span className="font-bold text-lg">{metrics.extensions.total}</span></div>
            <div><span className="text-slate-500 text-xs block">Pending</span> <span className="font-bold text-lg text-amber-600">{metrics.extensions.pending}</span></div>
            <div><span className="text-slate-500 text-xs block">Approved</span> <span className="font-bold text-lg text-emerald-600">{metrics.extensions.approved}</span></div>
            <div><span className="text-slate-500 text-xs block">Rate</span> <span className="font-bold text-lg text-indigo-600">{metrics.extensions.approvalRate}%</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-72">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase">Task Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                {taskData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm h-72">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase">Team Productivity (Planned vs Actual)</h3>
          <div className="flex items-center justify-center h-full text-slate-400 pb-8">
            {/* Minimal mockup for team bar chart */}
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Instrumentation', planned: 120, actual: 110 },
                  { name: 'Numerical Analysis', planned: 90, actual: 95 },
                  { name: 'Data Analysis', planned: 150, actual: 130 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="planned" name="Planned Hours" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
