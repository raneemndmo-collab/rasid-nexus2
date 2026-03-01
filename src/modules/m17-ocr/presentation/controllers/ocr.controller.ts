import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { OcrService } from '../../application/services/ocr.service';

@ApiTags('ocr')
@Controller('api/v1/ocr')
export class OcrController {
  constructor(private readonly service: OcrService) {}

  @Post('jobs')
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createJob({ ...body, tenantId });
  }
  @Post('jobs/:id/process')
  process(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.processJob(tenantId, id);
  }
  @Get('jobs')
  list(@Headers('x-tenant-id') tenantId: string) { return this.service.listJobs(tenantId); }
  @Get('jobs/:id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getJob(tenantId, id); }
}
