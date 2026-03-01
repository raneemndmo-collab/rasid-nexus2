import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('dashboards')
@Index('idx_dash_tenant', ['tenantId'])
export class DashboardEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) name!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'jsonb', default: '{}' }) layout!: Record<string, unknown>;
  @Column({ name: 'is_default', type: 'boolean', default: false }) isDefault!: boolean;
  @Column({ name: 'created_by', type: 'uuid' }) createdBy!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('widgets')
@Index('idx_widget_tenant', ['tenantId'])
export class WidgetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'dashboard_id', type: 'uuid' }) dashboardId!: string;
  @Column({ type: 'varchar', length: 100 }) type!: string;
  @Column({ type: 'varchar', length: 255 }) title!: string;
  @Column({ type: 'jsonb', default: '{}' }) config!: Record<string, unknown>;
  @Column({ name: 'data_source', type: 'varchar', length: 255 }) dataSource!: string;
  @Column({ type: 'jsonb', default: '{"x":0,"y":0,"w":4,"h":3}' }) position!: Record<string, unknown>;
  @Column({ name: 'refresh_interval_seconds', type: 'int', default: 300 }) refreshIntervalSeconds!: number;
  @Column({ name: 'ai_insights_enabled', type: 'boolean', default: false }) aiInsightsEnabled!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
