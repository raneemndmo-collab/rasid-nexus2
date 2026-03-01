export enum SessionType { DOCUMENT = 'document', SPREADSHEET = 'spreadsheet', WHITEBOARD = 'whiteboard', FORM = 'form' }
export enum SessionStatus { ACTIVE = 'active', PAUSED = 'paused', ENDED = 'ended' }
export enum PresenceStatus { ONLINE = 'online', IDLE = 'idle', OFFLINE = 'offline' }

export interface CollaborationSession {
  id: string;
  tenantId: string;
  name: string;
  type: SessionType;
  resourceId: string;
  resourceType: string;
  status: SessionStatus;
  maxParticipants: number;
  createdBy: string;
  createdAt: Date;
  endedAt?: Date;
}

export interface CollaborationChange {
  id: string;
  tenantId: string;
  sessionId: string;
  userId: string;
  changeType: string;
  path: string;
  value?: unknown;
  version: number;
  createdAt: Date;
}

export interface CollaborationPresence {
  id: string;
  tenantId: string;
  sessionId: string;
  userId: string;
  status: PresenceStatus;
  cursorPosition?: { line: number; column: number };
  lastSeenAt: Date;
}
