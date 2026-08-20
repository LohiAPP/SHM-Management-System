
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/dashboard';
import { ProjectsList } from './pages/projects';
import { ProjectDetails } from './pages/projects/ProjectDetails';
import { BridgeDetails } from './pages/bridges';
import { TasksList } from './pages/tasks';
import { TaskDetails } from './pages/tasks/TaskDetails';
import { EmployeeDashboard } from './pages/employee';
import { EmployeesList } from './pages/employees';
import { ActivityLogPage } from './pages/activity';
import { ApprovalsPage } from './pages/approvals';
import { AdditionalTimePage } from './pages/tasks/AdditionalTimePage';
import { MyWorkTimerPage } from './pages/tasks/MyWorkTimerPage';
import { NotificationsPage } from './pages/notifications';
import { CalendarPage } from './pages/calendar';
import { ManagerDashboard } from './pages/manager';

import LoginPage from './pages/login';
import { AuthProvider } from './contexts/AuthContext';
import { DemoProvider } from './demo/DemoProvider';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DemoProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="manager" element={<ManagerDashboard />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:projectId" element={<ProjectDetails />} />
            <Route path="bridges/:bridgeId" element={<BridgeDetails />} />
            <Route path="tasks" element={<TasksList />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="employee" element={<EmployeeDashboard />} />
            <Route path="employees" element={<EmployeesList />} />
            <Route path="activity" element={<ActivityLogPage />} />
            <Route path="employees/:employeeId/activity" element={<ActivityLogPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="additional-time" element={<AdditionalTimePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="my-work-timer" element={<MyWorkTimerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
        </DemoProvider>
    </AuthProvider>
);
}

export default App;
