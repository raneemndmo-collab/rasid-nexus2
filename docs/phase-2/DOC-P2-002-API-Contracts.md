# DOC-P2-002: API Contracts — Phase 2 Modules

**Version:** 1.0.0  
**Phase:** 2  
**Generated:** 2026-03-01  

---

## K8 Storage Service

### POST /api/k8/storage/objects
Upload a new object to storage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID | Yes | Tenant identifier |
| bucket | string | Yes | Storage bucket name |
| key | string | Yes | Object key (unique within bucket) |
| content_type | string | Yes | MIME type |
| data | Buffer | Yes | Object binary data |
| metadata | JSON | No | Custom metadata |

**Response:** `201 Created` — `{ id, bucket, key, size, checksum, created_at }`

### GET /api/k8/storage/objects/:id
Retrieve object metadata and download URL.

**Response:** `200 OK` — `{ id, bucket, key, size, content_type, checksum, metadata, created_at }`

### DELETE /api/k8/storage/objects/:id
Delete an object.

**Response:** `204 No Content`

### GET /api/k8/storage/objects?bucket=&prefix=&limit=&offset=
List objects with pagination.

**Response:** `200 OK` — `{ items: [...], total, limit, offset }`

### GET /api/k8/storage/quota
Get tenant storage quota usage.

**Response:** `200 OK` — `{ used_bytes, max_bytes, object_count }`

---

## K9 Monitoring Service

### POST /api/k9/monitoring/metrics
Record a metric.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID | Yes | Tenant identifier |
| name | string | Yes | Metric name |
| value | number | Yes | Metric value |
| labels | JSON | No | Key-value labels |

**Response:** `201 Created`

### GET /api/k9/monitoring/metrics?name=&from=&to=
Query metrics with time range.

**Response:** `200 OK` — `{ metrics: [...] }`

### POST /api/k9/monitoring/alerts
Create an alert rule.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID | Yes | Tenant identifier |
| name | string | Yes | Alert name |
| metric_name | string | Yes | Metric to monitor |
| condition | string | Yes | Alert condition (gt, lt, eq) |
| threshold | number | Yes | Threshold value |
| channel | string | Yes | Notification channel |

**Response:** `201 Created`

### GET /api/k9/monitoring/health
Get system health status.

**Response:** `200 OK` — `{ status, checks: [...] }`

---

## K10 Service Registry

### POST /api/k10/registry/services
Register a service.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Service name |
| version | string | Yes | Service version |
| host | string | Yes | Service host |
| port | number | Yes | Service port |
| metadata | JSON | No | Service metadata |

**Response:** `201 Created`

### PUT /api/k10/registry/services/:id/heartbeat
Send heartbeat to keep service active.

**Response:** `200 OK`

### GET /api/k10/registry/services?name=&status=
Discover services.

**Response:** `200 OK` — `{ services: [...] }`

### DELETE /api/k10/registry/services/:id
Deregister a service.

**Response:** `204 No Content`

---

## M9 Payroll

### POST /api/m9/payroll/runs
Create a new payroll run.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID | Yes | Tenant identifier |
| period | string | Yes | Pay period (YYYY-MM) |
| employee_ids | UUID[] | No | Specific employees (all if empty) |

**Response:** `201 Created` — `{ id, period, status: 'draft' }`

### POST /api/m9/payroll/runs/:id/calculate
Calculate payroll for all employees in the run.

**Response:** `200 OK` — `{ id, total_gross, total_deductions, total_net, employee_count }`

### POST /api/m9/payroll/runs/:id/approve
Approve payroll run for payment.

**Response:** `200 OK` — `{ id, status: 'approved' }`

### GET /api/m9/payroll/runs/:id/items
Get payroll items (per-employee breakdown).

**Response:** `200 OK` — `{ items: [{ employee_id, basic, housing, transport, gosi_employee, gosi_employer, deductions, net }] }`

### GET /api/m9/payroll/structures
Get salary structures.

**Response:** `200 OK` — `{ structures: [...] }`

---

## M10 Settings

### GET /api/m10/settings?scope=&key=
Get settings with optional scope and key filter.

**Response:** `200 OK` — `{ settings: [{ key, value, scope, updated_at }] }`

### PUT /api/m10/settings/:key
Update a setting.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| value | string | Yes | Setting value |
| scope | string | No | Setting scope (global, tenant, user) |
| encrypted | boolean | No | Whether to encrypt the value |

