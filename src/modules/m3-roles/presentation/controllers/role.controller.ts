import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from '../../application/services/role.service';
import { GetTenant, TenantContext } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Roles (M3)')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@GetTenant() ctx: TenantContext, @Body() body: { name: string; description: string; permissions: string[] }) {
    return this.roleService.create(ctx.tenantId, body, ctx.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all roles for tenant' })
  async findAll(@GetTenant() ctx: TenantContext) {
    return this.roleService.findAll(ctx.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findById(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.roleService.findById(id, ctx.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(@GetTenant() ctx: TenantContext, @Param('id') id: string, @Body() body: { name?: string; description?: string; permissions?: string[] }) {
    return this.roleService.update(id, ctx.tenantId, body, ctx.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async delete(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.roleService.delete(id, ctx.tenantId, ctx.userId);
  }
}
