import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProjectRepository } from '../../../domain/interfaces/project-repository.interface';
import { Project, ProjectMember } from '../../../domain/entities/project.entity';
import { ProjectEntity, ProjectMemberEntity } from './project.orm-entity';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity) private readonly projRepo: Repository<ProjectEntity>,
    @InjectRepository(ProjectMemberEntity) private readonly memberRepo: Repository<ProjectMemberEntity>,
  ) {}

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.projRepo.save(this.projRepo.create(project)) as unknown as Project;
  }
  async findById(tenantId: string, id: string): Promise<Project | null> {
    return this.projRepo.findOne({ where: { tenantId, id } }) as unknown as Project | null;
  }
  async list(tenantId: string): Promise<Project[]> {
    return this.projRepo.find({ where: { tenantId } }) as unknown as Project[];
  }
  async update(tenantId: string, id: string, updates: Partial<Project>): Promise<Project> {
    await this.projRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findById(tenantId, id) as unknown as Project;
  }
  async delete(tenantId: string, id: string): Promise<void> {
    await this.projRepo.delete({ tenantId, id });
  }
  async addMember(member: Omit<ProjectMember, 'id' | 'joinedAt'>): Promise<ProjectMember> {
    return this.memberRepo.save(this.memberRepo.create(member)) as unknown as ProjectMember;
  }
  async listMembers(tenantId: string, projectId: string): Promise<ProjectMember[]> {
    return this.memberRepo.find({ where: { tenantId, projectId } }) as unknown as ProjectMember[];
  }
  async removeMember(tenantId: string, projectId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ tenantId, projectId, userId });
  }
}
