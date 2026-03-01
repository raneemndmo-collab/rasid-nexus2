export enum WidgetType { CHART = 'chart', TABLE = 'table', METRIC = 'metric', LIST = 'list', MAP = 'map', CALENDAR = 'calendar', PROGRESS = 'progress', CUSTOM = 'custom', AI_INSIGHT = 'ai_insight', TEXT = 'text' }

export interface WidgetPosition { x: number; y: number; w: number; h: number; }

export interface Widget {
  id: string;
  tenantId: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
  dataSource: string;
  position: WidgetPosition;
  refreshIntervalSeconds: number;
  aiInsightsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  layout: Record<string, unknown>;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
