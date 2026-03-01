import { AIModel, PromptTemplate, AIUsageLog, TenantAIBudget, AIKillSwitch } from '../entities/ai.entity';

export interface IAIModelRepository {
  save(model: AIModel): Promise<AIModel>;
  findById(id: string, tenantId: string): Promise<AIModel | null>;
  findByCapability(capability: string, tenantId: string): Promise<AIModel[]>;
  findAll(tenantId: string): Promise<AIModel[]>;
  findByFallbackLevel(capability: string, level: string, tenantId: string): Promise<AIModel | null>;
  update(id: string, tenantId: string, updates: Partial<AIModel>): Promise<AIModel>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IPromptTemplateRepository {
  save(prompt: PromptTemplate): Promise<PromptTemplate>;
  findById(id: string, tenantId: string): Promise<PromptTemplate | null>;
  findByName(name: string, tenantId: string): Promise<PromptTemplate | null>;
  findByCapability(capability: string, tenantId: string): Promise<PromptTemplate[]>;
  findAll(tenantId: string): Promise<PromptTemplate[]>;
  update(id: string, tenantId: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IAIUsageLogRepository {
  save(log: AIUsageLog): Promise<AIUsageLog>;
  findByTenant(tenantId: string, from: Date, to: Date): Promise<AIUsageLog[]>;
  findByModel(modelId: string, tenantId: string, from: Date, to: Date): Promise<AIUsageLog[]>;
  getTotalCost(tenantId: string, from: Date, to: Date): Promise<number>;
  getUsageStats(tenantId: string, from: Date, to: Date): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    avgLatency: number;
    successRate: number;
  }>;
}

export interface ITenantAIBudgetRepository {
  save(budget: TenantAIBudget): Promise<TenantAIBudget>;
  findByTenantAndMonth(tenantId: string, month: string): Promise<TenantAIBudget | null>;
  update(id: string, tenantId: string, updates: Partial<TenantAIBudget>): Promise<TenantAIBudget>;
  incrementUsage(tenantId: string, month: string, amount: number): Promise<void>;
}

export interface IAIKillSwitchRepository {
  save(killSwitch: AIKillSwitch): Promise<AIKillSwitch>;
  findByTenant(tenantId: string): Promise<AIKillSwitch | null>;
  update(tenantId: string, updates: Partial<AIKillSwitch>): Promise<AIKillSwitch>;
}
