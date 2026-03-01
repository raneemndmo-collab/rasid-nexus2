import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AIModelOrmEntity,
  PromptTemplateOrmEntity,
  AIUsageLogOrmEntity,
  TenantAIBudgetOrmEntity,
  AIKillSwitchOrmEntity,
} from './ai.orm-entity';
import {
  IAIModelRepository,
  IPromptTemplateRepository,
  IAIUsageLogRepository,
  ITenantAIBudgetRepository,
  IAIKillSwitchRepository,
} from '../../../domain/interfaces/ai-repository.interface';
import { AIModel, PromptTemplate, AIUsageLog, TenantAIBudget, AIKillSwitch } from '../../../domain/entities/ai.entity';

@Injectable()
export class AIModelRepositoryImpl implements IAIModelRepository {
  constructor(
    @InjectRepository(AIModelOrmEntity)
    private readonly repo: Repository<AIModelOrmEntity>,
  ) {}

  async save(model: AIModel): Promise<AIModel> {
    const entity = this.repo.create(model as unknown as AIModelOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as AIModel;
  }

  async findById(id: string, tenantId: string): Promise<AIModel | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as AIModel) : null;
  }

  async findByCapability(capability: string, tenantId: string): Promise<AIModel[]> {
    const entities = await this.repo.createQueryBuilder('m')
      .where('m.tenant_id = :tenantId', { tenantId })
      .andWhere(':capability = ANY(m.capabilities)', { capability })
      .andWhere('m.status = :status', { status: 'active' })
      .orderBy('m.fallback_level', 'ASC')
      .getMany();
    return entities.map(e => ({ ...e } as unknown as AIModel));
  }

  async findAll(tenantId: string): Promise<AIModel[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as AIModel));
  }

  async findByFallbackLevel(capability: string, level: string, tenantId: string): Promise<AIModel | null> {
    const entity = await this.repo.createQueryBuilder('m')
      .where('m.tenant_id = :tenantId', { tenantId })
      .andWhere(':capability = ANY(m.capabilities)', { capability })
      .andWhere('m.fallback_level = :level', { level })
      .andWhere('m.status = :status', { status: 'active' })
      .getOne();
    return entity ? ({ ...entity } as unknown as AIModel) : null;
  }

  async update(id: string, tenantId: string, updates: Partial<AIModel>): Promise<AIModel> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as AIModel;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class PromptTemplateRepositoryImpl implements IPromptTemplateRepository {
  constructor(
    @InjectRepository(PromptTemplateOrmEntity)
    private readonly repo: Repository<PromptTemplateOrmEntity>,
  ) {}

  async save(prompt: PromptTemplate): Promise<PromptTemplate> {
    const entity = this.repo.create(prompt as unknown as PromptTemplateOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as PromptTemplate;
  }

  async findById(id: string, tenantId: string): Promise<PromptTemplate | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as PromptTemplate) : null;
  }

  async findByName(name: string, tenantId: string): Promise<PromptTemplate | null> {
    const entity = await this.repo.findOne({ where: { name, tenantId, isActive: true } });
    return entity ? ({ ...entity } as unknown as PromptTemplate) : null;
  }

  async findByCapability(capability: string, tenantId: string): Promise<PromptTemplate[]> {
    const entities = await this.repo.find({ where: { capability, tenantId, isActive: true } });
    return entities.map(e => ({ ...e } as unknown as PromptTemplate));
  }

  async findAll(tenantId: string): Promise<PromptTemplate[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as PromptTemplate));
  }

  async update(id: string, tenantId: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as PromptTemplate;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class AIUsageLogRepositoryImpl implements IAIUsageLogRepository {
  constructor(
    @InjectRepository(AIUsageLogOrmEntity)
    private readonly repo: Repository<AIUsageLogOrmEntity>,
  ) {}

  async save(log: AIUsageLog): Promise<AIUsageLog> {
    const entity = this.repo.create(log as unknown as AIUsageLogOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as AIUsageLog;
  }

  async findByTenant(tenantId: string, from: Date, to: Date): Promise<AIUsageLog[]> {
    const entities = await this.repo.find({
      where: { tenantId, createdAt: Between(from, to) },
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => ({ ...e } as unknown as AIUsageLog));
  }

  async findByModel(modelId: string, tenantId: string, from: Date, to: Date): Promise<AIUsageLog[]> {
    const entities = await this.repo.find({
      where: { modelId, tenantId, createdAt: Between(from, to) },
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => ({ ...e } as unknown as AIUsageLog));
  }

  async getTotalCost(tenantId: string, from: Date, to: Date): Promise<number> {
    const result = await this.repo.createQueryBuilder('l')
      .select('COALESCE(SUM(l.cost), 0)', 'total')
      .where('l.tenant_id = :tenantId', { tenantId })
      .andWhere('l.created_at BETWEEN :from AND :to', { from, to })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getUsageStats(tenantId: string, from: Date, to: Date): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    avgLatency: number;
    successRate: number;
  }> {
    const result = await this.repo.createQueryBuilder('l')
      .select([
        'COUNT(*)::int as "totalRequests"',
        'COALESCE(SUM(l.total_tokens), 0)::int as "totalTokens"',
        'COALESCE(SUM(l.cost), 0)::decimal as "totalCost"',
        'COALESCE(AVG(l.latency_ms), 0)::decimal as "avgLatency"',
        'CASE WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN l.success THEN 1 ELSE 0 END)::decimal / COUNT(*) * 100) ELSE 0 END as "successRate"',
      ])
      .where('l.tenant_id = :tenantId', { tenantId })
      .andWhere('l.created_at BETWEEN :from AND :to', { from, to })
      .getRawOne();
    return {
      totalRequests: parseInt(result?.totalRequests || '0'),
      totalTokens: parseInt(result?.totalTokens || '0'),
      totalCost: parseFloat(result?.totalCost || '0'),
      avgLatency: parseFloat(result?.avgLatency || '0'),
      successRate: parseFloat(result?.successRate || '0'),
    };
  }
}

@Injectable()
export class TenantAIBudgetRepositoryImpl implements ITenantAIBudgetRepository {
  constructor(
    @InjectRepository(TenantAIBudgetOrmEntity)
    private readonly repo: Repository<TenantAIBudgetOrmEntity>,
  ) {}

  async save(budget: TenantAIBudget): Promise<TenantAIBudget> {
    const entity = this.repo.create(budget as unknown as TenantAIBudgetOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as TenantAIBudget;
  }

  async findByTenantAndMonth(tenantId: string, month: string): Promise<TenantAIBudget | null> {
    const entity = await this.repo.findOne({ where: { tenantId, budgetMonth: month } });
    return entity ? ({ ...entity } as unknown as TenantAIBudget) : null;
  }

  async update(id: string, tenantId: string, updates: Partial<TenantAIBudget>): Promise<TenantAIBudget> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as TenantAIBudget;
  }

  async incrementUsage(tenantId: string, month: string, amount: number): Promise<void> {
    await this.repo.createQueryBuilder()
      .update(TenantAIBudgetOrmEntity)
      .set({
        usedBudget: () => `used_budget + ${amount}`,
        isExceeded: () => `(used_budget + ${amount}) >= monthly_budget`,
      })
      .where('tenant_id = :tenantId AND budget_month = :month', { tenantId, month })
      .execute();
  }
}

@Injectable()
export class AIKillSwitchRepositoryImpl implements IAIKillSwitchRepository {
  constructor(
    @InjectRepository(AIKillSwitchOrmEntity)
    private readonly repo: Repository<AIKillSwitchOrmEntity>,
  ) {}

  async save(killSwitch: AIKillSwitch): Promise<AIKillSwitch> {
    const entity = this.repo.create(killSwitch as unknown as AIKillSwitchOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as AIKillSwitch;
  }

  async findByTenant(tenantId: string): Promise<AIKillSwitch | null> {
    const entity = await this.repo.findOne({ where: { tenantId } });
    return entity ? ({ ...entity } as unknown as AIKillSwitch) : null;
  }

  async update(tenantId: string, updates: Partial<AIKillSwitch>): Promise<AIKillSwitch> {
    await this.repo.update({ tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { tenantId } });
    return { ...entity } as unknown as AIKillSwitch;
  }
}
