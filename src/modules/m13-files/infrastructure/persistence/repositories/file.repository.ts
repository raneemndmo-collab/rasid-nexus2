import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ManagedFileOrmEntity, FolderOrmEntity, FileShareOrmEntity } from './file.orm-entity';
import { IFileRepository, IFolderRepository, IFileShareRepository } from '../../../domain/interfaces/file-repository.interface';
import { ManagedFile, Folder, FileShare } from '../../../domain/entities/file.entity';

@Injectable()
export class FileRepositoryImpl implements IFileRepository {
  constructor(
    @InjectRepository(ManagedFileOrmEntity)
    private readonly repo: Repository<ManagedFileOrmEntity>,
  ) {}

  async save(file: ManagedFile): Promise<ManagedFile> {
    const entity = this.repo.create(file as unknown as ManagedFileOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ManagedFile;
  }

  async findById(id: string, tenantId: string): Promise<ManagedFile | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ManagedFile) : null;
  }

  async findByFolder(folderId: string, tenantId: string): Promise<ManagedFile[]> {
    const entities = await this.repo.find({ where: { folderId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as ManagedFile));
  }

  async findAll(tenantId: string): Promise<ManagedFile[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as ManagedFile));
  }

  async findByTag(tag: string, tenantId: string): Promise<ManagedFile[]> {
    const entities = await this.repo.createQueryBuilder('f')
      .where('f.tenant_id = :tenantId', { tenantId })
      .andWhere(':tag = ANY(f.tags)', { tag })
      .getMany();
    return entities.map(e => ({ ...e } as unknown as ManagedFile));
  }

  async update(id: string, tenantId: string, updates: Partial<ManagedFile>): Promise<ManagedFile> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as ManagedFile;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class FolderRepositoryImpl implements IFolderRepository {
  constructor(
    @InjectRepository(FolderOrmEntity)
    private readonly repo: Repository<FolderOrmEntity>,
  ) {}

  async save(folder: Folder): Promise<Folder> {
    const entity = this.repo.create(folder as unknown as FolderOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as Folder;
  }

  async findById(id: string, tenantId: string): Promise<Folder | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as Folder) : null;
  }

  async findByParent(parentId: string | null, tenantId: string): Promise<Folder[]> {
    const where = parentId ? { parentId, tenantId } : { parentId: IsNull() as unknown as string, tenantId };
    const entities = await this.repo.find({ where });
    return entities.map(e => ({ ...e } as unknown as Folder));
  }

  async findAll(tenantId: string): Promise<Folder[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as Folder));
  }

  async update(id: string, tenantId: string, updates: Partial<Folder>): Promise<Folder> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as Folder;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class FileShareRepositoryImpl implements IFileShareRepository {
  constructor(
    @InjectRepository(FileShareOrmEntity)
    private readonly repo: Repository<FileShareOrmEntity>,
  ) {}

  async save(share: FileShare): Promise<FileShare> {
    const entity = this.repo.create(share as unknown as FileShareOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as FileShare;
  }

  async findByFile(fileId: string, tenantId: string): Promise<FileShare[]> {
    const entities = await this.repo.find({ where: { fileId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as FileShare));
  }

  async findByUser(userId: string, tenantId: string): Promise<FileShare[]> {
    const entities = await this.repo.find({ where: { sharedWith: userId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as FileShare));
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
