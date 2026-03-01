export interface ActionDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  requiredPermissions: string[];
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
