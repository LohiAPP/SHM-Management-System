const fs = require('fs');
const path = require('path');

const resources = [
  { name: 'Project', route: 'projects' },
  { name: 'Bridge', route: 'bridges' },
  { name: 'WorkflowStage', route: 'workflow-stages' },
  { name: 'Task', route: 'tasks' },
  { name: 'Employee', route: 'employees' },
  { name: 'Team', route: 'teams' },
  { name: 'WorkLog', route: 'work-logs' },
  { name: 'WorkUpdate', route: 'work-updates' },
  { name: 'ExtensionRequest', route: 'extension-requests' },
  { name: 'ReworkHistory', route: 'rework-history' },
  { name: 'StageApproval', route: 'stage-approvals' },
  { name: 'ClientApproval', route: 'client-approvals' },
  { name: 'Document', route: 'documents' },
  { name: 'Notification', route: 'notifications' },
  { name: 'ActivityLog', route: 'activity-logs' }
];

const backendDir = __dirname;
let routeRequires = '';
let routeMounts = '';

resources.forEach(res => {
  // 1. Generate Controller
const controllerCode = \`
const db = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Add filtering based on query params here...
    const data = await db.\${res.name}.findAndCountAll({ limit, offset });
    
    res.json({
      success: true,
      data: data.rows,
      pagination: {
        page, limit, total: data.count, totalPages: Math.ceil(data.count / limit)
      }
    });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await db.\${res.name}.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '\${res.name} not found' }});
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await db.\${res.name}.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await db.\${res.name}.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '\${res.name} not found' }});
    await data.update(req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await db.\${res.name}.findByPk(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '\${res.name} not found' }});
    await data.destroy();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) { next(error); }
};
\`;
  fs.writeFileSync(path.join(backendDir, 'controllers', \`\${res.name}Controller.js\`), controllerCode);

  // 2. Generate Route
  const routeCode = \`
const express = require('express');
const router = express.Router();
const \${res.name}Controller = require('../controllers/\${res.name}Controller');

router.get('/', \${res.name}Controller.getAll);
router.get('/:id', \${res.name}Controller.getById);
router.post('/', \${res.name}Controller.create);
router.put('/:id', \${res.name}Controller.update);
router.delete('/:id', \${res.name}Controller.delete);

module.exports = router;
\`;
  fs.writeFileSync(path.join(backendDir, 'routes', \`\${res.route}.js\`), routeCode);

  routeRequires += \`const \${res.name}Routes = require('./routes/\${res.route}');\\n\`;
  routeMounts += \`app.use('/api/\${res.route}', \${res.name}Routes);\\n\`;
});

// Update server.js
let serverCode = fs.readFileSync(path.join(backendDir, 'server.js'), 'utf8');
serverCode = serverCode.replace('// Sync database and start server', \`
const errorHandler = require('./middleware/errorHandler');

\${routeRequires}

\${routeMounts}

app.use(errorHandler);

// Sync database and start server\`);

fs.writeFileSync(path.join(backendDir, 'server.js'), serverCode);

console.log('API routes and controllers generated.');
