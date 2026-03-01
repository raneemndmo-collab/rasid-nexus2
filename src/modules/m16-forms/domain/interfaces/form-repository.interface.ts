import { FormDefinition, FormSubmission } from '../entities/form.entity';

export interface IFormRepository {
  createDefinition(def: Omit<FormDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormDefinition>;
  findDefinitionById(tenantId: string, id: string): Promise<FormDefinition | null>;
  listDefinitions(tenantId: string): Promise<FormDefinition[]>;
  updateDefinition(tenantId: string, id: string, updates: Partial<FormDefinition>): Promise<FormDefinition>;

  createSubmission(sub: Omit<FormSubmission, 'id' | 'submittedAt'>): Promise<FormSubmission>;
  findSubmissionById(tenantId: string, id: string): Promise<FormSubmission | null>;
  listSubmissions(tenantId: string, formId: string): Promise<FormSubmission[]>;
}

export const FORM_REPOSITORY = Symbol('IFormRepository');
