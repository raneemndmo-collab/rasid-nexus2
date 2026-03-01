# DOC-P1-001: API Contracts — Phase 1

## K6 Notification Service

### POST /notifications/send
Send a notification through one or more channels.

**Request Body:**
```json
{
  "recipientId": "uuid",
  "channels": ["email", "sms", "push", "in_app"],
  "subject": "string",
  "body": "string",
  "templateId": "string (optional)",
  "templateData": {},
  "metadata": {}
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "status": "sent",
  "channels": ["email", "sms", "push", "in_app"],
  "createdAt": "ISO8601"
}
```

### GET /notifications/:id
Retrieve notification by ID.

### GET /notifications?recipientId=&channel=&status=
List notifications with filters.

### POST /notifications/preferences
Set user notification preferences (opt-in/opt-out per channel).

### GET /notifications/preferences/:userId
Get user notification preferences.

---

## K7 Scheduler Service

### POST /scheduler/jobs
Create a scheduled job.

**Request Body:**
```json
{
  "name": "string",
  "type": "one_time | recurring",
  "cronExpression": "string (for recurring)",
  "scheduledAt": "ISO8601 (for one_time)",
  "handler": "string",
  "payload": {},
  "maxRetries": 3,
  "timeoutMs": 30000
}
```

**Response:** `201 Created`

### GET /scheduler/jobs/:id
Get job details.

### GET /scheduler/jobs?status=&type=
List jobs with filters.

### PATCH /scheduler/jobs/:id
Update job (pause, resume, cancel).

### DELETE /scheduler/jobs/:id
Delete a scheduled job.

---

## M5 Departments

### POST /departments
Create department.

**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "description": "string",
  "parentId": "uuid (optional)",
  "managerId": "uuid (optional)"
}
```

### GET /departments/:id
Get department by ID.

### GET /departments?parentId=&isActive=
List departments with filters.

### GET /departments/tree
Get full department hierarchy tree.

### PATCH /departments/:id
Update department.

### DELETE /departments/:id
Soft-delete department.

---

## M6 Employees

### POST /employees
Create employee profile.

**Request Body:**
```json
{
  "userId": "uuid",
  "employeeNumber": "string",
  "departmentId": "uuid",
  "position": "string",
  "hireDate": "date",
  "managerId": "uuid (optional)",
  "salary": "number (optional)",
  "workSchedule": "string (optional)"
}
```

### GET /employees/:id
Get employee by ID.

### GET /employees?departmentId=&status=&search=
List/search employees.

### PATCH /employees/:id
Update employee.

### DELETE /employees/:id
Deactivate employee.

---

## M7 Attendance

### POST /attendance/check-in
Record check-in.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "location": {"lat": 0, "lng": 0},
  "ipAddress": "string"
}
```

### POST /attendance/check-out
Record check-out.

### GET /attendance/:employeeId?from=&to=
Get attendance records by date range.

### GET /attendance/report?departmentId=&from=&to=
Generate attendance report.

---

## M8 Leave

### POST /leave/requests
Submit leave request.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "leaveType": "annual | sick | unpaid | maternity | paternity | bereavement | other",
  "startDate": "date",
  "endDate": "date",
  "reason": "string"
}
```

### PATCH /leave/requests/:id/approve
Approve leave request.

### PATCH /leave/requests/:id/reject
Reject leave request.

### GET /leave/requests?employeeId=&status=
List leave requests.

### GET /leave/balance/:employeeId?year=
Get leave balance.

### POST /leave/balance/initialize
Initialize leave balance for employee.
