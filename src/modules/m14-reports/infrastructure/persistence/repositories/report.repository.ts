import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ReportDefinitionOrmEntity, ReportExecutionOrmEntity, ScheduledReportOrmEntity } from './report.orm-entity';
import { IReportDefinitionRepository, IReportExecutionRepository, IScheduledReportRepository } from '../../../domain/interfaces/report-repository.interface';
import { ReportDefinition, ReportExecution, ScheduledReport } from '../../../domain/entities/report.entity';

@Injectable()
export class ReportDefinitionRepositoryImpl implements IReportDefinitionRepository {
  constructor(@InjectRepository(ReportDefinitionOrmEntity) private readonly repo: Repository<ReportDefinitionOrmEntity>) {}

  async save(definition: ReportDefinition): Promise<ReportDefinition> {
    const entity = this.repo.create(definition as unknown as ReportDefinitionOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ReportDefinition;
  }

  async findById(id: string, tenantId: string): Promise<ReportDefinition | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ReportDefinition) : null;
  }

  async findByModule(module: string, tenantId: string): Promise<ReportDefinition[]> {
    const entities = await this.repo.find({ where: { module, tenantId } });
    return entities.map(e => ({ ...e } as unknown as ReportDefinition));
  }

  async findAll(tenantId: string): Promise<ReportDefinition[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as ReportDefinition));
  }

  async update(id: string, tenantId: string, updates: Partial<ReportDefinition>): Promise<ReportDefinition> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as ReportDefinition;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class ReportExecutionRepositoryImpl implements IReportExecutionRepository {
  constructor(@InjectRepository(ReportExecutionOrmEntity) private readonly repo: Repository<ReportExecutionOrmEntity>) {}

  async save(execution: ReportExecution): Promise<ReportExecution> {
    const entity = this.repo.create(execution as unknown as ReportExecutionOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ReportExecution;
  }

  async findById(id: string, tenantId: string): Promise<ReportExecution | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ReportExecution) : null;
  }

  async findByDefinition(definitionId: string, tenantId: string): Promise<ReportExecution[]> {
    const entities = await this.repo.find({ where: { definitionId, tenantId }, order: { createdAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as ReportExecution));
  }

  async findAll(tenantId: string): Promise<ReportExecution[]> {
    const entities = await this.repo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as ReportExecution));
  }

  async update(id: string, tenantId: string, updates: Partial<ReportExecution>): Promise<ReportExecution> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as ReportExecution;
  }
}

@Injectable()
export class ScheduledReportRepositoryImpl implements IScheduledReportRepository {
  constructor(@InjectRepository(ScheduledReportOrmEntity) private readonly repo: Repository<ScheduledReportOrmEntity>) {}

  async save(schedule: ScheduledReport): Promise<ScheduledReport> {
    const entity = this.repo.create(schedule as unknown as ScheduledReportOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ScheduledReport;
  }

  async findById(id: string, tenantId: string): Promise<ScheduledReport | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ScheduledReport) : null;
  }

  async findAll(tenantId: string): Promise<ScheduledReport[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as ScheduledReport));
  }

  async findDue(): Promise<ScheduledReport[]> {
    const entities = await this.repo.find({
      where: { enabled: true, nextRunAt: LessThanOrEqual(new Date()) },
    });
    return entities.map(e => ({ ...e } as unknown as ScheduledReport));
  }

  async update(id: string, tenantId: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as ScheduledReport;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
