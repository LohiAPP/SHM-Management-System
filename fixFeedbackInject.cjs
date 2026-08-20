const fs = require('fs');
let c = fs.readFileSync('src/pages/employee/index.tsx', 'utf8');

c = c.replace(
  "import { DemoActiveTask } from '../../demo/DemoActiveTask';",
  "import { DemoActiveTask } from '../../demo/DemoActiveTask';\nimport { DemoEmployeeFeedback } from '../../demo/DemoEmployeeFeedback';"
);

c = c.replace(
  "{isDemoMode && <DemoActiveTask />}",
  "{isDemoMode && <DemoActiveTask />}\n      {isDemoMode && <DemoEmployeeFeedback />}"
);

fs.writeFileSync('src/pages/employee/index.tsx', c);
