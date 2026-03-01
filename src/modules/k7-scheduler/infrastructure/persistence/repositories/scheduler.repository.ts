import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { ScheduledJobOrmEntity, JobExecutionLogOrmEntity } from './scheduler.orm-entity';
import { ISchedulerRepository, IJobExecutionLogRepository } from '../../../domain/interfaces/scheduler-repository.interface';
import { ScheduledJobEntity, JobExecutionLog, JobStatus } from '../../../domain/entities/scheduled-job.entity';

@Injectable()
export class SchedulerRepositoryImpl implements ISchedulerRepository {
  constructor(
    @InjectRepository(ScheduledJobOrmEntity)
    private readonly repo: Repository<ScheduledJobOrmEntity>,
  ) {}

  async save(job: ScheduledJobEntity): Promise<ScheduledJobEntity> {
    const entity = this.repo.create({
      tenantId: job.tenantId,
      name: job.name,
      type: job.type,
      cronExpression: job.cronExpression,
      scheduledAt: job.scheduledAt,
      handler: job.handler,
      payload: job.payload,
      status: job.status,
      maxRetries: job.maxRetries,
      retryCount: job.retryCount,
      nextRunAt: job.nextRunAt,
      timeoutMs: job.timeoutMs,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ScheduledJobEntity;
  }

  async findById(id: string, tenantId: string): Promise<ScheduledJobEntity | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ScheduledJobEntity) : null;
  }

  async findDueJobs(now: Date): Promise<ScheduledJobEntity[]> {
    const entities = await this.repo.find({
      where: {
        nextRunAt: LessThanOrEqual(now),
        status: In([JobStatus.SCHEDULED, JobStatus.RETRYING]),
      },
    });
    return entities.map(e => ({ ...e } as unknown as ScheduledJobEntity));
  }

  async findByTenant(tenantId: string): Promise<ScheduledJobEntity[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as ScheduledJobEntity));
  }

  async updateStatus(id: string, tenantId: string, status: JobStatus, error?: string): Promise<void> {
    const updateData: Record<string, unknown> = { status };
    if (error) updateData.lastError = error;
    if (status === JobStatus.RUNNING) updateData.lastRunAt = new Date();
    await this.repo.update({ id, tenantId }, updateData);
  }

  async updateNextRun(id: string, tenantId: string, nextRunAt: Date): Promise<void> {
    await this.repo.update({ id, tenantId }, { nextRunAt, status: JobStatus.SCHEDULED });
  }

  async incrementRetry(id: string, tenantId: string): Promise<void> {
    await this.repo.increment({ id, tenantId }, 'retryCount', 1);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class JobExecutionLogRepositoryImpl implements IJobExecutionLogRepository {
  constructor(
    @InjectRepository(JobExecutionLogOrmEntity)
    private readonly repo: Repository<JobExecutionLogOrmEntity>,
  ) {}

  async save(log: JobExecutionLog): Promise<JobExecutionLog> {
    const entity = this.repo.create({
      tenantId: log.tenantId,
      jobId: log.jobId,
      startedAt: log.startedAt,
      completedAt: log.completedAt,
      status: log.status,
      error: log.error,
      durationMs: log.durationMs,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as JobExecutionLog;
  }

  async findByJobId(jobId: string, tenantId: string): Promise<JobExecutionLog[]> {
    const entities = await this.repo.find({ where: { jobId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as JobExecutionLog));
  }
}
