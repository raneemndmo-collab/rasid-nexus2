import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('attendance_records')
export class AttendanceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'employee_id' })
  @Index()
  employeeId!: string;

  @Column('date')
  @Index()
  date!: Date;

  @Column({ nullable: true, name: 'check_in' })
  checkIn?: Date;

  @Column({ nullable: true, name: 'check_out' })
  checkOut?: Date;

  @Column({ default: 'present' })
  status!: string;

  @Column('decimal', { nullable: true, precision: 5, scale: 2, name: 'work_hours' })
  workHours?: number;

  @Column('decimal', { nullable: true, precision: 5, scale: 2, name: 'overtime_hours' })
  overtimeHours?: number;

  @Column({ nullable: true })
  notes?: string;

  @Column('jsonb', { nullable: true })
  location?: { lat: number; lng: number };

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
