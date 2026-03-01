import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingOrmEntity, SettingHistoryOrmEntity } from './infrastructure/persistence/repositories/setting.orm-entity';
import { SettingRepositoryImpl, SettingHistoryRepositoryImpl } from './infrastructure/persistence/repositories/setting.repository';
import { SettingService } from './application/services/setting.service';
import { SettingController } from './presentation/controllers/setting.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingOrmEntity, SettingHistoryOrmEntity]),
  ],
  controllers: [SettingController],
  providers: [
    SettingService,
    { provide: 'ISettingRepository', useClass: SettingRepositoryImpl },
    { provide: 'ISettingHistoryRepository', useClass: SettingHistoryRepositoryImpl },
  ],
  exports: [SettingService],
})
export class M10SettingsModule {}
