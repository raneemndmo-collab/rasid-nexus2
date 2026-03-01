import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDashboardRepository } from '../../../domain/interfaces/dashboard-repository.interface';
import { Dashboard, Widget } from '../../../domain/entities/dashboard.entity';
import { DashboardEntity, WidgetEntity } from './dashboard.orm-entity';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(DashboardEntity) private readonly dashRepo: Repository<DashboardEntity>,
    @InjectRepository(WidgetEntity) private readonly widgetRepo: Repository<WidgetEntity>,
  ) {}

  async createDashboard(d: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    return this.dashRepo.save(this.dashRepo.create(d as any)) as unknown as Dashboard;
  }
  async findDashboardById(tenantId: string, id: string): Promise<Dashboard | null> {
    return this.dashRepo.findOne({ where: { tenantId, id } }) as unknown as Dashboard | null;
  }
  async listDashboards(tenantId: string): Promise<Dashboard[]> {
    return this.dashRepo.find({ where: { tenantId } }) as unknown as Dashboard[];
  }
  async updateDashboard(tenantId: string, id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    await this.dashRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findDashboardById(tenantId, id) as unknown as Dashboard;
  }
  async deleteDashboard(tenantId: string, id: string): Promise<void> {
    await this.dashRepo.delete({ tenantId, id });
  }
  async createWidget(w: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget> {
    return this.widgetRepo.save(this.widgetRepo.create(w as any)) as unknown as Widget;
  }
  async findWidgetById(tenantId: string, id: string): Promise<Widget | null> {
    return this.widgetRepo.findOne({ where: { tenantId, id } }) as unknown as Widget | null;
  }
  async listWidgets(tenantId: string, dashboardId: string): Promise<Widget[]> {
    return this.widgetRepo.find({ where: { tenantId, dashboardId } }) as unknown as Widget[];
  }
  async updateWidget(tenantId: string, id: string, updates: Partial<Widget>): Promise<Widget> {
    await this.widgetRepo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findWidgetById(tenantId, id) as unknown as Widget;
  }
  async deleteWidget(tenantId: string, id: string): Promise<void> {
    await this.widgetRepo.delete({ tenantId, id });
  }
}
