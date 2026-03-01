// ═══════════════════════════════════════════════════════════
// M11 AI Engine Module
// CRITICAL: Fully isolated — no business DB, no domain imports
// AI-007: Only accesses m11_ai_db
// AI-008: No imports from any domain module
// ═══════════════════════════════════════════════════════════

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AIModelOrmEntity,
  PromptTemplateOrmEntity,
  AIUsageLogOrmEntity,
  TenantAIBudgetOrmEntity,
  AIKillSwitchOrmEntity,
} from './infrastructure/persistence/repositories/ai.orm-entity';
import {
  AIModelRepositoryImpl,
  PromptTemplateRepositoryImpl,
  AIUsageLogRepositoryImpl,
  TenantAIBudgetRepositoryImpl,
  AIKillSwitchRepositoryImpl,
} from './infrastructure/persistence/repositories/ai.repository';
import { AIService } from './application/services/ai.service';
import { AIController } from './presentation/controllers/ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AIModelOrmEntity,
      PromptTemplateOrmEntity,
      AIUsageLogOrmEntity,
      TenantAIBudgetOrmEntity,
      AIKillSwitchOrmEntity,
    ]),
  ],
  controllers: [AIController],
  providers: [
    AIService,
    { provide: 'IAIModelRepository', useClass: AIModelRepositoryImpl },
    { provide: 'IPromptTemplateRepository', useClass: PromptTemplateRepositoryImpl },
    { provide: 'IAIUsageLogRepository', useClass: AIUsageLogRepositoryImpl },
    { provide: 'ITenantAIBudgetRepository', useClass: TenantAIBudgetRepositoryImpl },
    { provide: 'IAIKillSwitchRepository', useClass: AIKillSwitchRepositoryImpl },
  ],
  exports: [AIService],
})
export class M11AIModule {}
