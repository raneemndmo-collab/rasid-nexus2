import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Param, Body, Headers } from '@nestjs/common';
import { FormService } from '../../application/services/form.service';

@ApiTags('forms')
@Controller('api/v1/forms')
export class FormController {
  constructor(private readonly service: FormService) {}

  @Post('definitions')
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createDefinition({ ...body, tenantId });
  }
  @Get('definitions')
  list(@Headers('x-tenant-id') tenantId: string) { return this.service.listDefinitions(tenantId); }
  @Get('definitions/:id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getDefinition(tenantId, id); }
  @Put('definitions/:id/publish')
  publish(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.publishDefinition(tenantId, id); }
  @Post('definitions/:id/submit')
  submit(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: { submittedBy: string; data: Record<string, unknown> }) {
    return this.service.submitForm(tenantId, id, body.submittedBy, body.data);
  }
  @Get('definitions/:id/submissions')
  listSubs(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.listSubmissions(tenantId, id); }
}
