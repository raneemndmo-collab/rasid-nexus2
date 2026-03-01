import { CollaborationSession, CollaborationChange, CollaborationPresence } from '../entities/collaboration.entity';

export interface ICollaborationRepository {
  createSession(s: Omit<CollaborationSession, 'id' | 'createdAt'>): Promise<CollaborationSession>;
  findSessionById(tenantId: string, id: string): Promise<CollaborationSession | null>;
  listSessions(tenantId: string): Promise<CollaborationSession[]>;
  updateSession(tenantId: string, id: string, updates: Partial<CollaborationSession>): Promise<CollaborationSession>;

  addChange(c: Omit<CollaborationChange, 'id' | 'createdAt'>): Promise<CollaborationChange>;
  listChanges(tenantId: string, sessionId: string, sinceVersion?: number): Promise<CollaborationChange[]>;

  upsertPresence(p: Omit<CollaborationPresence, 'id'>): Promise<CollaborationPresence>;
  listPresence(tenantId: string, sessionId: string): Promise<CollaborationPresence[]>;
}

export const COLLABORATION_REPOSITORY = Symbol('ICollaborationRepository');
