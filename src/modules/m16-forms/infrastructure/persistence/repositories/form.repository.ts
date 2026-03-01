import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFormRepository } from '../../../domain/interfaces/form-repository.interface';
import { FormDefinition, FormSubmission } from '../../../domain/entities/form.entity';
import { FormDefinitionEntity, FormSubmissionEntity } from './form.orm-entity';

@Injectable()
export class FormRepository implements IFormRepository {
  constructor(
    @InjectRepository(FormDefinitionEntity) private readonly defRepo: Repository<FormDefinitionEntity>,
    @InjectRepository(FormSubmissionEntity) private readonly subRepo: Repository<FormSubmissionEntity>,
  ) {}

  async createDefinition(def: Omit<FormDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormDefinition> {
    const saved = await this.defRepo.save(this.defRepo.create(def as any));
    return saved as unknown as FormDefinition;
  }
  async findDefinitionById(tenantId: string, id: string): Promise<FormDefinition | null> {
    return this.defRepo.findOne({ where: { tenantId, id } }) as unknown as FormDefinition | null;
  }
  async listDefinitions(tenantId: string): Promise<FormDefinition[]> {
    return this.defRepo.find({ where: { tenantId } }) as unknown as FormDefinition[];
  }
  async updateDefinition(tenantId: string, id: string, updates: Partial<FormDefinition>): Promise<FormDefinition> {
    await this.defRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findDefinitionById(tenantId, id) as unknown as FormDefinition;
  }
  async createSubmission(sub: Omit<FormSubmission, 'id' | 'submittedAt'>): Promise<FormSubmission> {
    const saved = await this.subRepo.save(this.subRepo.create(sub as any));
    return saved as unknown as FormSubmission;
  }
  async findSubmissionById(tenantId: string, id: string): Promise<FormSubmission | null> {
    return this.subRepo.findOne({ where: { tenantId, id } }) as unknown as FormSubmission | null;
  }
  async listSubmissions(tenantId: string, formId: string): Promise<FormSubmission[]> {
    return this.subRepo.find({ where: { tenantId, formId } }) as unknown as FormSubmission[];
  }
}
