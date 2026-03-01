import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigOrmEntity } from './infrastructure/persistence/repositories/config.orm-entity';
import { ConfigRepository } from './infrastructure/persistence/repositories/config.repository';
import { ConfigService } from './application/services/config.service';
import { CACHE_SERVICE } from './application/services/config.service';
import { RedisCacheService } from './infrastructure/external/redis-cache.service';
import { ConfigController } from './presentation/controllers/config.controller';
import { CONFIG_REPOSITORY } from './domain/interfaces/config-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigOrmEntity])],
  controllers: [ConfigController],
  providers: [
    ConfigService,
    {
      provide: CONFIG_REPOSITORY,
      useClass: ConfigRepository,
    },
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [ConfigService, CACHE_SERVICE],
})
export class K4ConfigModule {}
