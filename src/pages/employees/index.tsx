import React from 'react';
import { useDemo } from '../../demo/DemoProvider';
import { DemoEmployeePanel } from '../../demo/DemoEmployeePanel';

export const EmployeesList: React.FC = () => {
  const { isDemoMode } = useDemo();

  if (isDemoMode) {
    return (
      <div className="space-y-6">
        <DemoEmployeePanel />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Employees</h2>
      <p className="text-slate-500">Employees list placeholder</p>
    </div>
  );
};
