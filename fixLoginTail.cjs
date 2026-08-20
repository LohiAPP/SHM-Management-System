const fs = require('fs');
let c = fs.readFileSync('src/pages/login/index.tsx', 'utf8');
c = c.replace(/  \);\n}\n<\/div><\/div><\/div>\n  \);\n}/, '</div>\n  );\n}');
fs.writeFileSync('src/pages/login/index.tsx', c);
