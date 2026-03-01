import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRegistrationOrmEntity, ServiceEndpointOrmEntity, ServiceDependencyOrmEntity } from './infrastructure/persistence/repositories/registry.orm-entity';
import { ServiceRegistrationRepositoryImpl, ServiceEndpointRepositoryImpl, ServiceDependencyRepositoryImpl } from './infrastructure/persistence/repositories/registry.repository';
import { RegistryService } from './application/services/registry.service';
import { RegistryController } from './presentation/controllers/registry.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRegistrationOrmEntity, ServiceEndpointOrmEntity, ServiceDependencyOrmEntity]),
  ],
  controllers: [RegistryController],
  providers: [
    RegistryService,
    { provide: 'IServiceRegistrationRepository', useClass: ServiceRegistrationRepositoryImpl },
    { provide: 'IServiceEndpointRepository', useClass: ServiceEndpointRepositoryImpl },
    { provide: 'IServiceDependencyRepository', useClass: ServiceDependencyRepositoryImpl },
  ],
  exports: [RegistryService],
})
export class K10RegistryModule {}
