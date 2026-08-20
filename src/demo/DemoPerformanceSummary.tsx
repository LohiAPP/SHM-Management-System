import React, { useEffect, useState } from 'react';
import { DemoPerformanceService } from './DemoDataService';
import type { DemoPerformanceRecord } from './types';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../contexts/AuthContext';

export const DemoPerformanceSummary: React.FC = () => {
  const { currentEmployeeId } = useRole();
  const { currentUser } = useAuth();
  const [record, setRecord] = useState<DemoPerformanceRecord | null>(null);

  const rawId = currentUser?.employeeId || currentEmployeeId;
  const activeId = ['emp-1', 'admin', 'manager', 'EMP-MOCK-ADMIN', 'EMP-MOCK-HOD_MANAGER'].includes(rawId) ? 'emp-s1' : rawId;

  useEffect(() => {
    if (activeId) {
      DemoPerformanceService.getPerformanceRecord(activeId).then(setRecord);
    }
  }, [activeId]);

  if (!record) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">My Work & Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
          <div className="text-3xl font-bold text-slate-700">{record.onTimeTasks}</div>
          <div className="text-xs text-slate-500 uppercase font-semibold mt-1">On-Time Completion</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center border border-orange-100">
          <div className="text-3xl font-bold text-orange-600">{record.delayedTasks}</div>
          <div className="text-xs text-orange-600 uppercase font-semibold mt-1">Delayed</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
          <div className="text-3xl font-bold text-emerald-600">{record.acceptedDelays}</div>
          <div className="text-xs text-emerald-600 uppercase font-semibold mt-1">Accepted Delays</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
          <div className="text-3xl font-bold text-red-600">{record.rejectedDelays}</div>
          <div className="text-xs text-red-600 uppercase font-semibold mt-1">Rejected Delays</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-center border border-red-200">
          <div className="text-3xl font-bold text-red-700">{record.negativePoints}</div>
          <div className="text-xs text-red-700 uppercase font-bold mt-1">Negative Impact</div>
        </div>
      </div>
    </div>
  );
};
