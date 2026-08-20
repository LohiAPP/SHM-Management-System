import React, { createContext, useContext } from 'react';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

interface DemoContextType {
  isDemoMode: boolean;
}

const DemoContext = createContext<DemoContextType>({ isDemoMode: false });

export const useDemo = () => useContext(DemoContext);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DemoContext.Provider value={{ isDemoMode }}>
      {isDemoMode && (
        <div className="bg-amber-100 text-amber-900 px-4 py-1 text-center text-xs font-bold uppercase tracking-wider fixed top-0 w-full z-[9999] shadow-sm flex justify-between items-center">
          <span>DEMO MODE — Accountability Presentation</span>
          <button 
            onClick={() => {
              import('./DemoDataService').then(m => m.DemoDataService.resetDemoData());
            }}
            className="bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded text-[10px] transition-colors"
          >
            Reset Demo
          </button>
        </div>
      )}
      <div className={isDemoMode ? 'pt-6' : ''}>
        {children}
      </div>
    </DemoContext.Provider>
  );
};
