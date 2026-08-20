import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, UserCog, HardHat } from 'lucide-react';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMockLogin = (role: 'ADMIN' | 'HOD_MANAGER' | 'EMPLOYEE') => {
    setIsLoading(true);
    
    // Create a mock user based on the selected role
    const mockUser = {
      id: `mock-${role}-id`,
      employeeId: `EMP-MOCK-${role}`,
      role: role,
      name: role === 'ADMIN' ? 'Admin User' : role === 'HOD_MANAGER' ? 'HOD Manager' : 'Site Worker',
      departmentId: 'dept-1'
    };

    // Simulate API delay
    setTimeout(() => {
      login('mock-jwt-token', 'mock-refresh-token', mockUser);
      
      if (role === 'ADMIN') navigate('/');
      else if (role === 'HOD_MANAGER') navigate('/manager');
      else navigate('/employee');
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          KDM SHM ERP
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Development Mode: Select a role to log in instantly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <div className="space-y-4">
            <button
              onClick={() => handleMockLogin('ADMIN')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Shield className="h-5 w-5 text-blue-600" />
              {isLoading ? 'Signing in...' : 'Login as Admin'}
            </button>

            <button
              onClick={() => handleMockLogin('HOD_MANAGER')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <UserCog className="h-5 w-5 text-indigo-600" />
              {isLoading ? 'Signing in...' : 'Login as Manager (HOD)'}
            </button>

            <button
              onClick={() => handleMockLogin('EMPLOYEE')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <HardHat className="h-5 w-5 text-emerald-600" />
              {isLoading ? 'Signing in...' : 'Login as Site Employee'}
            </button>
          
          {isDemoMode && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4 text-center">Presentation Demo Mode Users</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => {
                  login('mock', 'mock', { id: 'manager', employeeId: 'manager', role: 'HOD_MANAGER', name: 'Demo Manager', departmentId: 'dept-1' });
                  navigate('/manager');
                }} className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm">
                  Log in as Manager
                </button>
                <button onClick={() => {
                  login('mock', 'mock', { id: 'admin', employeeId: 'admin', role: 'ADMIN', name: 'Demo Admin', departmentId: 'dept-all' });
                  navigate('/dashboard');
                }} className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm">
                  Log in as Admin
                </button>
                <button onClick={() => {
                  login('mock', 'mock', { id: 'emp-s1', employeeId: 'emp-s1', role: 'EMPLOYEE', name: 'Ravi Kumar (SITE)', departmentId: 'dept-1' });
                  navigate('/dashboard');
                }} className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm">
                  Log in as Site Worker
                </button>
                <button onClick={() => {
                  login('mock', 'mock', { id: 'emp-o2', employeeId: 'emp-o2', role: 'EMPLOYEE', name: 'Anil Kumar (OFF)', departmentId: 'dept-1' });
                  navigate('/dashboard');
                }} className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm">
                  Log in as Office Worker
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
</div>
  );
}