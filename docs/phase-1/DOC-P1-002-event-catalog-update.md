# DOC-P1-002: Event Catalog Update — Phase 1

## New Event Namespaces

### notification.*
| Event | Payload | Trigger |
|-------|---------|---------|
| notification.sent | { notificationId, recipientId, channel, status } | After successful dispatch |
| notification.failed | { notificationId, recipientId, channel, error } | After dispatch failure |
| notification.preference.updated | { userId, channel, enabled } | User updates preferences |

### scheduler.*
| Event | Payload | Trigger |
|-------|---------|---------|
| scheduler.job.created | { jobId, name, type, handler } | New job scheduled |
| scheduler.job.executed | { jobId, name, duration, status } | Job execution completed |
| scheduler.job.failed | { jobId, name, error, retryCount } | Job execution failed |
| scheduler.job.retried | { jobId, name, retryCount } | Job retry initiated |
| scheduler.job.dead | { jobId, name, maxRetries } | Job exceeded max retries |

### department.*
| Event | Payload | Trigger |
|-------|---------|---------|
| department.created | { departmentId, name, code, parentId } | Department created |
| department.updated | { departmentId, changes } | Department updated |
| department.deleted | { departmentId } | Department soft-deleted |
| department.hierarchy.changed | { departmentId, oldParentId, newParentId } | Parent changed |

### employee.*
| Event | Payload | Trigger |
|-------|---------|---------|
| employee.created | { employeeId, userId, departmentId } | Employee profile created |
| employee.updated | { employeeId, changes } | Employee updated |
| employee.deactivated | { employeeId, reason } | Employee deactivated |
| employee.transferred | { employeeId, fromDeptId, toDeptId } | Department transfer |

### attendance.*
| Event | Payload | Trigger |
|-------|---------|---------|
| attendance.checked_in | { employeeId, timestamp, location } | Check-in recorded |
| attendance.checked_out | { employeeId, timestamp, workHours } | Check-out recorded |
| attendance.report.generated | { reportId, departmentId, period } | Report generated |

### leave.*
| Event | Payload | Trigger |
|-------|---------|---------|
| leave.requested | { requestId, employeeId, leaveType, days } | Leave request submitted |
| leave.approved | { requestId, employeeId, approvedBy } | Leave approved |
| leave.rejected | { requestId, employeeId, rejectedBy, reason } | Leave rejected |
| leave.balance.updated | { employeeId, leaveType, remaining } | Balance changed |

## Integration with Phase 0 Events

All Phase 1 events follow the same `EventEnvelope` format defined in Phase 0:
- Published via K5 Event Bus (NATS)
- Stored in K5 Event Store
- Include tenant_id in every envelope
- Subject to DLQ and idempotency guarantees
