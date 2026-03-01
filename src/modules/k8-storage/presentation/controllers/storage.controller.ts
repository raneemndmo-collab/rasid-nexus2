import { Controller, Post, Get, Delete, Param, Body, Headers, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StorageService } from '../../application/services/storage.service';
import { Response } from 'express';

@ApiTags('K8 Storage')
@Controller('api/k8/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  async upload(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { bucket: string; originalName: string; mimeType: string; data: string; metadata?: Record<string, unknown> },
  ) {
    const data = Buffer.from(body.data, 'base64');
    return this.storageService.upload({
      tenantId,
      bucket: body.bucket,
      originalName: body.originalName,
      mimeType: body.mimeType,
      data,
      metadata: body.metadata,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Download a file' })
  async download(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response,
  ) {
    const result = await this.storageService.download(id, tenantId);
    res.set({
      'Content-Type': result.object.mimeType,
      'Content-Disposition': `attachment; filename="${result.object.originalName}"`,
      'Content-Length': result.data.length.toString(),
    });
    res.send(result.data);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a file' })
  async deleteObject(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    await this.storageService.deleteObject(id, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List all files' })
  async listObjects(@Headers('x-tenant-id') tenantId: string) {
    return this.storageService.listObjects(tenantId);
  }

  @Get('quota/current')
  @ApiOperation({ summary: 'Get storage quota' })
  async getQuota(@Headers('x-tenant-id') tenantId: string) {
    return this.storageService.getQuota(tenantId);
  }
}
