import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionOrmEntity } from './infrastructure/persistence/repositories/action.orm-entity';
import { ActionRepository } from './infrastructure/persistence/repositories/action.repository';
import { ActionService } from './application/services/action.service';
import { ActionController } from './presentation/controllers/action.controller';
import { ACTION_REPOSITORY } from './domain/interfaces/action-repository.interface';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ActionOrmEntity])],
  controllers: [ActionController],
  providers: [
    ActionService,
    { provide: ACTION_REPOSITORY, useClass: ActionRepository },
  ],
  exports: [ActionService],
})
export class M30ActionsModule {}
