import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
import { IAuditService, AuditEntry } from '@shared/domain/interfaces/audit-service.interface';

@Injectable()
export class AuditRepository implements IAuditService {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    const entity = this.repo.create({
      tenantId: entry.tenantId,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      correlationId: entry.correlationId,
    });
    await this.repo.save(entity);
  }

  async query(params: {
    tenantId: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ entries: AuditEntry[]; total: number }> {
    const where: FindOptionsWhere<AuditLogOrmEntity> = {
      tenantId: params.tenantId,
    };

    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.userId = params.userId;
    if (params.from && params.to) {
      where.createdAt = Between(params.from, params.to);
    }

    const page = params.page || 1;
    const limit = params.limit || 50;

    const [results, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      entries: results.map(r => ({
        id: r.id,
        tenantId: r.tenantId,
        userId: r.userId,
        action: r.action,
        entityType: r.entityType,
        entityId: r.entityId,
        oldValue: r.oldValue,
        newValue: r.newValue,
        ipAddress: r.ipAddress,
        userAgent: r.userAgent,
        timestamp: r.createdAt,
        correlationId: r.correlationId,
      })),
      total,
    };
  }
}
