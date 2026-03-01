export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
}

export interface ReportDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  module: string;
  queryTemplate: string;
  parameters: ReportParameter[];
  columns: ReportColumn[];
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
}

export interface ReportColumn {
  field: string;
  header: string;
  type: 'string' | 'number' | 'date' | 'currency';
  width?: number;
  format?: string;
}

export interface ReportExecution {
  id: string;
  tenantId: string;
  definitionId: string;
  status: ReportStatus;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  resultFileId?: string;
  rowCount?: number;
  executedBy: string;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface ScheduledReport {
  id: string;
  tenantId: string;
  definitionId: string;
  cronExpression: string;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  recipients: string[];
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
