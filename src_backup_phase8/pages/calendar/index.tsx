import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../../services/mock/dataService';
import { useRole } from '../../context/RoleContext';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { role, currentEmployeeId } = useRole();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      let tasks = await DataService.getTasks();
      const exts = await DataService.getTimeRequests();
      
      if (role === 'ENGINEER' || role === 'TECHNICIAN') {
        tasks = tasks.filter(t => t.assignedEmployeeIds.includes(currentEmployeeId));
      }

      const generatedEvents = tasks.map(t => ({
        id: t.id,
        title: t.title,
        date: t.deadline.split('T')[0],
        type: 'TASK_DEADLINE',
        task: t
      }));

      // Find effective deadlines from approved extensions
      exts.filter(e => e.decision === 'APPROVED').forEach(e => {
        const tIdx = generatedEvents.findIndex(ev => ev.id === e.taskId);
        if (tIdx > -1) {
          // Adjust date (mock simplification)
          const d = new Date(generatedEvents[tIdx].date);
          d.setDate(d.getDate() + (e.approvedAdditionalTime || 0));
          generatedEvents[tIdx].date = d.toISOString().split('T')[0];
        }
      });

      setEvents(generatedEvents);
    };
    loadEvents();
  }, [role, currentEmployeeId]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" /> Operations Calendar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Schedule and deadlines for projects and tasks.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-slate-200 rounded text-slate-700">Today</button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r last:border-r-0 border-slate-200">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-200 gap-px">
          {padding.map(p => (
            <div key={`pad-${p}`} className="bg-slate-50/50" />
          ))}
          {days.map(day => {
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth()+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div key={day} className={`bg-white p-2 flex flex-col transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/10' : ''}`}>
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                  {day}
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={() => navigate(`/tasks/${ev.task.id}`)}
                      className={`text-[10px] p-1 rounded cursor-pointer truncate border ${
                        ev.task.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        ev.task.status === 'DELAYED' || ev.task.status === 'OVERDUE' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Fill remaining cells */}
          {Array.from({ length: (7 - ((daysInMonth + firstDay) % 7)) % 7 }).map((_, i) => (
            <div key={`end-${i}`} className="bg-slate-50/50" />
          ))}
        </div>
      </div>
    </div>
  );
};
