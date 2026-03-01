import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeOrmEntity } from './infrastructure/persistence/repositories/employee.orm-entity';
import { EmployeeRepositoryImpl } from './infrastructure/persistence/repositories/employee.repository';
import { EmployeeService } from './application/services/employee.service';
import { EmployeeController } from './presentation/controllers/employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeOrmEntity])],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    {
      provide: 'IEmployeeRepository',
      useClass: EmployeeRepositoryImpl,
    },
  ],
  exports: [EmployeeService],
})
export class M6EmployeesModule {}
