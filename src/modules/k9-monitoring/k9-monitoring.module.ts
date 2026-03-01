import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricRecordOrmEntity, AlertRuleOrmEntity, AlertOrmEntity, HealthCheckOrmEntity } from './infrastructure/persistence/repositories/monitoring.orm-entity';
import { MetricRepositoryImpl, AlertRuleRepositoryImpl, AlertRepositoryImpl, HealthCheckRepositoryImpl } from './infrastructure/persistence/repositories/monitoring.repository';
import { MonitoringService } from './application/services/monitoring.service';
import { MonitoringController } from './presentation/controllers/monitoring.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetricRecordOrmEntity, AlertRuleOrmEntity, AlertOrmEntity, HealthCheckOrmEntity]),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    { provide: 'IMetricRepository', useClass: MetricRepositoryImpl },
    { provide: 'IAlertRuleRepository', useClass: AlertRuleRepositoryImpl },
    { provide: 'IAlertRepository', useClass: AlertRepositoryImpl },
    { provide: 'IHealthCheckRepository', useClass: HealthCheckRepositoryImpl },
  ],
  exports: [MonitoringService],
})
export class K9MonitoringModule {}
