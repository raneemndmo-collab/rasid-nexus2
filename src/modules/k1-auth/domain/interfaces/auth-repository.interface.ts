export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthTokenRecord {
  id: string;
  userId: string;
  tenantId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface IAuthRepository {
  storeToken(record: Omit<IAuthTokenRecord, 'id' | 'createdAt'>): Promise<IAuthTokenRecord>;
  findToken(tokenHash: string): Promise<IAuthTokenRecord | null>;
  revokeToken(tokenHash: string): Promise<void>;
  revokeAllUserTokens(userId: string, tenantId: string): Promise<void>;
  isTokenRevoked(tokenHash: string): Promise<boolean>;
}
