export const AUDIT_SERVICE = Symbol('AUDIT_SERVICE');

export interface AuditEntry {
  id?: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  correlationId: string;
}

export interface IAuditService {
  log(entry: AuditEntry): Promise<void>;
  query(params: {
    tenantId: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ entries: AuditEntry[]; total: number }>;
}
