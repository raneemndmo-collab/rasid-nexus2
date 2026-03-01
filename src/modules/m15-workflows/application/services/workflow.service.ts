import { Injectable, Inject } from '@nestjs/common';
import { IWorkflowRepository, WORKFLOW_REPOSITORY } from '../../domain/interfaces/workflow-repository.interface';
import { WorkflowDefinition, WorkflowExecution, WorkflowStep, ExecutionStatus, StepType } from '../../domain/entities/workflow.entity';
import { WorkflowEvents } from '../../domain/events/workflow.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class WorkflowService {
  constructor(
    @Inject(WORKFLOW_REPOSITORY) private readonly repo: IWorkflowRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createDefinition(data: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const def = await this.repo.createDefinition(data);
    await this.eventBus.publish({ event_type: WorkflowEvents.DEFINITION_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: def });
    return def;
  }

  async getDefinition(tenantId: string, id: string): Promise<WorkflowDefinition | null> {
    return this.repo.findDefinitionById(tenantId, id);
  }

  async listDefinitions(tenantId: string, status?: string): Promise<WorkflowDefinition[]> {
    return this.repo.listDefinitions(tenantId, status);
  }

  async updateDefinition(tenantId: string, id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const def = await this.repo.updateDefinition(tenantId, id, updates);
    await this.eventBus.publish({ event_type: WorkflowEvents.DEFINITION_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: def });
    return def;
  }

  async activateDefinition(tenantId: string, id: string): Promise<WorkflowDefinition> {
    const def = await this.repo.updateDefinition(tenantId, id, { status: 'active' } as Partial<WorkflowDefinition>);
    await this.eventBus.publish({ event_type: WorkflowEvents.DEFINITION_ACTIVATED, tenant_id: tenantId, timestamp: new Date(), payload: def });
    return def;
  }

  async startExecution(tenantId: string, definitionId: string, context: Record<string, unknown> = {}): Promise<WorkflowExecution> {
    const def = await this.repo.findDefinitionById(tenantId, definitionId);
    if (!def) throw new Error('Workflow definition not found');
    if (def.status !== 'active') throw new Error('Workflow definition is not active');

    const exec = await this.repo.createExecution({
      tenantId,
      definitionId,
      status: ExecutionStatus.RUNNING,
      currentStep: 0,
      context,
      startedAt: new Date(),
    });

    await this.eventBus.publish({ event_type: WorkflowEvents.EXECUTION_STARTED, tenant_id: tenantId, timestamp: new Date(), payload: exec });

    // Execute steps
    try {
      await this.executeSteps(def, exec);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      await this.repo.updateExecution(tenantId, exec.id, {
        status: ExecutionStatus.FAILED,
        error: errMsg,
        completedAt: new Date(),
      });
      await this.eventBus.publish({ event_type: WorkflowEvents.EXECUTION_FAILED, tenant_id: tenantId, timestamp: new Date(), payload: { executionId: exec.id, error: errMsg } });
      throw error;
    }

    return this.repo.findExecutionById(tenantId, exec.id) as unknown as WorkflowExecution;
  }

  private async executeSteps(def: WorkflowDefinition, exec: WorkflowExecution): Promise<void> {
    const steps = def.steps;
    let currentIndex = 0;

    while (currentIndex < steps.length) {
      const step = steps[currentIndex];
      await this.repo.updateExecution(exec.tenantId, exec.id, { currentStep: currentIndex });

      const log = await this.repo.createStepLog({
        tenantId: exec.tenantId,
        executionId: exec.id,
        stepIndex: currentIndex,
        stepName: step.name,
        status: 'running',
        input: exec.context,
        startedAt: new Date(),
      });

      await this.eventBus.publish({ event_type: WorkflowEvents.STEP_STARTED, tenant_id: exec.tenantId, timestamp: new Date(), payload: log });

      try {
        const result = await this.executeStep(step, exec);
        await this.repo.createStepLog({
          ...log,
          status: 'completed',
          output: result,
          completedAt: new Date(),
        });
        await this.eventBus.publish({ event_type: WorkflowEvents.STEP_COMPLETED, tenant_id: exec.tenantId, timestamp: new Date(), payload: { stepIndex: currentIndex } });

        if (step.type === StepType.CONDITION && result?.branch !== undefined) {
          currentIndex = result.branch as number;
        } else {
          currentIndex = step.nextOnSuccess ?? currentIndex + 1;
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        await this.repo.createStepLog({
          ...log,
          status: 'failed',
          output: { error: errMsg },
          completedAt: new Date(),
        });
        await this.eventBus.publish({ event_type: WorkflowEvents.STEP_FAILED, tenant_id: exec.tenantId, timestamp: new Date(), payload: { stepIndex: currentIndex, error: errMsg } });

        if (step.nextOnFailure !== undefined) {
          currentIndex = step.nextOnFailure;
        } else {
          throw error;
        }
      }
    }

    await this.repo.updateExecution(exec.tenantId, exec.id, {
      status: ExecutionStatus.COMPLETED,
      completedAt: new Date(),
    });
    await this.eventBus.publish({ event_type: WorkflowEvents.EXECUTION_COMPLETED, tenant_id: exec.tenantId, timestamp: new Date(), payload: { executionId: exec.id } });
  }

  private async executeStep(step: WorkflowStep, exec: WorkflowExecution): Promise<Record<string, unknown>> {
    switch (step.type) {
      case StepType.ACTION:
        return { action: step.config.action, executed: true };
      case StepType.CONDITION:
        const field = step.config.field as string;
        const value = exec.context[field];
        const expected = step.config.value;
        const match = value === expected;
        return { branch: match ? step.nextOnSuccess : step.nextOnFailure, match };
      case StepType.PARALLEL:
        if (step.branches) {
          const results = await Promise.all(
            step.branches.map((_, i) => Promise.resolve({ branch: i, status: 'completed' }))
          );
          return { parallelResults: results };
        }
        return { parallelResults: [] };
      case StepType.NOTIFICATION:
        return { notified: true, channel: step.config.channel };
      case StepType.APPROVAL:
        return { approved: true, approver: step.config.approver };
      case StepType.WAIT:
        return { waited: true, duration: step.config.duration };
      default:
        return { executed: true };
    }
  }

  async getExecution(tenantId: string, id: string): Promise<WorkflowExecution | null> {
    return this.repo.findExecutionById(tenantId, id);
  }

  async listExecutions(tenantId: string, definitionId?: string): Promise<WorkflowExecution[]> {
    return this.repo.listExecutions(tenantId, definitionId);
  }

  async getStepLogs(tenantId: string, executionId: string) {
    return this.repo.listStepLogs(tenantId, executionId);
  }
}
