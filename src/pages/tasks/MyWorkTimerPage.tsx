import React from 'react';
import { useDemo } from '../../demo/DemoProvider';
import { DemoActiveTask } from '../../demo/DemoActiveTask';

export const MyWorkTimerPage: React.FC = () => {
  const { isDemoMode } = useDemo();

  if (isDemoMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <DemoActiveTask />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">My Work Timer</h2>
      <p className="text-slate-500">Timer placeholder</p>
    </div>
  );
};
