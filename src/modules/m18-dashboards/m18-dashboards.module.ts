import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardEntity, WidgetEntity } from './infrastructure/persistence/repositories/dashboard.orm-entity';
import { DashboardRepository } from './infrastructure/persistence/repositories/dashboard.repository';
import { DashboardService, AI_INSIGHT_PORT } from './application/services/dashboard.service';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { DASHBOARD_REPOSITORY } from './domain/interfaces/dashboard-repository.interface';

const AIInsightStub = {
  provide: AI_INSIGHT_PORT,
  useValue: { generateInsight: async (_t: string, _c: string) => 'AI insight stub' },
};

@Module({
  imports: [TypeOrmModule.forFeature([DashboardEntity, WidgetEntity])],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    AIInsightStub,
    DashboardService,
  ],
  exports: [DashboardService],
})
export class M18DashboardsModule {}
