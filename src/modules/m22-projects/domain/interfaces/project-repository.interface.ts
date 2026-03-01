import { Project, ProjectMember } from '../entities/project.entity';

export interface IProjectRepository {
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  findById(tenantId: string, id: string): Promise<Project | null>;
  list(tenantId: string): Promise<Project[]>;
  update(tenantId: string, id: string, updates: Partial<Project>): Promise<Project>;
  delete(tenantId: string, id: string): Promise<void>;

  addMember(member: Omit<ProjectMember, 'id' | 'joinedAt'>): Promise<ProjectMember>;
  listMembers(tenantId: string, projectId: string): Promise<ProjectMember[]>;
  removeMember(tenantId: string, projectId: string, userId: string): Promise<void>;
}

export const PROJECT_REPOSITORY = Symbol('IProjectRepository');
