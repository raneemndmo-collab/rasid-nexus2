import { Injectable, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionOrmEntity } from './action.orm-entity';
import { IActionRepository } from '../../../domain/interfaces/action-repository.interface';
import { ActionDefinition } from '../../../domain/entities/action.entity';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ActionRepository implements IActionRepository {
  constructor(
    @InjectRepository(ActionOrmEntity)
    private readonly repo: Repository<ActionOrmEntity>,
    @Inject(REQUEST) private readonly request: { tenantId?: string },
  ) {}

  /** Get the current tenant_id from request context for RLS filtering */
  private get tenantId(): string | undefined {
    return this.request?.tenantId;
  }

  async findById(id: string): Promise<ActionDefinition | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<ActionDefinition | null> {
    return this.repo.findOne({ where: { code } });
  }

  async findAll(): Promise<ActionDefinition[]> {
    // Action Registry is global; tenant_id used for RLS at DB level
    return this.repo.find();
  }

  async findByModule(module: string): Promise<ActionDefinition[]> {
    return this.repo.find({ where: { module } });
  }

  async register(action: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionDefinition> {
    // tenant_id is set via RLS context at the database level
    const entity = this.repo.create(action);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<ActionDefinition>): Promise<ActionDefinition> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error(`Action ${id} not found`);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async deactivate(id: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error(`Action ${id} not found`);
    existing.isActive = false;
    await this.repo.save(existing);
  }

  async isRegistered(code: string): Promise<boolean> {
    const action = await this.repo.findOne({ where: { code, isActive: true } });
    return !!action;
  }
}
