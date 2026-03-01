import { Controller, Post, Get, Put, Delete, Param, Body, Query, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingService, CreateSettingDto, UpdateSettingDto } from '../../application/services/setting.service';

@ApiTags('M10 Settings')
@Controller('api/m10/settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a setting' })
  async create(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<CreateSettingDto, 'tenantId'>) {
    return this.settingService.create({ ...body, tenantId });
  }

  @Get()
  @ApiOperation({ summary: 'List all settings' })
  async list(@Headers('x-tenant-id') tenantId: string) {
    return this.settingService.list(tenantId);
  }

  @Get('by-key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  async getByKey(
    @Param('key') key: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('scope') scope?: string,
    @Query('scopeId') scopeId?: string,
  ) {
    return this.settingService.get(key, tenantId, scope, scopeId);
  }

  @Get('scope/:scope')
  @ApiOperation({ summary: 'List settings by scope' })
  async listByScope(
    @Param('scope') scope: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('scopeId') scopeId?: string,
  ) {
    return this.settingService.listByScope(tenantId, scope, scopeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get setting by ID' })
  async getById(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.settingService.getById(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a setting' })
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: UpdateSettingDto,
  ) {
    return this.settingService.update(id, tenantId, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a setting' })
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.settingService.delete(id, tenantId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get setting change history' })
  async getHistory(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.settingService.getHistory(id, tenantId);
  }
}
