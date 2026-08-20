const fs = require('fs');
let c = fs.readFileSync('src/demo/DemoProvider.tsx', 'utf8');
c = c.replace("const { DemoDataService } = require('./DemoDataService');\n              DemoDataService.resetDemoData();", "import('./DemoDataService').then(m => m.DemoDataService.resetDemoData());");
fs.writeFileSync('src/demo/DemoProvider.tsx', c);
