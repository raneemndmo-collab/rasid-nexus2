export const SchedulerEvents = {
  JOB_SCHEDULED: 'scheduler.job.scheduled',
  JOB_STARTED: 'scheduler.job.started',
  JOB_COMPLETED: 'scheduler.job.completed',
  JOB_FAILED: 'scheduler.job.failed',
  JOB_RETRYING: 'scheduler.job.retrying',
  JOB_CANCELLED: 'scheduler.job.cancelled',
} as const;
