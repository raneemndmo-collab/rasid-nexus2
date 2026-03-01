import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { AUTH_EVENTS } from '../../domain/events/auth.events';
import { AuthToken, JwtPayload } from '../../domain/entities/auth-token.entity';
import { LoginDto, TokenResponseDto } from '../dtos/auth.dto';

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface IUserValidator {
  validateCredentials(email: string, password: string, tenantId: string): Promise<{
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
  } | null>;
}

export const USER_VALIDATOR = Symbol('USER_VALIDATOR');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string, userValidator: IUserValidator): Promise<TokenResponseDto> {
    const correlationId = uuidv4();

    const user = await userValidator.validateCredentials(dto.email, dto.password, dto.tenantId);
    if (!user) {
      await this.eventBus.publish({
        event_id: uuidv4(),
        event_type: AUTH_EVENTS.LOGIN_FAILED,
        tenant_id: dto.tenantId,
        correlation_id: correlationId,
        timestamp: new Date().toISOString(),
        version: 1,
        payload: { email: dto.email, reason: 'Invalid credentials', ipAddress },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.issueToken(user.id, user.email, user.tenantId, user.roles);

    const tokenHash = crypto.createHash('sha256').update(token.accessToken).digest('hex');
    await this.authRepo.storeToken({
      userId: user.id,
      tenantId: user.tenantId,
      tokenHash,
      expiresAt: new Date(Date.now() + token.expiresIn * 1000),
      revoked: false,
    });

    await this.auditService.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'auth',
      entityId: user.id,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: AUTH_EVENTS.LOGIN_SUCCESS,
      tenant_id: user.tenantId,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId: user.id, email: user.email, roles: user.roles },
    });

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: token.expiresIn,
      tokenType: 'Bearer',
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const isRevoked = await this.authRepo.isTokenRevoked(tokenHash);
      if (isRevoked) {
        throw new UnauthorizedException('Token has been revoked');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async revokeToken(token: string, tenantId: string, userId: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.authRepo.revokeToken(tokenHash);

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: AUTH_EVENTS.TOKEN_REVOKED,
      tenant_id: tenantId,
      correlation_id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId },
    });
  }

  private async issueToken(userId: string, email: string, tenantId: string, roles: string[]): Promise<AuthToken> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      tenantId,
      email,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  getJwks(): { keys: Array<Record<string, string>> } {
    // In production, this would return the public key in JWKS format
    // For now, return a placeholder that matches the JWT signing key
    return {
      keys: [
        {
          kty: 'oct',
          kid: 'rasid-key-1',
          use: 'sig',
          alg: 'HS256',
        },
      ],
    };
  }
}
