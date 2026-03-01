import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationSessionEntity, CollaborationChangeEntity, CollaborationPresenceEntity } from './infrastructure/persistence/repositories/collaboration.orm-entity';
import { CollaborationRepository } from './infrastructure/persistence/repositories/collaboration.repository';
import { CollaborationService } from './application/services/collaboration.service';
import { CollaborationController } from './presentation/controllers/collaboration.controller';
import { COLLABORATION_REPOSITORY } from './domain/interfaces/collaboration-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CollaborationSessionEntity, CollaborationChangeEntity, CollaborationPresenceEntity])],
  controllers: [CollaborationController],
  providers: [
    { provide: COLLABORATION_REPOSITORY, useClass: CollaborationRepository },
    CollaborationService,
  ],
  exports: [CollaborationService],
})
export class M23CollaborationModule {}
