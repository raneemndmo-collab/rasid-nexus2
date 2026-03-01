export interface TenantContextData {
  tenantId: string;
  userId: string;
  correlationId: string;
}

export interface RlsPolicy {
  id: string;
  tableName: string;
  databaseName: string;
  policyName: string;
  enabled: boolean;
  createdAt: Date;
}
