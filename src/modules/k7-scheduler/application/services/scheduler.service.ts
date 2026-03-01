import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ScheduledJobEntity, JobExecutionLog, JobStatus, JobType } from '../../domain/entities/scheduled-job.entity';
import { ISchedulerRepository, IJobExecutionLogRepository } from '../../domain/interfaces/scheduler-repository.interface';
import { SchedulerEvents } from '../../domain/events/scheduler.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface CreateJobDto {
  tenantId: string;
  name: string;
  type: JobType;
  cronExpression?: string;
  scheduledAt?: Date;
  handler: string;
  payload: Record<string, unknown>;
  maxRetries?: number;
  timeoutMs?: number;
}

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('ISchedulerRepository')
    private readonly jobRepo: ISchedulerRepository,
    @Inject('IJobExecutionLogRepository')
    private readonly logRepo: IJobExecutionLogRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  onModuleInit() {
    this.pollInterval = setInterval(() => this.processDueJobs(), 10_000);
    this.logger.log('Scheduler polling started (10s interval)');
  }

  async createJob(dto: CreateJobDto): Promise<ScheduledJobEntity> {
    const nextRunAt = dto.type === JobType.ONE_TIME
      ? dto.scheduledAt || new Date()
      : this.getNextCronRun(dto.cronExpression!);

    const job: Partial<ScheduledJobEntity> = {
      tenantId: dto.tenantId,
      name: dto.name,
      type: dto.type,
      cronExpression: dto.cronExpression,
      scheduledAt: dto.scheduledAt,
      handler: dto.handler,
      payload: dto.payload,
      maxRetries: dto.maxRetries ?? 3,
      timeoutMs: dto.timeoutMs ?? 30000,
      nextRunAt,
      status: JobStatus.SCHEDULED,
      retryCount: 0,
    };

    const saved = await this.jobRepo.save(job as ScheduledJobEntity);

    await this.eventBus.publish({
      event_type: SchedulerEvents.JOB_SCHEDULED,
      tenant_id: dto.tenantId,
      payload: { jobId: saved.id, name: saved.name, nextRunAt },
      timestamp: new Date(),
    });

    return saved;
  }

  async cancelJob(id: string, tenantId: string): Promise<void> {
    await this.jobRepo.updateStatus(id, tenantId, JobStatus.CANCELLED);
    await this.eventBus.publish({
      event_type: SchedulerEvents.JOB_CANCELLED,
      tenant_id: tenantId,
      payload: { jobId: id },
      timestamp: new Date(),
    });
  }

  async getJobs(tenantId: string): Promise<ScheduledJobEntity[]> {
    return this.jobRepo.findByTenant(tenantId);
  }

  async getJobLogs(jobId: string, tenantId: string): Promise<JobExecutionLog[]> {
    return this.logRepo.findByJobId(jobId, tenantId);
  }

  async processDueJobs(): Promise<number> {
    const now = new Date();
    const dueJobs = await this.jobRepo.findDueJobs(now);
    let processed = 0;

    for (const job of dueJobs) {
      try {
        await this.executeJob(job);
        processed++;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(`Failed to execute job ${job.id}: ${error.message}`);
      }
    }

    return processed;
  }

  private async executeJob(job: ScheduledJobEntity): Promise<void> {
    const startedAt = new Date();

    await this.jobRepo.updateStatus(job.id, job.tenantId, JobStatus.RUNNING);
    await this.eventBus.publish({
      event_type: SchedulerEvents.JOB_STARTED,
      tenant_id: job.tenantId,
      payload: { jobId: job.id, handler: job.handler },
      timestamp: startedAt,
    });

    try {
      await this.eventBus.publish({
        event_type: `scheduler.execute.${job.handler}`,
        tenant_id: job.tenantId,
        payload: { jobId: job.id, ...job.payload },
        timestamp: new Date(),
      });

      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      const logEntry: Partial<JobExecutionLog> = {
        tenantId: job.tenantId,
        jobId: job.id,
        startedAt,
        completedAt,
        status: JobStatus.COMPLETED,
        durationMs,
      };
      await this.logRepo.save(logEntry as JobExecutionLog);

      if (job.type === JobType.RECURRING && job.cronExpression) {
        const nextRun = this.getNextCronRun(job.cronExpression);
        await this.jobRepo.updateNextRun(job.id, job.tenantId, nextRun);
      } else {
        await this.jobRepo.updateStatus(job.id, job.tenantId, JobStatus.COMPLETED);
      }

      await this.eventBus.publish({
        event_type: SchedulerEvents.JOB_COMPLETED,
        tenant_id: job.tenantId,
        payload: { jobId: job.id, durationMs },
        timestamp: completedAt,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      const logEntry: Partial<JobExecutionLog> = {
        tenantId: job.tenantId,
        jobId: job.id,
        startedAt,
        completedAt,
        status: JobStatus.FAILED,
        error: error.message,
        durationMs,
      };
      await this.logRepo.save(logEntry as JobExecutionLog);

      if (job.retryCount < job.maxRetries) {
        await this.jobRepo.incrementRetry(job.id, job.tenantId);
        const retryDelay = Math.pow(2, job.retryCount + 1) * 1000;
        const nextRetry = new Date(Date.now() + retryDelay);
        await this.jobRepo.updateNextRun(job.id, job.tenantId, nextRetry);
        await this.jobRepo.updateStatus(job.id, job.tenantId, JobStatus.RETRYING, error.message);

        await this.eventBus.publish({
          event_type: SchedulerEvents.JOB_RETRYING,
          tenant_id: job.tenantId,
          payload: { jobId: job.id, retryCount: job.retryCount + 1, nextRetry },
          timestamp: new Date(),
        });
      } else {
        await this.jobRepo.updateStatus(job.id, job.tenantId, JobStatus.FAILED, error.message);
        await this.eventBus.publish({
          event_type: SchedulerEvents.JOB_FAILED,
          tenant_id: job.tenantId,
          payload: { jobId: job.id, error: error.message, retriesExhausted: true },
          timestamp: new Date(),
        });
      }
    }
  }

  private getNextCronRun(cronExpression: string): Date {
    const parts = cronExpression.split(' ');
    const now = new Date();
    
    if (parts.length >= 6) {
      const minute = parts[1] === '*' ? now.getMinutes() : parseInt(parts[1], 10);
      const hour = parts[2] === '*' ? now.getHours() : parseInt(parts[2], 10);
      
      const next = new Date(now);
      next.setSeconds(0, 0);
      next.setMinutes(minute);
      next.setHours(hour);
      
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }
    
    return new Date(now.getTime() + 60_000);
  }
}
