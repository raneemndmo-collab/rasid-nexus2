export enum FileStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface ManagedFile {
  id: string;
  tenantId: string;
  storageObjectId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  folderId?: string;
  tags: string[];
  thumbnailId?: string;
  status: FileStatus;
  uploadedBy: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  tenantId: string;
  name: string;
  parentId?: string;
  path: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileShare {
  id: string;
  tenantId: string;
  fileId: string;
  sharedWith: string;
  permission: 'view' | 'edit';
  expiresAt?: Date;
  createdAt: Date;
}
