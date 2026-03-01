import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollRunOrmEntity, PayrollItemOrmEntity, EmployeePayslipOrmEntity, SalaryStructureOrmEntity } from './infrastructure/persistence/repositories/payroll.orm-entity';
import { PayrollRunRepositoryImpl, PayrollItemRepositoryImpl, PayslipRepositoryImpl, SalaryStructureRepositoryImpl } from './infrastructure/persistence/repositories/payroll.repository';
import { PayrollService } from './application/services/payroll.service';
import { PayrollController } from './presentation/controllers/payroll.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollRunOrmEntity, PayrollItemOrmEntity, EmployeePayslipOrmEntity, SalaryStructureOrmEntity]),
  ],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    { provide: 'IPayrollRunRepository', useClass: PayrollRunRepositoryImpl },
    { provide: 'IPayrollItemRepository', useClass: PayrollItemRepositoryImpl },
    { provide: 'IPayslipRepository', useClass: PayslipRepositoryImpl },
    { provide: 'ISalaryStructureRepository', useClass: SalaryStructureRepositoryImpl },
  ],
  exports: [PayrollService],
})
export class M9PayrollModule {}
