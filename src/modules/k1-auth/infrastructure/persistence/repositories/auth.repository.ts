import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthRepository, IAuthTokenRecord } from '../../../domain/interfaces/auth-repository.interface';
import { AuthTokenOrmEntity } from './auth-token.orm-entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AuthTokenOrmEntity)
    private readonly repo: Repository<AuthTokenOrmEntity>,
  ) {}

  async storeToken(record: Omit<IAuthTokenRecord, 'id' | 'createdAt'>): Promise<IAuthTokenRecord> {
    const entity = this.repo.create(record);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async findToken(tokenHash: string): Promise<IAuthTokenRecord | null> {
    return this.repo.findOne({ where: { tokenHash } });
  }

  async revokeToken(tokenHash: string): Promise<void> {
    await this.repo.update({ tokenHash }, { revoked: true });
  }

  async revokeAllUserTokens(userId: string, tenantId: string): Promise<void> {
    await this.repo.update({ userId, tenantId }, { revoked: true });
  }

  async isTokenRevoked(tokenHash: string): Promise<boolean> {
    const token = await this.repo.findOne({ where: { tokenHash } });
    if (!token) return false;
    return token.revoked;
  }
}
