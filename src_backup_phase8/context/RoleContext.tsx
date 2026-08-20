import React, { createContext, useContext, useState } from 'react';
import type { EmployeeRole } from '../types';

interface RoleContextType {
  role: EmployeeRole;
  currentEmployeeId: string;
  setRole: (role: EmployeeRole) => void;
  setCurrentEmployeeId: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<EmployeeRole>('ADMIN');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp-1');

  return (
    <RoleContext.Provider value={{ role, setRole, currentEmployeeId, setCurrentEmployeeId }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
