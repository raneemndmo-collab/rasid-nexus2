import { MessageThread, Message } from '../entities/message.entity';

export interface IMessageRepository {
  createThread(t: Omit<MessageThread, 'id' | 'createdAt'>): Promise<MessageThread>;
  findThreadById(tenantId: string, id: string): Promise<MessageThread | null>;
  listThreads(tenantId: string): Promise<MessageThread[]>;

  createMessage(m: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message>;
  findMessageById(tenantId: string, id: string): Promise<Message | null>;
  listMessages(tenantId: string, threadId: string): Promise<Message[]>;
  updateMessage(tenantId: string, id: string, updates: Partial<Message>): Promise<Message>;
}

export const MESSAGE_REPOSITORY = Symbol('IMessageRepository');
