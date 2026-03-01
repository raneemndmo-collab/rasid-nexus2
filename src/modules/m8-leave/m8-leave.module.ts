import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestOrmEntity, LeaveBalanceOrmEntity } from './infrastructure/persistence/repositories/leave.orm-entity';
import { LeaveRequestRepositoryImpl, LeaveBalanceRepositoryImpl } from './infrastructure/persistence/repositories/leave.repository';
import { LeaveService } from './application/services/leave.service';
import { LeaveController } from './presentation/controllers/leave.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequestOrmEntity, LeaveBalanceOrmEntity])],
  controllers: [LeaveController],
  providers: [
    LeaveService,
    {
      provide: 'ILeaveRequestRepository',
      useClass: LeaveRequestRepositoryImpl,
    },
    {
      provide: 'ILeaveBalanceRepository',
      useClass: LeaveBalanceRepositoryImpl,
    },
  ],
  exports: [LeaveService],
})
export class M8LeaveModule {}
