# KDM SHM - REST API Documentation (Phases 10 & 11)

## Global Formats

**Success Response:**
\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`

---

## Security & Authentication

All API endpoints (except \`/api/health\`, \`/api/auth/login\`, and \`/api/auth/refresh\`) require a valid JWT Access Token passed in the \`Authorization\` header.

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**Rate Limiting:**
- Auth endpoints: Max 10 requests / 15 minutes.
- Global API: Max 100 requests / 15 minutes.

---

## 1. Authentication

### POST /api/auth/login
Authenticates a user and returns short-lived access and refresh tokens.
- **Body**: \`{ "email": "admin@shm.com", "password": "password123" }\`
- **Response**: \`accessToken\`, \`refreshToken\`, \`expiresIn\`, \`user\` profile.

### POST /api/auth/refresh
Refreshes an expired access token using a valid refresh token.
- **Body**: \`{ "refreshToken": "..." }\`

### POST /api/auth/logout
Invalidates the refresh token (Requires Auth).

### GET /api/auth/me
Returns the currently authenticated user's profile without the password hash (Requires Auth).

### POST /api/auth/change-password
Updates the authenticated user's password (Requires Auth).
- **Body**: \`{ "currentPassword": "...", "newPassword": "..." }\`

---

## 2. Protected Business APIs

*(All endpoints require \`Authorization: Bearer <token>\`)*

### Projects
- **GET /api/projects** - List projects (Scoping: Admin=All, HOD=Dept).
- **GET /api/projects/:id/bridges** - Get project and nested bridges.

### Tasks & Work Logs
- **GET /api/tasks** - List tasks (Scoping: Employee=Assigned, HOD=Dept, Admin=All).
- **POST /api/tasks/:id/start** - Start a task (Transactions, Activity Logs).
- **POST /api/work-logs/start** - Start a session (409 Conflict if employee has active session).

### Approvals & Rework
- **POST /api/extension-requests/:id/approve** - HOD approves an extension, altering effective deadline.
- **POST /api/tasks/:id/rework** - Initiates rework, generating activity and notification.

---

## 3. Error Codes
- \`400 BAD_REQUEST\` - Invalid body or query parameters.
- \`401 UNAUTHORIZED\` - Missing, invalid, or expired JWT.
- \`403 FORBIDDEN\` - Insufficient role permissions or department cross-access violation.
- \`404 NOT_FOUND\` - Resource does not exist.
- \`409 CONFLICT\` - Business rule violation (e.g., concurrent timers).
- \`422 VALIDATION_ERROR\` - Payload failed structural validation.
- \`429 RATE_LIMIT_EXCEEDED\` - Too many requests.
- \`500 INTERNAL_SERVER_ERROR\` - Backend failure (stack traces hidden).
