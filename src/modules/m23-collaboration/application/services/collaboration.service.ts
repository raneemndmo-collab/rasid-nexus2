import { Injectable, Inject } from '@nestjs/common';
import { ICollaborationRepository, COLLABORATION_REPOSITORY } from '../../domain/interfaces/collaboration-repository.interface';
import { CollaborationSession, CollaborationChange, CollaborationPresence, SessionStatus, PresenceStatus } from '../../domain/entities/collaboration.entity';
import { CollaborationEvents } from '../../domain/events/collaboration.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class CollaborationService {
  constructor(
    @Inject(COLLABORATION_REPOSITORY) private readonly repo: ICollaborationRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createSession(data: Omit<CollaborationSession, 'id' | 'createdAt'>): Promise<CollaborationSession> {
    const session = await this.repo.createSession(data);
    await this.eventBus.publish({ event_type: CollaborationEvents.SESSION_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: session });
    return session;
  }
  async getSession(tenantId: string, id: string) { return this.repo.findSessionById(tenantId, id); }
  async listSessions(tenantId: string) { return this.repo.listSessions(tenantId); }

  async endSession(tenantId: string, id: string): Promise<CollaborationSession> {
    const session = await this.repo.updateSession(tenantId, id, { status: SessionStatus.ENDED, endedAt: new Date() } as Partial<CollaborationSession>);
    await this.eventBus.publish({ event_type: CollaborationEvents.SESSION_ENDED, tenant_id: tenantId, timestamp: new Date(), payload: session });
    return session;
  }

  async applyChange(data: Omit<CollaborationChange, 'id' | 'createdAt'>): Promise<{ change: CollaborationChange; conflict: boolean }> {
    // OT-style conflict detection: check if there are newer changes at the same path
    const recentChanges = await this.repo.listChanges(data.tenantId, data.sessionId, data.version);
    const conflict = recentChanges.some(c => c.path === data.path && c.userId !== data.userId);

    if (conflict) {
      await this.eventBus.publish({
        event_type: CollaborationEvents.CONFLICT_DETECTED,
        tenant_id: data.tenantId, timestamp: new Date(),
        payload: { sessionId: data.sessionId, path: data.path, version: data.version },
      });
    }

    // Apply change with incremented version
    const latestVersion = recentChanges.length > 0 ? Math.max(...recentChanges.map(c => c.version)) + 1 : data.version;
    const change = await this.repo.addChange({ ...data, version: latestVersion });
    await this.eventBus.publish({ event_type: CollaborationEvents.CHANGE_APPLIED, tenant_id: data.tenantId, timestamp: new Date(), payload: change });

    return { change, conflict };
  }

  async getChanges(tenantId: string, sessionId: string, sinceVersion?: number) {
    return this.repo.listChanges(tenantId, sessionId, sinceVersion);
  }

  async joinSession(tenantId: string, sessionId: string, userId: string): Promise<CollaborationPresence> {
    const presence = await this.repo.upsertPresence({
      tenantId,
      sessionId,
      userId,
      status: PresenceStatus.ONLINE,
      lastSeenAt: new Date(),
    });
    await this.eventBus.publish({ event_type: CollaborationEvents.USER_JOINED, tenant_id: tenantId, timestamp: new Date(), payload: { sessionId, userId } });
    return presence;
  }

  async leaveSession(tenantId: string, sessionId: string, userId: string): Promise<CollaborationPresence> {
    const presence = await this.repo.upsertPresence({
      tenantId,
      sessionId,
      userId,
      status: PresenceStatus.OFFLINE,
      lastSeenAt: new Date(),
    });
    await this.eventBus.publish({ event_type: CollaborationEvents.USER_LEFT, tenant_id: tenantId, timestamp: new Date(), payload: { sessionId, userId } });
    return presence;
  }

  async getPresence(tenantId: string, sessionId: string) {
    return this.repo.listPresence(tenantId, sessionId);
  }
}
