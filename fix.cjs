const fs = require('fs');
let c = fs.readFileSync('src/demo/data.ts', 'utf8');
c = c.replace(/\\\`/g, '\`').replace(/\\\$/g, '$');
fs.writeFileSync('src/demo/data.ts', c);
console.log('Fixed data');
