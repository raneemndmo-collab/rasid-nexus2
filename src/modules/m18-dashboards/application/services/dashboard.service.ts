import { Injectable, Inject } from '@nestjs/common';
import { IDashboardRepository, DASHBOARD_REPOSITORY } from '../../domain/interfaces/dashboard-repository.interface';
import { Dashboard, Widget } from '../../domain/entities/dashboard.entity';
import { DashboardEvents } from '../../domain/events/dashboard.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

/**
 * M18 Dashboard Service — uses M11 for AI insights.
 * Does NOT query other module databases directly (via APIs only).
 */

export interface IAIInsightPort {
  generateInsight(tenantId: string, dataContext: string): Promise<string>;
}
export const AI_INSIGHT_PORT = Symbol('IAIInsightPort');

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY) private readonly repo: IDashboardRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AI_INSIGHT_PORT) private readonly aiInsight: IAIInsightPort,
  ) {}

  async createDashboard(data: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const dash = await this.repo.createDashboard(data);
    await this.eventBus.publish({ event_type: DashboardEvents.DASHBOARD_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: dash });
    return dash;
  }
  async getDashboard(tenantId: string, id: string) { return this.repo.findDashboardById(tenantId, id); }
  async listDashboards(tenantId: string) { return this.repo.listDashboards(tenantId); }
  async updateDashboard(tenantId: string, id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const dash = await this.repo.updateDashboard(tenantId, id, updates);
    await this.eventBus.publish({ event_type: DashboardEvents.DASHBOARD_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: dash });
    return dash;
  }

  async addWidget(data: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget> {
    const widget = await this.repo.createWidget(data);
    await this.eventBus.publish({ event_type: DashboardEvents.WIDGET_ADDED, tenant_id: data.tenantId, timestamp: new Date(), payload: widget });
    return widget;
  }
  async listWidgets(tenantId: string, dashboardId: string) { return this.repo.listWidgets(tenantId, dashboardId); }
  async updateWidget(tenantId: string, id: string, updates: Partial<Widget>): Promise<Widget> {
    const widget = await this.repo.updateWidget(tenantId, id, updates);
    await this.eventBus.publish({ event_type: DashboardEvents.WIDGET_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: widget });
    return widget;
  }
  async removeWidget(tenantId: string, id: string): Promise<void> {
    await this.repo.deleteWidget(tenantId, id);
    await this.eventBus.publish({ event_type: DashboardEvents.WIDGET_REMOVED, tenant_id: tenantId, timestamp: new Date(), payload: { widgetId: id } });
  }

  async generateAIInsight(tenantId: string, dashboardId: string): Promise<string> {
    const widgets = await this.repo.listWidgets(tenantId, dashboardId);
    const dataContext = widgets.map(w => `Widget: ${w.title} (${w.type}) — Source: ${w.dataSource}`).join('\n');
    const insight = await this.aiInsight.generateInsight(tenantId, dataContext);
    await this.eventBus.publish({ event_type: DashboardEvents.AI_INSIGHT_GENERATED, tenant_id: tenantId, timestamp: new Date(), payload: { dashboardId, insight } });
    return insight;
  }
}
