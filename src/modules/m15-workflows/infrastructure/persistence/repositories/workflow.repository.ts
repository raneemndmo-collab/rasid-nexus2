import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkflowRepository } from '../../../domain/interfaces/workflow-repository.interface';
import { WorkflowDefinition, WorkflowExecution, WorkflowStepLog } from '../../../domain/entities/workflow.entity';
import { WorkflowDefinitionEntity, WorkflowExecutionEntity, WorkflowStepLogEntity } from './workflow.orm-entity';

@Injectable()
export class WorkflowRepository implements IWorkflowRepository {
  constructor(
    @InjectRepository(WorkflowDefinitionEntity) private readonly defRepo: Repository<WorkflowDefinitionEntity>,
    @InjectRepository(WorkflowExecutionEntity) private readonly execRepo: Repository<WorkflowExecutionEntity>,
    @InjectRepository(WorkflowStepLogEntity) private readonly logRepo: Repository<WorkflowStepLogEntity>,
  ) {}

  async createDefinition(def: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const entity = this.defRepo.create(def as any);
    const saved = await this.defRepo.save(entity);
    return saved as unknown as WorkflowDefinition;
  }

  async findDefinitionById(tenantId: string, id: string): Promise<WorkflowDefinition | null> {
    return this.defRepo.findOne({ where: { tenantId, id } }) as unknown as WorkflowDefinition | null;
  }

  async listDefinitions(tenantId: string, status?: string): Promise<WorkflowDefinition[]> {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    return this.defRepo.find({ where }) as unknown as WorkflowDefinition[];
  }

  async updateDefinition(tenantId: string, id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    await this.defRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findDefinitionById(tenantId, id) as unknown as WorkflowDefinition;
  }

  async deleteDefinition(tenantId: string, id: string): Promise<void> {
    await this.defRepo.delete({ tenantId, id });
  }

  async createExecution(exec: Omit<WorkflowExecution, 'id' | 'createdAt'>): Promise<WorkflowExecution> {
    const entity = this.execRepo.create(exec);
    const saved = await this.execRepo.save(entity);
    return saved as unknown as WorkflowExecution;
  }

  async findExecutionById(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.execRepo.findOne({ where: { tenantId, id } }) as unknown as WorkflowExecution | null;
  }

  async listExecutions(tenantId: string, definitionId?: string): Promise<WorkflowExecution[]> {
    const where: Record<string, unknown> = { tenantId };
    if (definitionId) where.definitionId = definitionId;
    return this.execRepo.find({ where }) as unknown as WorkflowExecution[];
  }

  async updateExecution(tenantId: string, id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution> {
    await this.execRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findExecutionById(tenantId, id) as unknown as WorkflowExecution;
  }

  async createStepLog(log: Omit<WorkflowStepLog, 'id'>): Promise<WorkflowStepLog> {
    const entity = this.logRepo.create(log);
    const saved = await this.logRepo.save(entity);
    return saved as unknown as WorkflowStepLog;
  }

  async listStepLogs(tenantId: string, executionId: string): Promise<WorkflowStepLog[]> {
    return this.logRepo.find({ where: { tenantId, executionId } }) as unknown as WorkflowStepLog[];
  }
}
