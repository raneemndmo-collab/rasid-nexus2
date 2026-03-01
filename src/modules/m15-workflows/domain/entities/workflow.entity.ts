export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum TriggerType {
  MANUAL = 'manual',
  EVENT = 'event',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
}

export enum StepType {
  ACTION = 'action',
  CONDITION = 'condition',
  PARALLEL = 'parallel',
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  WAIT = 'wait',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface WorkflowStep {
  index: number;
  name: string;
  type: StepType;
  config: Record<string, unknown>;
  nextOnSuccess?: number;
  nextOnFailure?: number;
  branches?: WorkflowStep[][];
  timeout_seconds?: number;
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version: number;
  status: WorkflowStatus;
  triggerType: TriggerType;
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  tenantId: string;
  definitionId: string;
  status: ExecutionStatus;
  currentStep: number;
  context: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
}

export interface WorkflowStepLog {
  id: string;
  tenantId: string;
  executionId: string;
  stepIndex: number;
  stepName: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
}
