import { WorkflowDefinition, WorkflowExecution, WorkflowStepLog } from '../entities/workflow.entity';

export interface IWorkflowRepository {
  createDefinition(def: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition>;
  findDefinitionById(tenantId: string, id: string): Promise<WorkflowDefinition | null>;
  listDefinitions(tenantId: string, status?: string): Promise<WorkflowDefinition[]>;
  updateDefinition(tenantId: string, id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
  deleteDefinition(tenantId: string, id: string): Promise<void>;

  createExecution(exec: Omit<WorkflowExecution, 'id' | 'createdAt'>): Promise<WorkflowExecution>;
  findExecutionById(tenantId: string, id: string): Promise<WorkflowExecution | null>;
  listExecutions(tenantId: string, definitionId?: string): Promise<WorkflowExecution[]>;
  updateExecution(tenantId: string, id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution>;

  createStepLog(log: Omit<WorkflowStepLog, 'id'>): Promise<WorkflowStepLog>;
  listStepLogs(tenantId: string, executionId: string): Promise<WorkflowStepLog[]>;
}

export const WORKFLOW_REPOSITORY = Symbol('IWorkflowRepository');
