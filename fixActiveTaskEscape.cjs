const fs = require('fs');
let c = fs.readFileSync('src/demo/DemoActiveTask.tsx', 'utf8');
c = c.replace(/\\\${/g, '${');
c = c.replace(/\\`/g, '`');
fs.writeFileSync('src/demo/DemoActiveTask.tsx', c);
