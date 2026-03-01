import { Dashboard, Widget } from '../entities/dashboard.entity';

export interface IDashboardRepository {
  createDashboard(d: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard>;
  findDashboardById(tenantId: string, id: string): Promise<Dashboard | null>;
  listDashboards(tenantId: string): Promise<Dashboard[]>;
  updateDashboard(tenantId: string, id: string, updates: Partial<Dashboard>): Promise<Dashboard>;
  deleteDashboard(tenantId: string, id: string): Promise<void>;

  createWidget(w: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Widget>;
  findWidgetById(tenantId: string, id: string): Promise<Widget | null>;
  listWidgets(tenantId: string, dashboardId: string): Promise<Widget[]>;
  updateWidget(tenantId: string, id: string, updates: Partial<Widget>): Promise<Widget>;
  deleteWidget(tenantId: string, id: string): Promise<void>;
}

export const DASHBOARD_REPOSITORY = Symbol('IDashboardRepository');
