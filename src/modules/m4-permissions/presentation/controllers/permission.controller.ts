import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from '../../application/services/permission.service';
import { GetTenant, TenantContext } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Permissions (M4)')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  async create(@GetTenant() ctx: TenantContext, @Body() body: { code: string; name: string; description: string; module: string }) {
    return this.permissionService.create(ctx.tenantId, body, ctx.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions for tenant' })
  async findAll(@GetTenant() ctx: TenantContext) {
    return this.permissionService.findAll(ctx.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  async findById(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.permissionService.findById(id, ctx.tenantId);
  }

  @Get('check/:code')
  @ApiOperation({ summary: 'Check if user has permission' })
  async check(@GetTenant() ctx: TenantContext, @Param('code') code: string) {
    const hasPermission = await this.permissionService.checkPermission(ctx.userId, ctx.tenantId, code);
    return { hasPermission };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  async delete(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.permissionService.delete(id, ctx.tenantId, ctx.userId);
  }
}
