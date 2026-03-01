export enum JobStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

export enum JobType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export interface ScheduledJobEntity {
  id: string;
  tenantId: string;
  name: string;
  type: JobType;
  cronExpression?: string;
  scheduledAt?: Date;
  handler: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  maxRetries: number;
  retryCount: number;
  lastRunAt?: Date;
  nextRunAt?: Date;
  lastError?: string;
  timeoutMs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobExecutionLog {
  id: string;
  tenantId: string;
  jobId: string;
  startedAt: Date;
  completedAt?: Date;
  status: JobStatus;
  error?: string;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}
