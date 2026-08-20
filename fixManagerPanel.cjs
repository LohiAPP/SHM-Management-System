const fs = require('fs');
let c = fs.readFileSync('src/pages/manager/index.tsx', 'utf8');

c = c.replace(
  "import { DemoManagerReviews } from '../../demo/DemoManagerReviews';",
  "import { DemoManagerReviews } from '../../demo/DemoManagerReviews';\nimport { DemoEmployeePanel } from '../../demo/DemoEmployeePanel';"
);

c = c.replace(
  "{isDemoMode && <DemoManagerReviews />}",
  "{isDemoMode && <DemoEmployeePanel />}\n        {isDemoMode && <DemoManagerReviews />}"
);

fs.writeFileSync('src/pages/manager/index.tsx', c);
