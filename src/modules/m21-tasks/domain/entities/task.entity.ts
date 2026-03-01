export enum TaskStatus { TODO = 'todo', IN_PROGRESS = 'in_progress', IN_REVIEW = 'in_review', DONE = 'done', CANCELLED = 'cancelled' }
export enum TaskPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', URGENT = 'urgent' }

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  parentTaskId?: string;
  projectId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  tenantId: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}