**Response:** `200 OK`

### GET /api/m10/settings/:key/history
Get setting change history.

**Response:** `200 OK` — `{ history: [{ value, changed_by, changed_at }] }`

---

## M11 AI Engine

### POST /api/m11/ai/generate
Text generation (ITextGeneration).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | string | Yes | Input prompt |
| system_prompt | string | No | System instruction |
| max_tokens | number | No | Max response tokens |
| temperature | number | No | Sampling temperature |

**Response:** `200 OK` — `{ text, tokens_used, model, latency_ms, cost }`

### POST /api/m11/ai/classify
Text classification (IClassification).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to classify |
| categories | string[] | Yes | Available categories |

**Response:** `200 OK` — `{ category, confidence, model }`

### POST /api/m11/ai/summarize
Text summarization (ISummarization).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to summarize |
| style | string | No | Style: brief, bullets, executive |
| max_length | number | No | Max summary length |

**Response:** `200 OK` — `{ summary, compression_ratio, model }`

### POST /api/m11/ai/analyze-vision
Image analysis (IVisionAnalysis).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image_data | string | Yes | Base64-encoded image |
| prompt | string | Yes | Analysis prompt |

**Response:** `200 OK` — `{ analysis, model }`

### POST /api/m11/ai/synthesize-speech
Speech synthesis (ISpeechSynthesis).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to speak |
| voice | string | No | Voice ID |
| speed | number | No | Speed multiplier |
| format | string | No | Output format (mp3, wav) |

**Response:** `200 OK` — `{ audio_data, duration_ms, format }`

### POST /api/m11/ai/embed
Text embedding (IEmbedding).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| texts | string[] | Yes | Texts to embed |

**Response:** `200 OK` — `{ embeddings: number[][], model, dimensions }`

### GET /api/m11/ai/usage
Get AI usage statistics.

**Response:** `200 OK` — `{ total_requests, total_tokens, total_cost, by_capability: {...} }`

### POST /api/m11/ai/kill-switch
Toggle AI kill switch (admin only).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Enable/disable AI |
| reason | string | Yes | Reason for toggle |

**Response:** `200 OK`

---

## M12 User Notifications

### POST /api/m12/notifications
Send a notification.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tenant_id | UUID | Yes | Tenant identifier |
| user_id | UUID | Yes | Recipient user |
| title | string | Yes | Notification title |
| body | string | Yes | Notification body |
| type | string | Yes | Type: info, warning, error, success |
| priority | string | No | Priority: low, medium, high, urgent |

**Response:** `201 Created`

### GET /api/m12/notifications?status=&type=
List notifications for current user.

**Response:** `200 OK` — `{ notifications: [...], unread_count }`

### PUT /api/m12/notifications/:id/read
Mark notification as read.

**Response:** `200 OK`

### POST /api/m12/notifications/subscriptions
Subscribe to notification topics.

**Response:** `201 Created`

---

## M13 File Manager

### POST /api/m13/files/upload
Upload a file.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | Binary | Yes | File data (multipart) |
| folder_id | UUID | No | Target folder |
| tags | string[] | No | File tags |

**Response:** `201 Created` — `{ id, name, size, mime_type, storage_object_id }`

### GET /api/m13/files/:id
Get file metadata.

**Response:** `200 OK` — `{ id, name, size, mime_type, folder_id, tags, uploaded_by, created_at }`

### GET /api/m13/files/:id/download
Download file content.

**Response:** `200 OK` — Binary stream

### POST /api/m13/files/folders
Create a folder.

**Response:** `201 Created`

### POST /api/m13/files/:id/share
Share a file with users.

**Response:** `201 Created`

---

## M14 Reports

### POST /api/m14/reports/definitions
Create a report definition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Report name |
| module | string | Yes | Source module |
| query_template | string | Yes | SQL/query template |
| parameters | JSON | No | Report parameters |

**Response:** `201 Created`

### POST /api/m14/reports/definitions/:id/execute
Execute a report.

**Response:** `200 OK` — `{ execution_id, status: 'running' }`

### GET /api/m14/reports/executions/:id
Get report execution result.

**Response:** `200 OK` — `{ id, status, result_data, ai_summary, generated_at }`

### POST /api/m14/reports/definitions/:id/schedule
Schedule recurring report execution.

**Response:** `201 Created`
