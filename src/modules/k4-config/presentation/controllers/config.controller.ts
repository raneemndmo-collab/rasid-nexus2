import { Controller, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '../../application/services/config.service';
import { GetTenantId } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Configuration (K4)')
@ApiBearerAuth()
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get(':key')
  @ApiOperation({ summary: 'Get configuration value by key' })
  async get(@GetTenantId() tenantId: string, @Param('key') key: string) {
    return this.configService.get(tenantId, key);
  }

  @Get()
  @ApiOperation({ summary: 'Get all configurations for tenant' })
  async getAll(@GetTenantId() tenantId: string) {
    return this.configService.getAll(tenantId);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Set configuration value' })
  async set(
    @GetTenantId() tenantId: string,
    @Param('key') key: string,
    @Body() body: { value: unknown; description?: string; type?: string },
  ) {
    return this.configService.set(tenantId, key, body.value, body.description, body.type);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete configuration' })
  async delete(@GetTenantId() tenantId: string, @Param('key') key: string) {
    return this.configService.delete(tenantId, key);
  }
}
