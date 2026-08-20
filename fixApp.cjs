const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  "import { AuthProvider } from './contexts/AuthContext';",
  "import { AuthProvider } from './contexts/AuthContext';\nimport { DemoProvider } from './demo/DemoProvider';"
);

c = c.replace(
  "<AuthProvider>",
  "<AuthProvider>\n      <DemoProvider>"
);

c = c.replace(
  "</AuthProvider>",
  "      </DemoProvider>\n    </AuthProvider>"
);

fs.writeFileSync('src/App.tsx', c);
