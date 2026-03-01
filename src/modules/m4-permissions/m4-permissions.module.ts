import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionOrmEntity } from './infrastructure/persistence/repositories/permission.orm-entity';
import { PermissionRepository } from './infrastructure/persistence/repositories/permission.repository';
import { PermissionService } from './application/services/permission.service';
import { PermissionController } from './presentation/controllers/permission.controller';
import { PERMISSION_REPOSITORY } from './domain/interfaces/permission-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionOrmEntity])],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    { provide: PERMISSION_REPOSITORY, useClass: PermissionRepository },
  ],
  exports: [PermissionService],
})
export class M4PermissionsModule {}
