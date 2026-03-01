import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentOrmEntity } from './infrastructure/persistence/repositories/department.orm-entity';
import { DepartmentRepositoryImpl } from './infrastructure/persistence/repositories/department.repository';
import { DepartmentService } from './application/services/department.service';
import { DepartmentController } from './presentation/controllers/department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentOrmEntity])],
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    {
      provide: 'IDepartmentRepository',
      useClass: DepartmentRepositoryImpl,
    },
  ],
  exports: [DepartmentService],
})
export class M5DepartmentsModule {}
