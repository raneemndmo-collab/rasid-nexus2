import { Injectable, Inject } from '@nestjs/common';
import { IMessageRepository, MESSAGE_REPOSITORY } from '../../domain/interfaces/message-repository.interface';
import { MessageThread, Message } from '../../domain/entities/message.entity';
import { MessageEvents } from '../../domain/events/message.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class MessageService {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly repo: IMessageRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createThread(data: Omit<MessageThread, 'id' | 'createdAt'>): Promise<MessageThread> {
    const thread = await this.repo.createThread(data);
    await this.eventBus.publish({ event_type: MessageEvents.THREAD_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: thread });
    return thread;
  }
  async getThread(tenantId: string, id: string) { return this.repo.findThreadById(tenantId, id); }
  async listThreads(tenantId: string) { return this.repo.listThreads(tenantId); }

  async sendMessage(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    const msg = await this.repo.createMessage(data);
    await this.eventBus.publish({ event_type: MessageEvents.MESSAGE_SENT, tenant_id: data.tenantId, timestamp: new Date(), payload: msg });
    return msg;
  }
  async listMessages(tenantId: string, threadId: string) { return this.repo.listMessages(tenantId, threadId); }

  async markAsRead(tenantId: string, messageId: string, userId: string): Promise<Message> {
    const msg = await this.repo.findMessageById(tenantId, messageId);
    if (!msg) throw new Error('Message not found');
    const readBy = [...(msg.readBy || []), { userId, readAt: new Date().toISOString() }];
    const updated = await this.repo.updateMessage(tenantId, messageId, { readBy } as Partial<Message>);
    await this.eventBus.publish({ event_type: MessageEvents.MESSAGE_READ, tenant_id: tenantId, timestamp: new Date(), payload: { messageId, userId } });
    return updated;
  }

  async editMessage(tenantId: string, messageId: string, content: string): Promise<Message> {
    const updated = await this.repo.updateMessage(tenantId, messageId, { content, isEdited: true });
    await this.eventBus.publish({ event_type: MessageEvents.MESSAGE_EDITED, tenant_id: tenantId, timestamp: new Date(), payload: updated });
    return updated;
  }
}
