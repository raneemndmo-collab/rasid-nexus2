import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IFileRepository, IFolderRepository, IFileShareRepository } from '../../domain/interfaces/file-repository.interface';
import { ManagedFile, FileStatus, Folder, FileShare } from '../../domain/entities/file.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { FILE_EVENTS } from '../../domain/events/file.events';
import * as crypto from 'crypto';

export interface UploadFileDto {
  tenantId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageObjectId: string;
  folderId?: string;
  tags?: string[];
  uploadedBy: string;
  metadata?: Record<string, unknown>;
}

export interface CreateFolderDto {
  tenantId: string;
  name: string;
  parentId?: string;
  createdBy: string;
}

export interface ShareFileDto {
  tenantId: string;
  fileId: string;
  sharedWith: string;
  permission: 'view' | 'edit';
  expiresAt?: Date;
}

@Injectable()
export class FileService {
  constructor(
    @Inject('IFileRepository') private readonly fileRepo: IFileRepository,
    @Inject('IFolderRepository') private readonly folderRepo: IFolderRepository,
    @Inject('IFileShareRepository') private readonly shareRepo: IFileShareRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async uploadFile(dto: UploadFileDto): Promise<ManagedFile> {
    const file: ManagedFile = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      storageObjectId: dto.storageObjectId,
      name: dto.name,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      size: dto.size,
      folderId: dto.folderId,
      tags: dto.tags || [],
      status: FileStatus.ACTIVE,
      uploadedBy: dto.uploadedBy,
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.fileRepo.save(file);

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FILE_UPLOADED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { fileId: saved.id, name: dto.name, size: dto.size },
    });

    return saved;
  }

  async getFile(id: string, tenantId: string): Promise<ManagedFile> {
    const file = await this.fileRepo.findById(id, tenantId);
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async listFiles(tenantId: string): Promise<ManagedFile[]> {
    return this.fileRepo.findAll(tenantId);
  }

  async listByFolder(folderId: string, tenantId: string): Promise<ManagedFile[]> {
    return this.fileRepo.findByFolder(folderId, tenantId);
  }

  async searchByTag(tag: string, tenantId: string): Promise<ManagedFile[]> {
    return this.fileRepo.findByTag(tag, tenantId);
  }

  async moveFile(id: string, tenantId: string, folderId: string): Promise<ManagedFile> {
    const file = await this.fileRepo.findById(id, tenantId);
    if (!file) throw new NotFoundException('File not found');

    const updated = await this.fileRepo.update(id, tenantId, { folderId });

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FILE_MOVED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { fileId: id, fromFolder: file.folderId, toFolder: folderId },
    });

    return updated;
  }

  async deleteFile(id: string, tenantId: string): Promise<void> {
    const file = await this.fileRepo.findById(id, tenantId);
    if (!file) throw new NotFoundException('File not found');

    await this.fileRepo.update(id, tenantId, { status: FileStatus.DELETED });

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FILE_DELETED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { fileId: id, name: file.name },
    });
  }

  async createFolder(dto: CreateFolderDto): Promise<Folder> {
    let parentPath = '/';
    if (dto.parentId) {
      const parent = await this.folderRepo.findById(dto.parentId, dto.tenantId);
      if (parent) parentPath = parent.path;
    }

    const folder: Folder = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      name: dto.name,
      parentId: dto.parentId,
      path: `${parentPath}${dto.name}/`,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.folderRepo.save(folder);

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FOLDER_CREATED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { folderId: saved.id, name: dto.name },
    });

    return saved;
  }

  async listFolders(tenantId: string, parentId?: string): Promise<Folder[]> {
    return this.folderRepo.findByParent(parentId || null, tenantId);
  }

  async deleteFolder(id: string, tenantId: string): Promise<void> {
    await this.folderRepo.delete(id, tenantId);

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FOLDER_DELETED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { folderId: id },
    });
  }

  async shareFile(dto: ShareFileDto): Promise<FileShare> {
    const share: FileShare = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      fileId: dto.fileId,
      sharedWith: dto.sharedWith,
      permission: dto.permission,
      expiresAt: dto.expiresAt,
      createdAt: new Date(),
    };

    const saved = await this.shareRepo.save(share);

    await this.eventBus.publish({
      event_type: FILE_EVENTS.FILE_SHARED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { fileId: dto.fileId, sharedWith: dto.sharedWith },
    });

    return saved;
  }

  async getFileShares(fileId: string, tenantId: string): Promise<FileShare[]> {
    return this.shareRepo.findByFile(fileId, tenantId);
  }
}
