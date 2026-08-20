# KDM SHM - Authorization & RBAC Matrix

## Application Roles
The ERP normalizes business titles into three rigid security roles:
1. **ADMIN**: Organization-wide system administrator.
2. **HOD_MANAGER**: Department-scoped operational leader (Heads of Department & Managers).
3. **EMPLOYEE**: Task-scoped execution personnel (Engineers, Technicians, Site Workers).

## Authorization Matrix

| Resource | ADMIN | HOD_MANAGER (Dept Scoped) | EMPLOYEE (Task Scoped) |
|---|---|---|---|
| **Users** | CRUD (All) | No Access | No Access |
| **Projects** | CRUD (All) | View/Manage (Own Dept) | View (Related to assigned tasks) |
| **Bridges** | CRUD (All) | View/Manage (Own Dept) | View (Related to assigned tasks) |
| **Tasks** | View/Manage (All) | Manage (Own Dept) | Execute (Only Assigned) |
| **Task Assignment** | Manage | Manage (Own Dept) | No Access |
| **Work Logs** | View (All) | View (Own Dept) | Manage (Only Own) |
| **Work Updates**| View (All) | View/Manage (Own Dept)| Manage (Only Own Assigned) |
| **Extensions** | View (All) | Approve/Reject (Own Dept)| Request (Only Own Assigned) |
| **Approvals** | View (All) | Manage (Own Dept) | View (Related) |
| **Rework** | View (All) | Initiate/Review (Own Dept)| View (Assigned) |
| **Documents** | View/Manage (All) | View/Manage (Own Dept)| View/Upload (Related) |
| **Notifications**| View (All) | View (Own/Dept) | View (Own) |
| **Activity Logs**| View (All) | View (Own Dept) | View (Relevant) |

## Security Rules

### 1. Department Scoping (HOD_MANAGER)
When a user with the \`HOD_MANAGER\` role issues an API request, the authorization middleware (\`requireDepartmentAccess\`) enforces that the \`department_id\` of the target resource matches the \`department_id\` attached to the manager's internal \`Employee\` record. 
- *A Manager from Department A receives a \`403 FORBIDDEN\` when attempting to access a Project in Department B.*

### 2. Resource Ownership (EMPLOYEE)
Employees cannot view the entire department's task list. The controllers filter queries by ensuring \`task_employees.employee_id\` equals the authenticated user's \`employeeId\`.
- *An Employee cannot pause another Employee's work log.*
- *An Employee cannot approve their own Extension Request.*

### 3. Separation of Identity
The `User` schema handles authentication (Passwords, JWTs), while the `Employee` schema handles HR/Operations (Departments, Teams). Admins may have a \`User\` record with a \`null\` \`employee_id\` to prevent them from accidentally acting as field operators.
