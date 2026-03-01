export enum ProjectStatus { ACTIVE = 'active', ON_HOLD = 'on_hold', COMPLETED = 'completed', CANCELLED = 'cancelled' }
export enum MemberRole { OWNER = 'owner', MANAGER = 'manager', MEMBER = 'member', VIEWER = 'viewer' }

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  tenantId: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}
