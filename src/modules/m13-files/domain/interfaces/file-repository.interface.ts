import { ManagedFile, Folder, FileShare } from '../entities/file.entity';

export interface IFileRepository {
  save(file: ManagedFile): Promise<ManagedFile>;
  findById(id: string, tenantId: string): Promise<ManagedFile | null>;
  findByFolder(folderId: string, tenantId: string): Promise<ManagedFile[]>;
  findAll(tenantId: string): Promise<ManagedFile[]>;
  findByTag(tag: string, tenantId: string): Promise<ManagedFile[]>;
  update(id: string, tenantId: string, updates: Partial<ManagedFile>): Promise<ManagedFile>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IFolderRepository {
  save(folder: Folder): Promise<Folder>;
  findById(id: string, tenantId: string): Promise<Folder | null>;
  findByParent(parentId: string | null, tenantId: string): Promise<Folder[]>;
  findAll(tenantId: string): Promise<Folder[]>;
  update(id: string, tenantId: string, updates: Partial<Folder>): Promise<Folder>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IFileShareRepository {
  save(share: FileShare): Promise<FileShare>;
  findByFile(fileId: string, tenantId: string): Promise<FileShare[]>;
  findByUser(userId: string, tenantId: string): Promise<FileShare[]>;
  delete(id: string, tenantId: string): Promise<void>;
}
