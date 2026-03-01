import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRunOrmEntity, PayrollItemOrmEntity, EmployeePayslipOrmEntity, SalaryStructureOrmEntity } from './payroll.orm-entity';
import { IPayrollRunRepository, IPayrollItemRepository, IPayslipRepository, ISalaryStructureRepository } from '../../../domain/interfaces/payroll-repository.interface';
import { PayrollRun, PayrollItem, EmployeePayslip, SalaryStructure } from '../../../domain/entities/payroll.entity';

@Injectable()
export class PayrollRunRepositoryImpl implements IPayrollRunRepository {
  constructor(@InjectRepository(PayrollRunOrmEntity) private readonly repo: Repository<PayrollRunOrmEntity>) {}

  async save(run: PayrollRun): Promise<PayrollRun> {
    const entity = this.repo.create(run as unknown as PayrollRunOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as PayrollRun;
  }

  async findById(id: string, tenantId: string): Promise<PayrollRun | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as PayrollRun) : null;
  }

  async findByPeriod(period: string, tenantId: string): Promise<PayrollRun | null> {
    const entity = await this.repo.findOne({ where: { period, tenantId } });
    return entity ? ({ ...entity } as unknown as PayrollRun) : null;
  }

  async findAll(tenantId: string): Promise<PayrollRun[]> {
    const entities = await this.repo.find({ where: { tenantId }, order: { period: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as PayrollRun));
  }

  async update(id: string, tenantId: string, updates: Partial<PayrollRun>): Promise<PayrollRun> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as PayrollRun;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class PayrollItemRepositoryImpl implements IPayrollItemRepository {
  constructor(@InjectRepository(PayrollItemOrmEntity) private readonly repo: Repository<PayrollItemOrmEntity>) {}

  async save(item: PayrollItem): Promise<PayrollItem> {
    const entity = this.repo.create(item as unknown as PayrollItemOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as PayrollItem;
  }

  async saveBatch(items: PayrollItem[]): Promise<PayrollItem[]> {
    const entities = items.map(i => this.repo.create(i as unknown as PayrollItemOrmEntity));
    const saved = await this.repo.save(entities);
    return saved.map(s => ({ ...s } as unknown as PayrollItem));
  }

  async findByRun(payrollRunId: string, tenantId: string): Promise<PayrollItem[]> {
    const entities = await this.repo.find({ where: { payrollRunId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as PayrollItem));
  }

  async findByEmployee(employeeId: string, payrollRunId: string, tenantId: string): Promise<PayrollItem[]> {
    const entities = await this.repo.find({ where: { employeeId, payrollRunId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as PayrollItem));
  }

  async deleteByRun(payrollRunId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ payrollRunId, tenantId });
  }
}

@Injectable()
export class PayslipRepositoryImpl implements IPayslipRepository {
  constructor(@InjectRepository(EmployeePayslipOrmEntity) private readonly repo: Repository<EmployeePayslipOrmEntity>) {}

  async save(payslip: EmployeePayslip): Promise<EmployeePayslip> {
    const entity = this.repo.create({ ...payslip, items: payslip.items as unknown[] } as unknown as EmployeePayslipOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as EmployeePayslip;
  }

  async findById(id: string, tenantId: string): Promise<EmployeePayslip | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as EmployeePayslip) : null;
  }

  async findByEmployee(employeeId: string, tenantId: string): Promise<EmployeePayslip[]> {
    const entities = await this.repo.find({ where: { employeeId, tenantId }, order: { period: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as EmployeePayslip));
  }

  async findByRun(payrollRunId: string, tenantId: string): Promise<EmployeePayslip[]> {
    const entities = await this.repo.find({ where: { payrollRunId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as EmployeePayslip));
  }
}

@Injectable()
export class SalaryStructureRepositoryImpl implements ISalaryStructureRepository {
  constructor(@InjectRepository(SalaryStructureOrmEntity) private readonly repo: Repository<SalaryStructureOrmEntity>) {}

  async save(structure: SalaryStructure): Promise<SalaryStructure> {
    const entity = this.repo.create({ ...structure, components: structure.components as unknown[] } as unknown as SalaryStructureOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as SalaryStructure;
  }

  async findById(id: string, tenantId: string): Promise<SalaryStructure | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as SalaryStructure) : null;
  }

  async findDefault(tenantId: string): Promise<SalaryStructure | null> {
    const entity = await this.repo.findOne({ where: { tenantId, isDefault: true } });
    return entity ? ({ ...entity } as unknown as SalaryStructure) : null;
  }

  async findAll(tenantId: string): Promise<SalaryStructure[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as SalaryStructure));
  }

  async update(id: string, tenantId: string, updates: Partial<SalaryStructure>): Promise<SalaryStructure> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as SalaryStructure;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
