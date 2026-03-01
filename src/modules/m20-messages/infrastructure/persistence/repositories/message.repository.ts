import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMessageRepository } from '../../../domain/interfaces/message-repository.interface';
import { MessageThread, Message } from '../../../domain/entities/message.entity';
import { MessageThreadEntity, MessageEntity } from './message.orm-entity';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageThreadEntity) private readonly threadRepo: Repository<MessageThreadEntity>,
    @InjectRepository(MessageEntity) private readonly msgRepo: Repository<MessageEntity>,
  ) {}

  async createThread(t: Omit<MessageThread, 'id' | 'createdAt'>): Promise<MessageThread> {
    return this.threadRepo.save(this.threadRepo.create(t)) as unknown as MessageThread;
  }
  async findThreadById(tenantId: string, id: string): Promise<MessageThread | null> {
    return this.threadRepo.findOne({ where: { tenantId, id } }) as unknown as MessageThread | null;
  }
  async listThreads(tenantId: string): Promise<MessageThread[]> {
    return this.threadRepo.find({ where: { tenantId } }) as unknown as MessageThread[];
  }
  async createMessage(m: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    return this.msgRepo.save(this.msgRepo.create(m)) as unknown as Message;
  }
  async findMessageById(tenantId: string, id: string): Promise<Message | null> {
    return this.msgRepo.findOne({ where: { tenantId, id } }) as unknown as Message | null;
  }
  async listMessages(tenantId: string, threadId: string): Promise<Message[]> {
    return this.msgRepo.find({ where: { tenantId, threadId }, order: { createdAt: 'ASC' } }) as unknown as Message[];
  }
  async updateMessage(tenantId: string, id: string, updates: Partial<Message>): Promise<Message> {
    await this.msgRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findMessageById(tenantId, id) as unknown as Message;
  }
}
