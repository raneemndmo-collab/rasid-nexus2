import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { CalendarService } from '../../application/services/calendar.service';

@ApiTags('calendar')
@Controller('api/v1/calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @Post('events')
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createEvent({ ...body, tenantId });
  }
  @Get('events')
  list(@Headers('x-tenant-id') tenantId: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.listEvents(tenantId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
  @Get('events/:id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getEvent(tenantId, id); }
  @Put('events/:id')
  update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateEvent(tenantId, id, body);
  }
  @Delete('events/:id')
  cancel(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.cancelEvent(tenantId, id); }
}
