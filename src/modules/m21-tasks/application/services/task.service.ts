import { Injectable, Inject } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/interfaces/task-repository.interface';
import { Task, TaskComment, TaskStatus } from '../../domain/entities/task.entity';
import { TaskEvents } from '../../domain/events/task.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly repo: ITaskRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task = await this.repo.create(data);
    await this.eventBus.publish({ event_type: TaskEvents.TASK_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: task });
    return task;
  }
  async getTask(tenantId: string, id: string) { return this.repo.findById(tenantId, id); }
  async listTasks(tenantId: string, filters?: { status?: string; assigneeId?: string; projectId?: string }) {
    return this.repo.list(tenantId, filters);
  }
  async updateTask(tenantId: string, id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.repo.update(tenantId, id, updates);
    await this.eventBus.publish({ event_type: TaskEvents.TASK_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: task });
    return task;
  }
  async assignTask(tenantId: string, id: string, assigneeId: string): Promise<Task> {
    const task = await this.repo.update(tenantId, id, { assigneeId } as Partial<Task>);
    await this.eventBus.publish({ event_type: TaskEvents.TASK_ASSIGNED, tenant_id: tenantId, timestamp: new Date(), payload: { taskId: id, assigneeId } });
    return task;
  }
  async completeTask(tenantId: string, id: string): Promise<Task> {
    const task = await this.repo.update(tenantId, id, { status: TaskStatus.DONE, completedAt: new Date() } as Partial<Task>);
    await this.eventBus.publish({ event_type: TaskEvents.TASK_COMPLETED, tenant_id: tenantId, timestamp: new Date(), payload: task });
    return task;
  }
  async addComment(data: Omit<TaskComment, 'id' | 'createdAt'>): Promise<TaskComment> {
    const comment = await this.repo.addComment(data);
    await this.eventBus.publish({ event_type: TaskEvents.COMMENT_ADDED, tenant_id: data.tenantId, timestamp: new Date(), payload: comment });
    return comment;
  }
  async listComments(tenantId: string, taskId: string) { return this.repo.listComments(tenantId, taskId); }
}
