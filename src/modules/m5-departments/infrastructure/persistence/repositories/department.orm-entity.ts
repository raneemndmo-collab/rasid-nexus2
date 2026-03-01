import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('departments')
export class DepartmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column()
  @Index()
  code!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true, name: 'parent_id' })
  @Index()
  parentId?: string;

  @Column({ nullable: true, name: 'manager_id' })
  managerId?: string;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ default: 0 })
  level!: number;

  @Column({ default: '/' })
  path!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
