import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from '../../application/services/tenant.service';
import { GetTenant, TenantContext } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Tenants (M2)')
@ApiBearerAuth()
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async create(
    @GetTenant() ctx: TenantContext,
    @Body() body: { name: string; slug: string; plan?: string; settings?: Record<string, unknown> },
  ) {
    return this.tenantService.create(body, ctx.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findById(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async update(
    @GetTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() body: { name?: string; isActive?: boolean; plan?: string; settings?: Record<string, unknown> },
  ) {
    return this.tenantService.update(id, body, ctx.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  async delete(@GetTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.tenantService.delete(id, ctx.userId);
  }
}
