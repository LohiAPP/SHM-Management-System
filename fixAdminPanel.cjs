const fs = require('fs');
let c = fs.readFileSync('src/pages/dashboard/index.tsx', 'utf8');

c = c.replace(
  "import { LayoutDashboard, Users, Briefcase, Activity, Building, Clock } from 'lucide-react';",
  "import { LayoutDashboard, Users, Briefcase, Activity, Building, Clock } from 'lucide-react';\nimport { useDemo } from '../../demo/DemoProvider';\nimport { DemoEmployeePanel } from '../../demo/DemoEmployeePanel';"
);

c = c.replace(
  "export const Dashboard: React.FC = () => {\n  const [metrics, setMetrics] = useState<any>(null);",
  "export const Dashboard: React.FC = () => {\n  const { isDemoMode } = useDemo();\n  const [metrics, setMetrics] = useState<any>(null);"
);

c = c.replace(
  /<div className="flex justify-between items-center mb-8">/,
  "{isDemoMode && <DemoEmployeePanel />}\n      <div className=\"flex justify-between items-center mb-8\">"
);

fs.writeFileSync('src/pages/dashboard/index.tsx', c);
