import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { GetTenantId } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Audit (K3)')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async queryAuditLogs(
    @GetTenantId() tenantId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.query({
      tenantId,
      entityType,
      entityId,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
