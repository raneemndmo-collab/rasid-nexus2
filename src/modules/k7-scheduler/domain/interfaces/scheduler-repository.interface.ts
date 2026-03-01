import { ScheduledJobEntity, JobExecutionLog, JobStatus } from '../entities/scheduled-job.entity';

export interface ISchedulerRepository {
  save(job: ScheduledJobEntity): Promise<ScheduledJobEntity>;
  findById(id: string, tenantId: string): Promise<ScheduledJobEntity | null>;
  findDueJobs(now: Date): Promise<ScheduledJobEntity[]>;
  findByTenant(tenantId: string): Promise<ScheduledJobEntity[]>;
  updateStatus(id: string, tenantId: string, status: JobStatus, error?: string): Promise<void>;
  updateNextRun(id: string, tenantId: string, nextRunAt: Date): Promise<void>;
  incrementRetry(id: string, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IJobExecutionLogRepository {
  save(log: JobExecutionLog): Promise<JobExecutionLog>;
  findByJobId(jobId: string, tenantId: string): Promise<JobExecutionLog[]>;
}
