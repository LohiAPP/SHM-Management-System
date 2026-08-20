const fs = require('fs');
let c = fs.readFileSync('src/pages/login/index.tsx', 'utf8');

c = c.replace(
  "Log in as Manager\n                </button>",
  "Log in as Manager\n                </button>\n                <button onClick={() => {\n                  login('mock', 'mock', { id: 'admin', employeeId: 'admin', role: 'ADMIN', name: 'Demo Admin', departmentId: 'dept-all' });\n                  navigate('/dashboard');\n                }} className=\"bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-bold text-xs shadow-sm\">\n                  Log in as Admin\n                </button>"
);

c = c.replace("grid-cols-2", "grid-cols-2 md:grid-cols-4");

fs.writeFileSync('src/pages/login/index.tsx', c);
