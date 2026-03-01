import { PayrollRun, PayrollItem, EmployeePayslip, SalaryStructure } from '../entities/payroll.entity';

export interface IPayrollRunRepository {
  save(run: PayrollRun): Promise<PayrollRun>;
  findById(id: string, tenantId: string): Promise<PayrollRun | null>;
  findByPeriod(period: string, tenantId: string): Promise<PayrollRun | null>;
  findAll(tenantId: string): Promise<PayrollRun[]>;
  update(id: string, tenantId: string, updates: Partial<PayrollRun>): Promise<PayrollRun>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IPayrollItemRepository {
  save(item: PayrollItem): Promise<PayrollItem>;
  saveBatch(items: PayrollItem[]): Promise<PayrollItem[]>;
  findByRun(payrollRunId: string, tenantId: string): Promise<PayrollItem[]>;
  findByEmployee(employeeId: string, payrollRunId: string, tenantId: string): Promise<PayrollItem[]>;
  deleteByRun(payrollRunId: string, tenantId: string): Promise<void>;
}

export interface IPayslipRepository {
  save(payslip: EmployeePayslip): Promise<EmployeePayslip>;
  findById(id: string, tenantId: string): Promise<EmployeePayslip | null>;
  findByEmployee(employeeId: string, tenantId: string): Promise<EmployeePayslip[]>;
  findByRun(payrollRunId: string, tenantId: string): Promise<EmployeePayslip[]>;
}

export interface ISalaryStructureRepository {
  save(structure: SalaryStructure): Promise<SalaryStructure>;
  findById(id: string, tenantId: string): Promise<SalaryStructure | null>;
  findDefault(tenantId: string): Promise<SalaryStructure | null>;
  findAll(tenantId: string): Promise<SalaryStructure[]>;
  update(id: string, tenantId: string, updates: Partial<SalaryStructure>): Promise<SalaryStructure>;
  delete(id: string, tenantId: string): Promise<void>;
}
