import { Controller, Post, Get, Delete, Param, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegistryService, RegisterServiceDto } from '../../application/services/registry.service';

@ApiTags('K10 Registry')
@Controller('api/k10/registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Post('services')
  @ApiOperation({ summary: 'Register a service' })
  async register(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<RegisterServiceDto, 'tenantId'>) {
    return this.registryService.register({ ...body, tenantId });
  }

  @Delete('services/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deregister a service' })
  async deregister(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.registryService.deregister(id, tenantId);
  }

  @Post('services/:id/heartbeat')
  @HttpCode(204)
  @ApiOperation({ summary: 'Send heartbeat' })
  async heartbeat(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.registryService.heartbeat(id, tenantId);
  }

  @Get('services/discover/:name')
  @ApiOperation({ summary: 'Discover a service by name' })
  async discover(@Param('name') name: string, @Headers('x-tenant-id') tenantId: string) {
    return this.registryService.discover(name, tenantId);
  }

  @Get('services')
  @ApiOperation({ summary: 'List all services' })
  async listServices(@Headers('x-tenant-id') tenantId: string) {
    return this.registryService.listServices(tenantId);
  }

  @Get('services/active')
  @ApiOperation({ summary: 'List active services' })
  async listActiveServices(@Headers('x-tenant-id') tenantId: string) {
    return this.registryService.listActiveServices(tenantId);
  }

  @Get('services/:id/endpoints')
  @ApiOperation({ summary: 'Get service endpoints' })
  async getEndpoints(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.registryService.getEndpoints(id, tenantId);
  }

  @Get('services/:id/dependencies')
  @ApiOperation({ summary: 'Get service dependencies' })
  async getDependencies(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.registryService.getDependencies(id, tenantId);
  }
}
