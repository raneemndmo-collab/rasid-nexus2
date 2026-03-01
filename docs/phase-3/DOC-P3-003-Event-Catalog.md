# DOC-P3-003: Phase 3 Event Catalog

**Version:** 1.0.0  
**Phase:** 3 — Integration & Collaboration  
**Date:** 2026-03-01  

---

## M15 Workflows Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m15.workflow.definition.created` | New workflow definition | `{ id, name, trigger_type }` |
| `m15.workflow.definition.updated` | Definition modified | `{ id, name, changes }` |
| `m15.workflow.execution.started` | Execution begins | `{ executionId, definitionId }` |
| `m15.workflow.execution.completed` | Execution finishes | `{ executionId, result }` |
| `m15.workflow.execution.failed` | Execution fails | `{ executionId, error }` |
| `m15.workflow.step.started` | Step begins | `{ executionId, stepName }` |
| `m15.workflow.step.completed` | Step finishes | `{ executionId, stepName, result }` |

## M16 Form Builder Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m16.form.definition.created` | New form definition | `{ id, name, fieldCount }` |
| `m16.form.definition.published` | Form published | `{ id, name }` |
| `m16.form.submission.received` | Form submitted | `{ submissionId, formId }` |
| `m16.form.submission.validated` | Validation complete | `{ submissionId, status }` |

## M17 OCR Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m17.ocr.job.created` | OCR job created | `{ jobId, fileName }` |
| `m17.ocr.job.completed` | OCR processing done | `{ jobId, confidence }` |
| `m17.ocr.job.failed` | OCR processing failed | `{ jobId, error }` |
| `m17.ocr.table.extracted` | Table data extracted | `{ jobId, tableCount }` |

## M18 Dashboards Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m18.dashboard.created` | Dashboard created | `{ id, name }` |
| `m18.dashboard.updated` | Dashboard modified | `{ id, changes }` |
| `m18.widget.added` | Widget added | `{ dashboardId, widgetId, type }` |
| `m18.widget.updated` | Widget modified | `{ dashboardId, widgetId }` |
| `m18.insights.generated` | AI insights generated | `{ dashboardId, insightCount }` |

## M19 Calendar Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m19.calendar.event.created` | Event created | `{ id, title, startDate }` |
| `m19.calendar.event.updated` | Event modified | `{ id, changes }` |
| `m19.calendar.event.deleted` | Event deleted | `{ id }` |
| `m19.calendar.event.reminder` | Reminder triggered | `{ id, userId }` |

## M20 Messages Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m20.message.thread.created` | Thread created | `{ threadId, subject }` |
| `m20.message.sent` | Message sent | `{ threadId, messageId }` |
| `m20.message.edited` | Message edited | `{ threadId, messageId }` |
| `m20.message.deleted` | Message deleted | `{ threadId, messageId }` |

## M21 Tasks Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m21.task.created` | Task created | `{ id, title, assigneeId }` |
| `m21.task.updated` | Task modified | `{ id, changes }` |
| `m21.task.status.changed` | Status changed | `{ id, from, to }` |
| `m21.task.comment.added` | Comment added | `{ taskId, commentId }` |
| `m21.task.deleted` | Task deleted | `{ id }` |

## M22 Projects Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m22.project.created` | Project created | `{ id, name }` |
| `m22.project.updated` | Project modified | `{ id, changes }` |
| `m22.project.archived` | Project archived | `{ id }` |
| `m22.project.member.added` | Member added | `{ projectId, userId, role }` |
| `m22.project.member.removed` | Member removed | `{ projectId, userId }` |

## M23 Collaboration Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `m23.collaboration.session.created` | Session started | `{ sessionId, documentId }` |
| `m23.collaboration.session.closed` | Session ended | `{ sessionId }` |
| `m23.collaboration.change.applied` | Change applied | `{ sessionId, userId, version }` |
| `m23.collaboration.conflict.detected` | OT conflict | `{ sessionId, userId, baseVersion }` |
| `m23.collaboration.presence.updated` | Presence changed | `{ sessionId, userId, status }` |

---

## Summary

| Module | Events Published | Events Subscribed |
|--------|-----------------|-------------------|
| M15 | 7 | 0 |
| M16 | 4 | 0 |
| M17 | 4 | 0 |
| M18 | 5 | 0 |
| M19 | 4 | 0 |
| M20 | 4 | 0 |
| M21 | 5 | 0 |
| M22 | 5 | 0 |
| M23 | 5 | 0 |
| **Total** | **43** | **0** |
