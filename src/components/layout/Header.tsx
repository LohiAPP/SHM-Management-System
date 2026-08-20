import React, { useEffect, useState } from 'react';
import { useRole } from '../../context/RoleContext';
import type { EmployeeRole } from '../../types';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';

export const Header: React.FC = () => {
  const { role, setRole, currentEmployeeId } = useRole();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifs = await DataService.getUnreadNotifications(currentEmployeeId);
      setUnreadCount(notifs.filter((n: any) => !n.read).length);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentEmployeeId]);

  const roles: EmployeeRole[] = ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE', 'ENGINEER', 'TECHNICIAN'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-slate-800">SHM Management System</h1>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 font-medium">Role Demo:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as EmployeeRole)}
            className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <button onClick={() => navigate('/notifications')} className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center">{unreadCount}</span>}
        </button>
        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {role.charAt(0)}
        </div>
      </div>
    </header>
  );
};
