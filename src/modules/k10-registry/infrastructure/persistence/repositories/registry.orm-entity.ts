import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('service_registrations')
export class ServiceRegistrationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'service_name' })
  @Index()
  serviceName!: string;

  @Column()
  version!: string;

  @Column()
  host!: string;

  @Column()
  port!: number;

  @Column({ default: 'http' })
  protocol!: string;

  @Column({ name: 'health_endpoint', default: '/health' })
  healthEndpoint!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ name: 'last_heartbeat' })
  lastHeartbeat!: Date;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('service_endpoints')
export class ServiceEndpointOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'service_id' })
  @Index()
  serviceId!: string;

  @Column()
  path!: string;

  @Column()
  method!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  deprecated!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('service_dependencies')
export class ServiceDependencyOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'source_service_id' })
  sourceServiceId!: string;

  @Column({ name: 'target_service_id' })
  targetServiceId!: string;

  @Column({ name: 'dependency_type', default: 'required' })
  dependencyType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
