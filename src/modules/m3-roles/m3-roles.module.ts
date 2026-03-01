import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleOrmEntity } from './infrastructure/persistence/repositories/role.orm-entity';
import { RoleRepository } from './infrastructure/persistence/repositories/role.repository';
import { RoleService } from './application/services/role.service';
import { RoleController } from './presentation/controllers/role.controller';
import { ROLE_REPOSITORY } from './domain/interfaces/role-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([RoleOrmEntity])],
  controllers: [RoleController],
  providers: [
    RoleService,
    { provide: ROLE_REPOSITORY, useClass: RoleRepository },
  ],
  exports: [RoleService],
})
export class M3RolesModule {}
