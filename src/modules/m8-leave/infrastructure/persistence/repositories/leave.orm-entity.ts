import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('leave_requests')
export class LeaveRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'employee_id' })
  @Index()
  employeeId!: string;

  @Column({ name: 'leave_type' })
  leaveType!: string;

  @Column('date', { name: 'start_date' })
  startDate!: Date;

  @Column('date', { name: 'end_date' })
  endDate!: Date;

  @Column()
  days!: number;

  @Column('text')
  reason!: string;

  @Column({ default: 'pending' })
  @Index()
  status!: string;

  @Column({ nullable: true, name: 'approved_by' })
  approvedBy?: string;

  @Column({ nullable: true, name: 'approved_at' })
  approvedAt?: Date;

  @Column({ nullable: true, name: 'rejection_reason' })
  rejectionReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('leave_balances')
export class LeaveBalanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'employee_id' })
  @Index()
  employeeId!: string;

  @Column({ name: 'leave_type' })
  leaveType!: string;

  @Column()
  year!: number;

  @Column('decimal', { precision: 5, scale: 1, name: 'total_days' })
  totalDays!: number;

  @Column('decimal', { precision: 5, scale: 1, default: 0, name: 'used_days' })
  usedDays!: number;

  @Column('decimal', { precision: 5, scale: 1, name: 'remaining_days' })
  remainingDays!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
