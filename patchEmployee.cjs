const fs = require('fs');
let c = fs.readFileSync('employee_temp.txt', 'utf8');

c = c.replace(
  "import { Play, Pause, CheckCircle2, AlertCircle, Clock, Briefcase, RotateCcw } from 'lucide-react';",
  "import { Play, Pause, CheckCircle2, AlertCircle, Clock, Briefcase, RotateCcw } from 'lucide-react';\nimport { useDemo } from '../../demo/DemoProvider';\nimport { DemoPerformanceSummary } from '../../demo/DemoPerformanceSummary';\nimport { DemoActiveTask } from '../../demo/DemoActiveTask';"
);

c = c.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();\n  const { isDemoMode } = useDemo();"
);

c = c.replace(
  /return \(\s*<div className="space-y-6">\s*<div className="flex justify-between items-end">/,
  `return (
    <div className="space-y-6">
      {isDemoMode && <DemoPerformanceSummary />}
      {isDemoMode && <DemoActiveTask />}
      <div className={isDemoMode ? 'hidden' : 'block space-y-6'}>
        <div className="flex justify-between items-end">`
);

c = c.replace(
  /<\/div>\s*<\/div>\s*\);\s*};/,
  `      </div>
      </div>
    </div>
  );
};`
);

fs.writeFileSync('src/pages/employee/index.tsx', c);
console.log('Employee index patched properly!');
