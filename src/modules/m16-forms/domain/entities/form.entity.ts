export enum FormStatus { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }
export enum FieldType { TEXT = 'text', NUMBER = 'number', DATE = 'date', SELECT = 'select', MULTI_SELECT = 'multi_select', CHECKBOX = 'checkbox', FILE = 'file', TEXTAREA = 'textarea', EMAIL = 'email', PHONE = 'phone' }

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: unknown;
  validation?: { min?: number; max?: number; pattern?: string; message?: string };
}

export interface ValidationRule {
  field: string;
  rule: string;
  value?: unknown;
  message: string;
}

export interface FormDefinition {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version: number;
  status: FormStatus;
  fields: FormField[];
  validationRules: ValidationRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id: string;
  tenantId: string;
  formId: string;
  submittedBy: string;
  data: Record<string, unknown>;
  validationStatus: string;
  validationErrors?: Record<string, string>[];
  submittedAt: Date;
}
