import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import { useRole } from '../../context/RoleContext';
import type { AppNotification } from '../../types';
import { Bell, Check, CheckCircle2, AlertCircle, Clock, FileText, Briefcase, RotateCcw } from 'lucide-react';

const getNotificationIcon = (type: string) => {
  if (type.includes('EXTENSION')) return <Clock size={16} className="text-amber-500" />;
  if (type.includes('DOCUMENT')) return <FileText size={16} className="text-indigo-500" />;
  if (type.includes('REWORK') || type.includes('REJECTED')) return <RotateCcw size={16} className="text-red-500" />;
  if (type.includes('ASSIGNED')) return <Briefcase size={16} className="text-blue-500" />;
  if (type.includes('APPROVED')) return <CheckCircle2 size={16} className="text-emerald-500" />;
  return <AlertCircle size={16} className="text-slate-500" />;
};

export const NotificationsPage: React.FC = () => {
  const { currentEmployeeId } = useRole();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = async () => {
    const notifs = await DataService.getNotifications(currentEmployeeId);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();
  }, [currentEmployeeId]);

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await DataService.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await DataService.markAllNotificationsRead(currentEmployeeId);
    loadNotifications();
  };

  const handleClick = (notif: AppNotification) => {
    if (!notif.read) handleMarkRead(notif.id);
    if (notif.taskId) navigate(`/tasks/${notif.taskId}`);
    else if (notif.bridgeId) navigate(`/bridges/${notif.bridgeId}`);
    else if (notif.projectId) navigate(`/projects/${notif.projectId}`);
  };

  const displayed = filter === 'UNREAD' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="text-indigo-600" /> Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your alerts, assignments, and updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'ALL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
            <button onClick={() => setFilter('UNREAD')} className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Unread</button>
          </div>
          <button onClick={handleMarkAllRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
            <Check size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {displayed.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {displayed.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 flex gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                onClick={() => handleClick(notif)}
              >
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{notif.title}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="flex items-center">
                    <button 
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="w-3 h-3 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                      title="Mark as read"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-700">No notifications</h3>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};
