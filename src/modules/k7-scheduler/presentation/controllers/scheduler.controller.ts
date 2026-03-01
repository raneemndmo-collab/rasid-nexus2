import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Delete, Body, Param, Headers } from '@nestjs/common';
import { SchedulerService, CreateJobDto } from '../../application/services/scheduler.service';
import { JobType } from '../../domain/entities/scheduled-job.entity';

@ApiTags('k7-scheduler')
@Controller('k7/scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('jobs')
  async createJob(
    @Body() body: { name: string; type: JobType; cronExpression?: string; scheduledAt?: string; handler: string; payload: Record<string, unknown>; maxRetries?: number; timeoutMs?: number },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CreateJobDto = {
      ...body,
      tenantId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    };
    return this.schedulerService.createJob(dto);
  }

  @Get('jobs')
  async getJobs(@Headers('x-tenant-id') tenantId: string) {
    return this.schedulerService.getJobs(tenantId);
  }

  @Get('jobs/:id/logs')
  async getJobLogs(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.schedulerService.getJobLogs(id, tenantId);
  }

  @Delete('jobs/:id')
  async cancelJob(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    await this.schedulerService.cancelJob(id, tenantId);
    return { message: 'Job cancelled' };
  }

  @Post('process')
  async processDueJobs() {
    const count = await this.schedulerService.processDueJobs();
    return { processed: count };
  }
}
