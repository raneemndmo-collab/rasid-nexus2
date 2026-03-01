export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
