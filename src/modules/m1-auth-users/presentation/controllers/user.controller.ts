import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service';
import { GetTenant, TenantContext } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Users (M1)')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @GetTenant() ctx: TenantContext,
    @Body() body: { email: string; password: string; firstName: string; lastName: string; roles?: string[] },
  ) {
    return this.userService.create(ctx.tenantId, body, ctx.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all users for tenant' })
  async findAll(@GetTenant() ctx: TenantContext) {
    return this.userService.findAll(ctx.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.userService.findById(id, ctx.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @GetTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; isActive?: boolean; roles?: string[] },
  ) {
    return this.userService.update(id, ctx.tenantId, body, ctx.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async delete(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.userService.delete(id, ctx.tenantId, ctx.userId);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(
    @GetTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.userService.assignRole(id, ctx.tenantId, body.role, ctx.userId);
  }
}
