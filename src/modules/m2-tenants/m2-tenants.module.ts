import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantOrmEntity } from './infrastructure/persistence/repositories/tenant.orm-entity';
import { TenantRepository } from './infrastructure/persistence/repositories/tenant.repository';
import { TenantService } from './application/services/tenant.service';
import { TenantController } from './presentation/controllers/tenant.controller';
import { TENANT_REPOSITORY } from './domain/interfaces/tenant-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TenantOrmEntity])],
  controllers: [TenantController],
  providers: [
    TenantService,
    {
      provide: TENANT_REPOSITORY,
      useClass: TenantRepository,
    },
  ],
  exports: [TenantService],
})
export class M2TenantsModule {}
