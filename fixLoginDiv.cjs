const fs = require('fs');
let c = fs.readFileSync('src/pages/login/index.tsx', 'utf8');
c = c + "</div></div></div>\n  );\n}";
fs.writeFileSync('src/pages/login/index.tsx', c);
