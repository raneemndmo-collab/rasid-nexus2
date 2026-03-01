import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ICollaborationRepository } from '../../../domain/interfaces/collaboration-repository.interface';
import { CollaborationSession, CollaborationChange, CollaborationPresence } from '../../../domain/entities/collaboration.entity';
import { CollaborationSessionEntity, CollaborationChangeEntity, CollaborationPresenceEntity } from './collaboration.orm-entity';

@Injectable()
export class CollaborationRepository implements ICollaborationRepository {
  constructor(
    @InjectRepository(CollaborationSessionEntity) private readonly sessRepo: Repository<CollaborationSessionEntity>,
    @InjectRepository(CollaborationChangeEntity) private readonly changeRepo: Repository<CollaborationChangeEntity>,
    @InjectRepository(CollaborationPresenceEntity) private readonly presRepo: Repository<CollaborationPresenceEntity>,
  ) {}

  async createSession(s: Omit<CollaborationSession, 'id' | 'createdAt'>): Promise<CollaborationSession> {
    return this.sessRepo.save(this.sessRepo.create(s)) as unknown as CollaborationSession;
  }
  async findSessionById(tenantId: string, id: string): Promise<CollaborationSession | null> {
    return this.sessRepo.findOne({ where: { tenantId, id } }) as unknown as CollaborationSession | null;
  }
  async listSessions(tenantId: string): Promise<CollaborationSession[]> {
    return this.sessRepo.find({ where: { tenantId } }) as unknown as CollaborationSession[];
  }
  async updateSession(tenantId: string, id: string, updates: Partial<CollaborationSession>): Promise<CollaborationSession> {
    await this.sessRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findSessionById(tenantId, id) as unknown as CollaborationSession;
  }
  async addChange(c: Omit<CollaborationChange, 'id' | 'createdAt'>): Promise<CollaborationChange> {
    return this.changeRepo.save(this.changeRepo.create(c)) as unknown as CollaborationChange;
  }
  async listChanges(tenantId: string, sessionId: string, sinceVersion?: number): Promise<CollaborationChange[]> {
    const where: Record<string, unknown> = { tenantId, sessionId };
    if (sinceVersion !== undefined) where.version = MoreThanOrEqual(sinceVersion);
    return this.changeRepo.find({ where, order: { version: 'ASC' } }) as unknown as CollaborationChange[];
  }
  async upsertPresence(p: Omit<CollaborationPresence, 'id'>): Promise<CollaborationPresence> {
    const existing = await this.presRepo.findOne({ where: { sessionId: p.sessionId, userId: p.userId } });
    if (existing) {
      await this.presRepo.update(existing.id, p as Record<string, unknown>);
      return { ...existing, ...p } as unknown as CollaborationPresence;
    }
    return this.presRepo.save(this.presRepo.create(p)) as unknown as CollaborationPresence;
  }
  async listPresence(tenantId: string, sessionId: string): Promise<CollaborationPresence[]> {
    return this.presRepo.find({ where: { tenantId, sessionId } }) as unknown as CollaborationPresence[];
  }
}
