import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceOrmEntity } from './infrastructure/persistence/repositories/attendance.orm-entity';
import { AttendanceRepositoryImpl } from './infrastructure/persistence/repositories/attendance.repository';
import { AttendanceService } from './application/services/attendance.service';
import { AttendanceController } from './presentation/controllers/attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceOrmEntity])],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepositoryImpl,
    },
  ],
  exports: [AttendanceService],
})
export class M7AttendanceModule {}
