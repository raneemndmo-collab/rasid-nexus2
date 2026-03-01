import { ActionDefinition } from '../entities/action.entity';

export const ACTION_REPOSITORY = Symbol('ACTION_REPOSITORY');

export interface IActionRepository {
  findById(id: string): Promise<ActionDefinition | null>;
  findByCode(code: string): Promise<ActionDefinition | null>;
  findAll(): Promise<ActionDefinition[]>;
  findByModule(module: string): Promise<ActionDefinition[]>;
  register(action: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionDefinition>;
  update(id: string, data: Partial<ActionDefinition>): Promise<ActionDefinition>;
  deactivate(id: string): Promise<void>;
  isRegistered(code: string): Promise<boolean>;
}
