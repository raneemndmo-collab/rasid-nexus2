# DOC-P3-002: Phase 3 API Contracts

**Version:** 1.0.0  
**Phase:** 3 — Integration & Collaboration  
**Date:** 2026-03-01  

---

## M15 Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/workflows/definitions` | Create workflow definition |
| GET | `/api/v1/workflows/definitions` | List workflow definitions |
| GET | `/api/v1/workflows/definitions/:id` | Get workflow definition |
| PUT | `/api/v1/workflows/definitions/:id` | Update workflow definition |
| PUT | `/api/v1/workflows/definitions/:id/activate` | Activate workflow |
| DELETE | `/api/v1/workflows/definitions/:id` | Delete workflow definition |
| POST | `/api/v1/workflows/executions` | Start workflow execution |
| GET | `/api/v1/workflows/executions` | List executions |
| GET | `/api/v1/workflows/executions/:id` | Get execution details |
| GET | `/api/v1/workflows/executions/:id/logs` | Get execution logs |

### Workflow Definition Schema
```json
{
  "name": "string (required)",
  "description": "string",
  "trigger_type": "manual | event | scheduled",
  "steps": [
    {
      "name": "string",
      "type": "action | condition | parallel",
      "config": {},
      "nextOnSuccess": "number",
      "nextOnFailure": "number"
    }
  ]
}
```

---

## M16 Form Builder

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/forms/definitions` | Create form definition |
| GET | `/api/v1/forms/definitions` | List form definitions |
| GET | `/api/v1/forms/definitions/:id` | Get form definition |
| PUT | `/api/v1/forms/definitions/:id` | Update form definition |
| PUT | `/api/v1/forms/definitions/:id/publish` | Publish form |
| DELETE | `/api/v1/forms/definitions/:id` | Delete form definition |
| POST | `/api/v1/forms/submissions` | Submit form |
| GET | `/api/v1/forms/submissions` | List submissions |
| GET | `/api/v1/forms/submissions/:id` | Get submission |

### Form Field Schema
```json
{
  "name": "string",
  "type": "text | email | number | select | date | file",
  "required": "boolean",
  "validation": {
    "minLength": "number",
    "maxLength": "number",
    "pattern": "string (regex)",
    "min": "number",
    "max": "number"
  },
  "options": ["string"] 
}
```

---

## M17 OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ocr/jobs` | Create OCR job |
| POST | `/api/v1/ocr/jobs/:id/process` | Process OCR job (via M11 IVisionAnalysis) |
| GET | `/api/v1/ocr/jobs` | List OCR jobs |
| GET | `/api/v1/ocr/jobs/:id` | Get OCR job result |

### AI Integration
- **Provider:** M11 IVisionAnalysis ONLY (SA-003 compliant)
- **Capabilities:** Text extraction, table detection, layout analysis
- **No direct AI library imports**

---

## M18 Dashboards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/dashboards` | Create dashboard |
| GET | `/api/v1/dashboards` | List dashboards |
| GET | `/api/v1/dashboards/:id` | Get dashboard with widgets |
| PUT | `/api/v1/dashboards/:id` | Update dashboard |
| DELETE | `/api/v1/dashboards/:id` | Delete dashboard |
| POST | `/api/v1/dashboards/:id/widgets` | Add widget |
| PUT | `/api/v1/dashboards/:id/widgets/:wid` | Update widget |
| DELETE | `/api/v1/dashboards/:id/widgets/:wid` | Remove widget |
| POST | `/api/v1/dashboards/:id/insights` | Generate AI insights (via M11) |

### Widget Types
`chart`, `table`, `kpi`, `map`, `timeline`, `pie`, `bar`, `line`, `gauge`, `list`

---

## M19 Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/calendar/events` | Create event |
| GET | `/api/v1/calendar/events` | List events (supports date range filter) |
| GET | `/api/v1/calendar/events/:id` | Get event |
| PUT | `/api/v1/calendar/events/:id` | Update event |
| DELETE | `/api/v1/calendar/events/:id` | Delete event |

---

## M20 Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/messages/threads` | Create thread |
| GET | `/api/v1/messages/threads` | List threads |
| GET | `/api/v1/messages/threads/:id` | Get thread with messages |
| POST | `/api/v1/messages/threads/:id/messages` | Send message |
| PUT | `/api/v1/messages/threads/:id/messages/:mid` | Edit message |
| DELETE | `/api/v1/messages/threads/:id/messages/:mid` | Delete message |

---

## M21 Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks` | List tasks (supports status/assignee filter) |
| GET | `/api/v1/tasks/:id` | Get task |
| PUT | `/api/v1/tasks/:id` | Update task |
| PUT | `/api/v1/tasks/:id/status` | Change task status |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| POST | `/api/v1/tasks/:id/comments` | Add comment |
| GET | `/api/v1/tasks/:id/comments` | List comments |

---

## M22 Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects` | List projects |
| GET | `/api/v1/projects/:id` | Get project |
| PUT | `/api/v1/projects/:id` | Update project |
| PUT | `/api/v1/projects/:id/archive` | Archive project |
| DELETE | `/api/v1/projects/:id` | Delete project |
| POST | `/api/v1/projects/:id/members` | Add member |
| DELETE | `/api/v1/projects/:id/members/:uid` | Remove member |

---

## M23 Collaboration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/collaboration/sessions` | Create session |
| GET | `/api/v1/collaboration/sessions` | List sessions |
| GET | `/api/v1/collaboration/sessions/:id` | Get session |
| POST | `/api/v1/collaboration/sessions/:id/changes` | Submit change (OT) |
| GET | `/api/v1/collaboration/sessions/:id/changes` | Get changes |
| PUT | `/api/v1/collaboration/sessions/:id/presence` | Update presence |
| GET | `/api/v1/collaboration/sessions/:id/presence` | Get presence |
| DELETE | `/api/v1/collaboration/sessions/:id` | Close session |

### Operational Transform (OT) Change Schema
```json
{
  "user_id": "uuid",
  "operation_type": "insert | delete | replace | move",
  "path": "string (JSON pointer)",
  "value": "any",
  "base_version": "number"
}
```
