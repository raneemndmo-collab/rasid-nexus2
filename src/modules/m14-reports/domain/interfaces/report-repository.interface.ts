import { ReportDefinition, ReportExecution, ScheduledReport } from '../entities/report.entity';

export interface IReportDefinitionRepository {
  save(definition: ReportDefinition): Promise<ReportDefinition>;
  findById(id: string, tenantId: string): Promise<ReportDefinition | null>;
  findByModule(module: string, tenantId: string): Promise<ReportDefinition[]>;
  findAll(tenantId: string): Promise<ReportDefinition[]>;
  update(id: string, tenantId: string, updates: Partial<ReportDefinition>): Promise<ReportDefinition>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IReportExecutionRepository {
  save(execution: ReportExecution): Promise<ReportExecution>;
  findById(id: string, tenantId: string): Promise<ReportExecution | null>;
  findByDefinition(definitionId: string, tenantId: string): Promise<ReportExecution[]>;
  findAll(tenantId: string): Promise<ReportExecution[]>;
  update(id: string, tenantId: string, updates: Partial<ReportExecution>): Promise<ReportExecution>;
}

export interface IScheduledReportRepository {
  save(schedule: ScheduledReport): Promise<ScheduledReport>;
  findById(id: string, tenantId: string): Promise<ScheduledReport | null>;
  findAll(tenantId: string): Promise<ScheduledReport[]>;
  findDue(): Promise<ScheduledReport[]>;
  update(id: string, tenantId: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport>;
  delete(id: string, tenantId: string): Promise<void>;
}
