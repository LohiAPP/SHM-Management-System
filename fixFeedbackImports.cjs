const fs = require('fs');
let c = fs.readFileSync('src/demo/DemoEmployeeFeedback.tsx', 'utf8');
c = c.replace(
  "import { DemoDelayReview, DemoTask } from './types';",
  "import type { DemoDelayReview, DemoTask } from './types';"
);
fs.writeFileSync('src/demo/DemoEmployeeFeedback.tsx', c);
