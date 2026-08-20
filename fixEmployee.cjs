const fs = require('fs');
const content = fs.readFileSync('src/pages/employee/index.tsx', 'utf8');

// Replace everything inside the main return block.
let newContent = content.replace(
  /return \(\s*<div className="space-y-6">([\s\S]*?)};\n$/m,
  (match, inner) => {
    // Strip out the broken demo mode wrappers we tried to inject
    let clean = inner
      .replace(/\{isDemoMode && <DemoPerformanceSummary \/>\}/g, '')
      .replace(/\{isDemoMode && <DemoActiveTask \/>\}/g, '')
      .replace(/\{!isDemoMode && \(/g, '')
      .replace(/<>\s*<div className="flex justify-between items-end">/g, '<div className="flex justify-between items-end">')
      .replace(/<\/div>\s*<\/div>\s*<\/>\s*\)}\s*<\/div>/, '</div>\n      </div>\n    </div>')
      .replace(/<\/div>\s*<\/div>\s*\)}\s*<\/div>/, '</div>\n      </div>\n    </div>');
      
    // Rebuild it correctly
    return `return (
    <div className="space-y-6">
      {isDemoMode && <DemoPerformanceSummary />}
      {isDemoMode && <DemoActiveTask />}
      <div className={isDemoMode ? 'hidden' : 'block space-y-6'}>
${clean}
      </div>
    </div>
  );
};
`;
  }
);

fs.writeFileSync('src/pages/employee/index.tsx', newContent);
console.log('Fixed EmployeeDashboard JSX');
