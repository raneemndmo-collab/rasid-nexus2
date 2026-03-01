import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageThreadEntity, MessageEntity } from './infrastructure/persistence/repositories/message.orm-entity';
import { MessageRepository } from './infrastructure/persistence/repositories/message.repository';
import { MessageService } from './application/services/message.service';
import { MessageController } from './presentation/controllers/message.controller';
import { MESSAGE_REPOSITORY } from './domain/interfaces/message-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([MessageThreadEntity, MessageEntity])],
  controllers: [MessageController],
  providers: [
    { provide: MESSAGE_REPOSITORY, useClass: MessageRepository },
    MessageService,
  ],
  exports: [MessageService],
})
export class M20MessagesModule {}
