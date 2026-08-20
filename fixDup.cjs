const fs = require('fs');
let c = fs.readFileSync('src/pages/employee/index.tsx', 'utf8');
const dupImport = "import { useDemo } from '../../demo/DemoProvider';\nimport { DemoPerformanceSummary } from '../../demo/DemoPerformanceSummary';\nimport { DemoActiveTask } from '../../demo/DemoActiveTask';\n";
while (c.indexOf(dupImport) !== c.lastIndexOf(dupImport)) {
  c = c.replace(dupImport, '');
}
const dupIsDemoMode = "  const { isDemoMode } = useDemo();\n";
while (c.indexOf(dupIsDemoMode) !== c.lastIndexOf(dupIsDemoMode)) {
  c = c.replace(dupIsDemoMode, '');
}
fs.writeFileSync('src/pages/employee/index.tsx', c);
