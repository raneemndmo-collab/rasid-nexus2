export interface Permission {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}
