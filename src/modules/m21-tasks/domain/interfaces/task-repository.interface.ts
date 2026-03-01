import { Task, TaskComment } from '../entities/task.entity';

export interface ITaskRepository {
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  findById(tenantId: string, id: string): Promise<Task | null>;
  list(tenantId: string, filters?: { status?: string; assigneeId?: string; projectId?: string }): Promise<Task[]>;
  update(tenantId: string, id: string, updates: Partial<Task>): Promise<Task>;
  delete(tenantId: string, id: string): Promise<void>;

  addComment(comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<TaskComment>;
  listComments(tenantId: string, taskId: string): Promise<TaskComment[]>;
}

export const TASK_REPOSITORY = Symbol('ITaskRepository');
