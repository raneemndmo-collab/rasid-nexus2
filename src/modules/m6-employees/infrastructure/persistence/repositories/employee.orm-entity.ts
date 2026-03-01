import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('employees')
export class EmployeeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ unique: true, name: 'employee_number' })
  employeeNumber!: string;

  @Column({ name: 'department_id' })
  @Index()
  departmentId!: string;

  @Column()
  position!: string;

  @Column({ name: 'hire_date' })
  hireDate!: Date;

  @Column({ default: 'active' })
  status!: string;

  @Column({ nullable: true, name: 'manager_id' })
  managerId?: string;

  @Column('decimal', { nullable: true, precision: 12, scale: 2 })
  salary?: number;

  @Column({ nullable: true, name: 'work_schedule' })
  workSchedule?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
