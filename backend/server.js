require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } }
});
app.use('/api/', globalLimiter);
app.use(express.json({ limit: '10mb' }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { server: 'ok', database: 'ok' } });
});

const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/authenticate');
const authRoutes = require('./routes/auth');

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes
const ProjectRoutes = require('./routes/projects');
const BridgeRoutes = require('./routes/bridges');
const WorkflowStageRoutes = require('./routes/workflow-stages');
const TaskRoutes = require('./routes/tasks');
const EmployeeRoutes = require('./routes/employees');
const TeamRoutes = require('./routes/teams');
const WorkLogRoutes = require('./routes/work-logs');
const WorkUpdateRoutes = require('./routes/work-updates');
const ExtensionRequestRoutes = require('./routes/extension-requests');
const ReworkHistoryRoutes = require('./routes/rework-historys');
const StageApprovalRoutes = require('./routes/stage-approvals');
const ClientApprovalRoutes = require('./routes/client-approvals');
const DocumentRoutes = require('./routes/documents');
const NotificationRoutes = require('./routes/notifications');
const ActivityLogRoutes = require('./routes/activity-logs');

// Apply authentication middleware to all standard API routes
app.use('/api/projects', authenticate, ProjectRoutes);
app.use('/api/bridges', authenticate, BridgeRoutes);
app.use('/api/workflow-stages', authenticate, WorkflowStageRoutes);
app.use('/api/tasks', authenticate, TaskRoutes);
app.use('/api/employees', authenticate, EmployeeRoutes);
app.use('/api/teams', authenticate, TeamRoutes);
app.use('/api/work-logs', authenticate, WorkLogRoutes);
app.use('/api/work-updates', authenticate, WorkUpdateRoutes);
app.use('/api/extension-requests', authenticate, ExtensionRequestRoutes);
app.use('/api/rework-history', authenticate, ReworkHistoryRoutes);
app.use('/api/stage-approvals', authenticate, StageApprovalRoutes);
app.use('/api/client-approvals', authenticate, ClientApprovalRoutes);
app.use('/api/documents', authenticate, DocumentRoutes);
app.use('/api/notifications', authenticate, NotificationRoutes);
app.use('/api/activity-logs', authenticate, ActivityLogRoutes);

// Global Error Handler
app.use(errorHandler);

// Sync database and start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
