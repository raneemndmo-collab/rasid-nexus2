import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledJobOrmEntity, JobExecutionLogOrmEntity } from './infrastructure/persistence/repositories/scheduler.orm-entity';
import { SchedulerRepositoryImpl, JobExecutionLogRepositoryImpl } from './infrastructure/persistence/repositories/scheduler.repository';
import { SchedulerService } from './application/services/scheduler.service';
import { SchedulerController } from './presentation/controllers/scheduler.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledJobOrmEntity, JobExecutionLogOrmEntity]),
  ],
  controllers: [SchedulerController],
  providers: [
    SchedulerService,
    {
      provide: 'ISchedulerRepository',
      useClass: SchedulerRepositoryImpl,
    },
    {
      provide: 'IJobExecutionLogRepository',
      useClass: JobExecutionLogRepositoryImpl,
    },
  ],
  exports: [SchedulerService],
})
export class K7SchedulerModule {}
