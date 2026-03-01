import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('payroll_runs')
export class PayrollRunOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  @Index()
  period!: string;

  @Column({ default: 'draft' })
  status!: string;

  @Column('decimal', { name: 'total_gross', precision: 12, scale: 2, default: 0 })
  totalGross!: number;

  @Column('decimal', { name: 'total_deductions', precision: 12, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column('decimal', { name: 'total_net', precision: 12, scale: 2, default: 0 })
  totalNet!: number;

  @Column({ name: 'employee_count', default: 0 })
  employeeCount!: number;

  @Column({ nullable: true, name: 'calculated_at' })
  calculatedAt?: Date;

  @Column({ nullable: true, name: 'approved_by' })
  approvedBy?: string;

  @Column({ nullable: true, name: 'approved_at' })
  approvedAt?: Date;

  @Column({ nullable: true, name: 'paid_at' })
  paidAt?: Date;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('payroll_items')
export class PayrollItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'payroll_run_id' })
  @Index()
  payrollRunId!: string;

  @Column({ name: 'employee_id' })
  @Index()
  employeeId!: string;

  @Column()
  type!: string;

  @Column()
  description!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'SAR' })
  currency!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('employee_payslips')
export class EmployeePayslipOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'payroll_run_id' })
  @Index()
  payrollRunId!: string;

  @Column({ name: 'employee_id' })
  @Index()
  employeeId!: string;

  @Column()
  period!: string;

  @Column('decimal', { name: 'gross_salary', precision: 12, scale: 2 })
  grossSalary!: number;

  @Column('decimal', { name: 'total_allowances', precision: 12, scale: 2, default: 0 })
  totalAllowances!: number;

  @Column('decimal', { name: 'total_deductions', precision: 12, scale: 2, default: 0 })
  totalDeductions!: number;

  @Column('decimal', { name: 'net_salary', precision: 12, scale: 2 })
  netSalary!: number;

  @Column('jsonb', { default: '[]' })
  items!: unknown[];

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt!: Date;
}

@Entity('salary_structures')
export class SalaryStructureOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column('jsonb', { default: '[]' })
  components!: unknown[];

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
