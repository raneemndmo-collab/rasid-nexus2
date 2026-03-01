export enum PayrollStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PayrollItemType {
  BASIC_SALARY = 'basic_salary',
  ALLOWANCE = 'allowance',
  DEDUCTION = 'deduction',
  BONUS = 'bonus',
  OVERTIME = 'overtime',
  TAX = 'tax',
  INSURANCE = 'insurance',
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  period: string;  // YYYY-MM format
  status: PayrollStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  calculatedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollItem {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  type: PayrollItemType;
  description: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface EmployeePayslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  employeeId: string;
  period: string;
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  items: PayrollItem[];
  generatedAt: Date;
}

export interface SalaryStructure {
  id: string;
  tenantId: string;
  name: string;
  components: SalaryComponent[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryComponent {
  name: string;
  type: PayrollItemType;
  calculationType: 'fixed' | 'percentage';
  value: number;
  baseComponent?: string;
}
