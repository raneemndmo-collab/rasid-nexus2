import { Injectable, Inject } from '@nestjs/common';
import { IFormRepository, FORM_REPOSITORY } from '../../domain/interfaces/form-repository.interface';
import { FormDefinition, FormSubmission, FormField } from '../../domain/entities/form.entity';
import { FormEvents } from '../../domain/events/form.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class FormService {
  constructor(
    @Inject(FORM_REPOSITORY) private readonly repo: IFormRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createDefinition(data: Omit<FormDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormDefinition> {
    const def = await this.repo.createDefinition(data);
    await this.eventBus.publish({ event_type: FormEvents.DEFINITION_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: def });
    return def;
  }

  async getDefinition(tenantId: string, id: string) { return this.repo.findDefinitionById(tenantId, id); }
  async listDefinitions(tenantId: string) { return this.repo.listDefinitions(tenantId); }

  async publishDefinition(tenantId: string, id: string): Promise<FormDefinition> {
    const def = await this.repo.updateDefinition(tenantId, id, { status: 'published' } as Partial<FormDefinition>);
    await this.eventBus.publish({ event_type: FormEvents.DEFINITION_PUBLISHED, tenant_id: tenantId, timestamp: new Date(), payload: def });
    return def;
  }

  async submitForm(tenantId: string, formId: string, submittedBy: string, data: Record<string, unknown>): Promise<FormSubmission> {
    const def = await this.repo.findDefinitionById(tenantId, formId);
    if (!def) throw new Error('Form not found');

    const errors = this.validateSubmission(def.fields, data);
    const sub = await this.repo.createSubmission({
      tenantId,
      formId,
      submittedBy,
      data,
      validationStatus: errors.length === 0 ? 'valid' : 'invalid',
      validationErrors: errors.length > 0 ? errors : undefined,
    });

    await this.eventBus.publish({ event_type: FormEvents.SUBMISSION_CREATED, tenant_id: tenantId, timestamp: new Date(), payload: sub });
    return sub;
  }

  private validateSubmission(fields: FormField[], data: Record<string, unknown>): Record<string, string>[] {
    const errors: Record<string, string>[] = [];
    for (const field of fields) {
      const value = data[field.name];
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: field.name, message: `${field.label} is required` });
      }
      if (value !== undefined && field.validation) {
        if (field.validation.min !== undefined && typeof value === 'number' && value < field.validation.min) {
          errors.push({ field: field.name, message: field.validation.message || `Minimum value is ${field.validation.min}` });
        }
        if (field.validation.max !== undefined && typeof value === 'number' && value > field.validation.max) {
          errors.push({ field: field.name, message: field.validation.message || `Maximum value is ${field.validation.max}` });
        }
        if (field.validation.pattern && typeof value === 'string' && !new RegExp(field.validation.pattern).test(value)) {
          errors.push({ field: field.name, message: field.validation.message || `Invalid format` });
        }
      }
    }
    return errors;
  }

  async getSubmission(tenantId: string, id: string) { return this.repo.findSubmissionById(tenantId, id); }
  async listSubmissions(tenantId: string, formId: string) { return this.repo.listSubmissions(tenantId, formId); }
}
