const fs = require('fs');
let c = fs.readFileSync('src/demo/DemoPerformanceSummary.tsx', 'utf8');
c = c.replace("import { useDemo } from './DemoProvider';\n", "");
c = c.replace("import { DemoDataService, DemoPerformanceService }", "import { DemoPerformanceService }");
c = c.replace("import type { DemoTask, DemoPerformanceRecord, DemoWorkLog, DemoDelayReview } from './types';\n", "import type { DemoPerformanceRecord } from './types';\n");
c = c.replace("import { CheckCircle2, AlertCircle, Clock, Check, X } from 'lucide-react';\n", "");
c = c.replace("import { useAuth } from '../contexts/AuthContext';\n", "");
fs.writeFileSync('src/demo/DemoPerformanceSummary.tsx', c);

let d = fs.readFileSync('src/demo/DemoProvider.tsx', 'utf8');
d = d.replace("import React, { createContext, useContext, useEffect, useState }", "import React, { createContext, useContext }");
fs.writeFileSync('src/demo/DemoProvider.tsx', d);

let e = fs.readFileSync('src/demo/data.ts', 'utf8');
e = e.replace("const tomorrowStr = tomorrow.toISOString().split('T')[0];\n", "");
fs.writeFileSync('src/demo/data.ts', e);
