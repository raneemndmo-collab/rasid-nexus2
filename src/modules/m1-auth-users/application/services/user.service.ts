import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { USER_REPOSITORY, IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { User } from '../../domain/entities/user.entity';

const SALT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async create(tenantId: string, data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roles?: string[];
  }, actorId: string): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findByEmail(data.email, tenantId);
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const correlationId = uuidv4();

    const user = await this.userRepo.create({
      tenantId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: true,
      roles: data.roles || [],
    });

    await this.auditService.log({
      tenantId,
      userId: actorId,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: user.id,
      newValue: { email: user.email, firstName: user.firstName, lastName: user.lastName },
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'auth.user.created',
      tenant_id: tenantId,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId: user.id, email: user.email },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findById(id: string, tenantId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepo.findById(id, tenantId);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll(tenantId: string): Promise<Array<Omit<User, 'passwordHash'>>> {
    const users = await this.userRepo.findAll(tenantId);
    return users.map(({ passwordHash: _, ...rest }) => rest);
  }

  async update(id: string, tenantId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'isActive' | 'roles'>>, actorId: string): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    const correlationId = uuidv4();
    const user = await this.userRepo.update(id, tenantId, data);

    await this.auditService.log({
      tenantId,
      userId: actorId,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: id,
      oldValue: { firstName: existing.firstName, lastName: existing.lastName },
      newValue: data as Record<string, unknown>,
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'auth.user.updated',
      tenant_id: tenantId,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId: id, changes: data },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.userRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    const correlationId = uuidv4();
    await this.userRepo.delete(id, tenantId);

    await this.auditService.log({
      tenantId,
      userId: actorId,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: id,
      oldValue: { email: existing.email },
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'auth.user.deleted',
      tenant_id: tenantId,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId: id },
    });
  }

  async validateCredentials(email: string, password: string, tenantId: string): Promise<User | null> {
    const user = await this.userRepo.findByEmail(email, tenantId);
    if (!user) return null;
    if (!user.isActive) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async assignRole(userId: string, tenantId: string, role: string, actorId: string): Promise<void> {
    const user = await this.userRepo.findById(userId, tenantId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const roles = [...new Set([...user.roles, role])];
    await this.userRepo.update(userId, tenantId, { roles });

    const correlationId = uuidv4();
    await this.auditService.log({
      tenantId,
      userId: actorId,
      action: 'ASSIGN_ROLE',
      entityType: 'user',
      entityId: userId,
      newValue: { role },
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'auth.user.role_assigned',
      tenant_id: tenantId,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { userId, role },
    });
  }
}
