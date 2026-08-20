const fs = require('fs');
let c = fs.readFileSync('src/pages/manager/index.tsx', 'utf8');

c = c.replace(
  "import { Users, Briefcase, Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';",
  "import { Users, Briefcase, Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';\nimport { useDemo } from '../../demo/DemoProvider';\nimport { DemoManagerReviews } from '../../demo/DemoManagerReviews';"
);

c = c.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();\n  const { isDemoMode } = useDemo();"
);

c = c.replace(
  /<h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">/,
  `{isDemoMode && <DemoManagerReviews />}\n        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">`
);

fs.writeFileSync('src/pages/manager/index.tsx', c);
