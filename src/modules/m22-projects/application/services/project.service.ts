import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/interfaces/project-repository.interface';
import { Project, ProjectMember } from '../../domain/entities/project.entity';
import { ProjectEvents } from '../../domain/events/project.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: IProjectRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project = await this.repo.create(data);
    await this.eventBus.publish({ event_type: ProjectEvents.PROJECT_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: project });
    // Auto-add owner as member
    await this.repo.addMember({ tenantId: data.tenantId, projectId: project.id, userId: data.ownerId, role: 'owner' as any });
    return project;
  }
  async getProject(tenantId: string, id: string) { return this.repo.findById(tenantId, id); }
  async listProjects(tenantId: string) { return this.repo.list(tenantId); }
  async updateProject(tenantId: string, id: string, updates: Partial<Project>): Promise<Project> {
    const project = await this.repo.update(tenantId, id, updates);
    await this.eventBus.publish({ event_type: ProjectEvents.PROJECT_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: project });
    return project;
  }
  async completeProject(tenantId: string, id: string): Promise<Project> {
    const project = await this.repo.update(tenantId, id, { status: 'completed' } as Partial<Project>);
    await this.eventBus.publish({ event_type: ProjectEvents.PROJECT_COMPLETED, tenant_id: tenantId, timestamp: new Date(), payload: project });
    return project;
  }
  async addMember(data: Omit<ProjectMember, 'id' | 'joinedAt'>): Promise<ProjectMember> {
    const member = await this.repo.addMember(data);
    await this.eventBus.publish({ event_type: ProjectEvents.MEMBER_ADDED, tenant_id: data.tenantId, timestamp: new Date(), payload: member });
    return member;
  }
  async listMembers(tenantId: string, projectId: string) { return this.repo.listMembers(tenantId, projectId); }
  async removeMember(tenantId: string, projectId: string, userId: string): Promise<void> {
    await this.repo.removeMember(tenantId, projectId, userId);
    await this.eventBus.publish({ event_type: ProjectEvents.MEMBER_REMOVED, tenant_id: tenantId, timestamp: new Date(), payload: { projectId, userId } });
  }
}
