const fs = require('fs');
let c = fs.readFileSync('src/demo/DemoEmployeeFeedback.tsx', 'utf8');
c = c.replace(/\\\${/g, '${');
c = c.replace(/\\`/g, '`');
fs.writeFileSync('src/demo/DemoEmployeeFeedback.tsx', c);
