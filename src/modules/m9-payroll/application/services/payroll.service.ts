import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPayrollRunRepository, IPayrollItemRepository, IPayslipRepository, ISalaryStructureRepository } from '../../domain/interfaces/payroll-repository.interface';
import { PayrollRun, PayrollStatus, PayrollItem, PayrollItemType, EmployeePayslip, SalaryStructure } from '../../domain/entities/payroll.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { PAYROLL_EVENTS } from '../../domain/events/payroll.events';
import * as crypto from 'crypto';

export interface CalculatePayrollDto {
  tenantId: string;
  period: string;
  employees: Array<{
    employeeId: string;
    basicSalary: number;
    allowances?: Array<{ description: string; amount: number }>;
    deductions?: Array<{ description: string; amount: number }>;
  }>;
}

@Injectable()
export class PayrollService {
  constructor(
    @Inject('IPayrollRunRepository') private readonly runRepo: IPayrollRunRepository,
    @Inject('IPayrollItemRepository') private readonly itemRepo: IPayrollItemRepository,
    @Inject('IPayslipRepository') private readonly payslipRepo: IPayslipRepository,
    @Inject('ISalaryStructureRepository') private readonly structureRepo: ISalaryStructureRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async calculatePayroll(dto: CalculatePayrollDto): Promise<PayrollRun> {
    const existing = await this.runRepo.findByPeriod(dto.period, dto.tenantId);
    if (existing && existing.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException(`Payroll for ${dto.period} already ${existing.status}`);
    }

    let totalGross = 0;
    let totalDeductions = 0;
    const allItems: PayrollItem[] = [];
    const runId = existing?.id || crypto.randomUUID();

    for (const emp of dto.employees) {
      // Basic salary item
      allItems.push({
        id: crypto.randomUUID(),
        tenantId: dto.tenantId,
        payrollRunId: runId,
        employeeId: emp.employeeId,
        type: PayrollItemType.BASIC_SALARY,
        description: 'Basic Salary',
        amount: emp.basicSalary,
        currency: 'SAR',
        createdAt: new Date(),
      });
      totalGross += emp.basicSalary;

      // Allowances
      if (emp.allowances) {
        for (const allowance of emp.allowances) {
          allItems.push({
            id: crypto.randomUUID(),
            tenantId: dto.tenantId,
            payrollRunId: runId,
            employeeId: emp.employeeId,
            type: PayrollItemType.ALLOWANCE,
            description: allowance.description,
            amount: allowance.amount,
            currency: 'SAR',
            createdAt: new Date(),
          });
          totalGross += allowance.amount;
        }
      }

      // Deductions
      if (emp.deductions) {
        for (const deduction of emp.deductions) {
          allItems.push({
            id: crypto.randomUUID(),
            tenantId: dto.tenantId,
            payrollRunId: runId,
            employeeId: emp.employeeId,
            type: PayrollItemType.DEDUCTION,
            description: deduction.description,
            amount: deduction.amount,
            currency: 'SAR',
            createdAt: new Date(),
          });
          totalDeductions += deduction.amount;
        }
      }
    }

    const totalNet = totalGross - totalDeductions;

    // Clear old items if re-calculating
    if (existing) {
      await this.itemRepo.deleteByRun(runId, dto.tenantId);
    }

    // Save items
    await this.itemRepo.saveBatch(allItems);

    // Save/update run
    const run: PayrollRun = {
      id: runId,
      tenantId: dto.tenantId,
      period: dto.period,
      status: PayrollStatus.CALCULATED,
      totalGross,
      totalDeductions,
      totalNet,
      employeeCount: dto.employees.length,
      calculatedAt: new Date(),
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const saved = existing
      ? await this.runRepo.update(runId, dto.tenantId, run)
      : await this.runRepo.save(run);

    await this.eventBus.publish({
      event_type: PAYROLL_EVENTS.PAYROLL_CALCULATED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { payrollRunId: runId, period: dto.period, totalNet, employeeCount: dto.employees.length },
    });

    return saved;
  }

  async approvePayroll(id: string, tenantId: string, approvedBy: string): Promise<PayrollRun> {
    const run = await this.runRepo.findById(id, tenantId);
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== PayrollStatus.CALCULATED) throw new BadRequestException('Payroll must be calculated before approval');

    const updated = await this.runRepo.update(id, tenantId, {
      status: PayrollStatus.APPROVED,
      approvedBy,
      approvedAt: new Date(),
    });

    await this.eventBus.publish({
      event_type: PAYROLL_EVENTS.PAYROLL_APPROVED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { payrollRunId: id, approvedBy },
    });

    return updated;
  }

  async executePayroll(id: string, tenantId: string): Promise<PayrollRun> {
    const run = await this.runRepo.findById(id, tenantId);
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== PayrollStatus.APPROVED) throw new BadRequestException('Payroll must be approved before execution');

    const updated = await this.runRepo.update(id, tenantId, {
      status: PayrollStatus.PAID,
      paidAt: new Date(),
    });

    // Generate payslips for all employees
    const items = await this.itemRepo.findByRun(id, tenantId);
    const employeeIds = [...new Set(items.map(i => i.employeeId))];

    for (const employeeId of employeeIds) {
      const empItems = items.filter(i => i.employeeId === employeeId);
      const gross = empItems.filter(i => i.type !== PayrollItemType.DEDUCTION).reduce((s, i) => s + Number(i.amount), 0);
      const deductions = empItems.filter(i => i.type === PayrollItemType.DEDUCTION).reduce((s, i) => s + Number(i.amount), 0);
      const allowances = empItems.filter(i => i.type === PayrollItemType.ALLOWANCE).reduce((s, i) => s + Number(i.amount), 0);

      const payslip: EmployeePayslip = {
        id: crypto.randomUUID(),
        tenantId,
        payrollRunId: id,
        employeeId,
        period: run.period,
        grossSalary: gross,
        totalAllowances: allowances,
        totalDeductions: deductions,
        netSalary: gross - deductions,
        items: empItems,
        generatedAt: new Date(),
      };
      await this.payslipRepo.save(payslip);
    }

    await this.eventBus.publish({
      event_type: PAYROLL_EVENTS.PAYROLL_PAID,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { payrollRunId: id, employeeCount: employeeIds.length },
    });

    return updated;
  }

  async getPayrollRun(id: string, tenantId: string): Promise<PayrollRun> {
    const run = await this.runRepo.findById(id, tenantId);
    if (!run) throw new NotFoundException('Payroll run not found');
    return run;
  }

  async listPayrollRuns(tenantId: string): Promise<PayrollRun[]> {
    return this.runRepo.findAll(tenantId);
  }

  async getPayslip(id: string, tenantId: string): Promise<EmployeePayslip> {
    const payslip = await this.payslipRepo.findById(id, tenantId);
    if (!payslip) throw new NotFoundException('Payslip not found');
    return payslip;
  }

  async getEmployeePayslips(employeeId: string, tenantId: string): Promise<EmployeePayslip[]> {
    return this.payslipRepo.findByEmployee(employeeId, tenantId);
  }

  async getSalaryStructures(tenantId: string): Promise<SalaryStructure[]> {
    return this.structureRepo.findAll(tenantId);
  }

  async createSalaryStructure(tenantId: string, structure: Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryStructure> {
    return this.structureRepo.save({
      ...structure,
      id: crypto.randomUUID(),
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
