import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskRepository } from '../../../domain/interfaces/task-repository.interface';
import { Task, TaskComment } from '../../../domain/entities/task.entity';
import { TaskEntity, TaskCommentEntity } from './task.orm-entity';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskEntity) private readonly taskRepo: Repository<TaskEntity>,
    @InjectRepository(TaskCommentEntity) private readonly commentRepo: Repository<TaskCommentEntity>,
  ) {}

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.taskRepo.save(this.taskRepo.create(task)) as unknown as Task;
  }
  async findById(tenantId: string, id: string): Promise<Task | null> {
    return this.taskRepo.findOne({ where: { tenantId, id } }) as unknown as Task | null;
  }
  async list(tenantId: string, filters?: { status?: string; assigneeId?: string; projectId?: string }): Promise<Task[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.projectId) where.projectId = filters.projectId;
    return this.taskRepo.find({ where }) as unknown as Task[];
  }
  async update(tenantId: string, id: string, updates: Partial<Task>): Promise<Task> {
    await this.taskRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findById(tenantId, id) as unknown as Task;
  }
  async delete(tenantId: string, id: string): Promise<void> {
    await this.taskRepo.delete({ tenantId, id });
  }
  async addComment(comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<TaskComment> {
    return this.commentRepo.save(this.commentRepo.create(comment)) as unknown as TaskComment;
  }
  async listComments(tenantId: string, taskId: string): Promise<TaskComment[]> {
    return this.commentRepo.find({ where: { tenantId, taskId }, order: { createdAt: 'ASC' } }) as unknown as TaskComment[];
  }
}
