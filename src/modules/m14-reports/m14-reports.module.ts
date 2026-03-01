import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDefinitionOrmEntity, ReportExecutionOrmEntity, ScheduledReportOrmEntity } from './infrastructure/persistence/repositories/report.orm-entity';
import { ReportDefinitionRepositoryImpl, ReportExecutionRepositoryImpl, ScheduledReportRepositoryImpl } from './infrastructure/persistence/repositories/report.repository';
import { ReportService } from './application/services/report.service';
import { ReportController } from './presentation/controllers/report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportDefinitionOrmEntity, ReportExecutionOrmEntity, ScheduledReportOrmEntity]),
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    { provide: 'IReportDefinitionRepository', useClass: ReportDefinitionRepositoryImpl },
    { provide: 'IReportExecutionRepository', useClass: ReportExecutionRepositoryImpl },
    { provide: 'IScheduledReportRepository', useClass: ScheduledReportRepositoryImpl },
  ],
  exports: [ReportService],
})
export class M14ReportsModule {}
