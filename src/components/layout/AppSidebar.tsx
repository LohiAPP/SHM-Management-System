import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CheckSquare, Users, Activity, CheckCircle, Clock, Timer, Calendar } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const AppSidebar: React.FC = () => {
  const { role } = useRole();

  const navItems = [
    { to: role === 'ADMIN' ? '/' : role === 'MANAGER' || role === 'HOD' ? '/manager' : '/employee', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'TECHNICIAN'] },
    { to: '/projects', icon: <Briefcase size={20} />, label: 'Projects', roles: ['ADMIN', 'HOD', 'MANAGER'] },
    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks', roles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'TECHNICIAN'] },
    { to: '/employees', icon: <Users size={20} />, label: 'Employees', roles: ['ADMIN', 'HOD', 'MANAGER'] },
    { to: '/activity', icon: <Activity size={20} />, label: 'Activity', roles: ['ADMIN', 'HOD', 'MANAGER'] },
    { to: '/approvals', icon: <CheckCircle size={20} />, label: 'Approvals', roles: ['ADMIN', 'HOD', 'MANAGER'] },
    { to: '/calendar', icon: <Calendar size={20} />, label: 'Calendar', roles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'TECHNICIAN'] },
    { to: '/additional-time', icon: <Clock size={20} />, label: 'Additional Time', roles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'TECHNICIAN'] },
    { to: '/my-work-timer', icon: <Timer size={20} />, label: 'My Work Timer', roles: ['EMPLOYEE', 'ENGINEER', 'TECHNICIAN'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 bg-slate-950 text-white font-bold text-lg tracking-tight">
        KDM SHM
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
        v1.0.0-prototype
      </div>
    </aside>
  );
};
