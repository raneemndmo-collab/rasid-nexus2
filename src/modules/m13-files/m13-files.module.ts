import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagedFileOrmEntity, FolderOrmEntity, FileShareOrmEntity } from './infrastructure/persistence/repositories/file.orm-entity';
import { FileRepositoryImpl, FolderRepositoryImpl, FileShareRepositoryImpl } from './infrastructure/persistence/repositories/file.repository';
import { FileService } from './application/services/file.service';
import { FileController } from './presentation/controllers/file.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagedFileOrmEntity, FolderOrmEntity, FileShareOrmEntity]),
  ],
  controllers: [FileController],
  providers: [
    FileService,
    { provide: 'IFileRepository', useClass: FileRepositoryImpl },
    { provide: 'IFolderRepository', useClass: FolderRepositoryImpl },
    { provide: 'IFileShareRepository', useClass: FileShareRepositoryImpl },
  ],
  exports: [FileService],
})
export class M13FilesModule {}
