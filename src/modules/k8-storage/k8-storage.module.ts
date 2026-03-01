import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredObjectOrmEntity, StorageQuotaOrmEntity } from './infrastructure/persistence/repositories/storage.orm-entity';
import { StorageRepositoryImpl, StorageQuotaRepositoryImpl } from './infrastructure/persistence/repositories/storage.repository';
import { LocalObjectStore } from './infrastructure/external/local-object-store';
import { StorageService } from './application/services/storage.service';
import { StorageController } from './presentation/controllers/storage.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoredObjectOrmEntity, StorageQuotaOrmEntity]),
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    { provide: 'IStorageRepository', useClass: StorageRepositoryImpl },
    { provide: 'IStorageQuotaRepository', useClass: StorageQuotaRepositoryImpl },
    { provide: 'IObjectStore', useClass: LocalObjectStore },
  ],
  exports: [StorageService],
})
export class K8StorageModule {}
