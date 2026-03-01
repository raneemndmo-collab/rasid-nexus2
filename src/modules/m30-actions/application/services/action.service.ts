import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ACTION_REPOSITORY, IActionRepository } from '../../domain/interfaces/action-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { ActionDefinition } from '../../domain/entities/action.entity';
import { ActionUnregisteredError } from '@shared/domain/errors/domain-errors';

@Injectable()
export class ActionService {
  constructor(
    @Inject(ACTION_REPOSITORY) private readonly actionRepo: IActionRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async register(data: {
    code: string;
    name: string;
    description: string;
    module: string;
    requiredPermissions?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<ActionDefinition> {
    const existing = await this.actionRepo.findByCode(data.code);
    if (existing) throw new ConflictException('Action code already registered');

    const action = await this.actionRepo.register({
      code: data.code,
      name: data.name,
      description: data.description,
      module: data.module,
      requiredPermissions: data.requiredPermissions || [],
      isActive: true,
      metadata: data.metadata || {},
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'action.registered',
      tenant_id: 'system',
      correlation_id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { actionId: action.id, code: action.code, module: action.module },
    });

    return action;
  }

  async findAll(): Promise<ActionDefinition[]> {
    return this.actionRepo.findAll();
  }

  async findByCode(code: string): Promise<ActionDefinition> {
    const action = await this.actionRepo.findByCode(code);
    if (!action) throw new NotFoundException(`Action ${code} not found`);
    return action;
  }

  async findByModule(module: string): Promise<ActionDefinition[]> {
    return this.actionRepo.findByModule(module);
  }

  async validateAction(code: string): Promise<boolean> {
    const isRegistered = await this.actionRepo.isRegistered(code);
    if (!isRegistered) {
      throw new ActionUnregisteredError(code);
    }
    return true;
  }

  async deactivate(id: string): Promise<void> {
    const existing = await this.actionRepo.findById(id);
    if (!existing) throw new NotFoundException(`Action ${id} not found`);

    await this.actionRepo.deactivate(id);

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'action.deactivated',
      tenant_id: 'system',
      correlation_id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { actionId: id, code: existing.code },
    });
  }
}
