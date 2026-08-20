const fs = require('fs');
let c = fs.readFileSync('src/pages/login/index.tsx', 'utf8');

const replacement = `const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export default function LoginPage() {`;

c = c.replace("export default function LoginPage() {", replacement);

const demoUsers = `
          {isDemoMode && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4 text-center">Presentation Demo Mode Users</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  login('mock', 'mock', { id: 'manager', employeeId: 'manager', role: 'HOD_MANAGER', name: 'Demo Manager', departmentId: 'dept-1' });
                  navigate('/manager');
                }} className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm">
                  Log in as Manager
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
    </div>`;

c = c.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/, demoUsers + "\n  );\n}");

fs.writeFileSync('src/pages/login/index.tsx', c);
