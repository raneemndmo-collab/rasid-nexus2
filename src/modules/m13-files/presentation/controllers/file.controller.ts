import { Controller, Post, Get, Put, Delete, Param, Body, Query, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileService, UploadFileDto, CreateFolderDto, ShareFileDto } from '../../application/services/file.service';

@ApiTags('M13 File Manager')
@Controller('api/m13/files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @ApiOperation({ summary: 'Upload/register a file' })
  async upload(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<UploadFileDto, 'tenantId'>) {
    return this.fileService.uploadFile({ ...body, tenantId });
  }

  @Get()
  @ApiOperation({ summary: 'List all files' })
  async list(@Headers('x-tenant-id') tenantId: string) {
    return this.fileService.listFiles(tenantId);
  }

  @Get('folder/:folderId')
  @ApiOperation({ summary: 'List files in folder' })
  async listByFolder(@Param('folderId') folderId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.fileService.listByFolder(folderId, tenantId);
  }

  @Get('tag/:tag')
  @ApiOperation({ summary: 'Search files by tag' })
  async searchByTag(@Param('tag') tag: string, @Headers('x-tenant-id') tenantId: string) {
    return this.fileService.searchByTag(tag, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  async get(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.fileService.getFile(id, tenantId);
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move file to folder' })
  async move(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string, @Body('folderId') folderId: string) {
    return this.fileService.moveFile(id, tenantId, folderId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a file' })
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.fileService.deleteFile(id, tenantId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create a folder' })
  async createFolder(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<CreateFolderDto, 'tenantId'>) {
    return this.fileService.createFolder({ ...body, tenantId });
  }

  @Get('folders/list')
  @ApiOperation({ summary: 'List folders' })
  async listFolders(@Headers('x-tenant-id') tenantId: string, @Query('parentId') parentId?: string) {
    return this.fileService.listFolders(tenantId, parentId);
  }

  @Delete('folders/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a folder' })
  async deleteFolder(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.fileService.deleteFolder(id, tenantId);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a file' })
  async share(@Param('id') fileId: string, @Headers('x-tenant-id') tenantId: string, @Body() body: Omit<ShareFileDto, 'tenantId' | 'fileId'>) {
    return this.fileService.shareFile({ ...body, fileId, tenantId });
  }

  @Get(':id/shares')
  @ApiOperation({ summary: 'Get file shares' })
  async getShares(@Param('id') fileId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.fileService.getFileShares(fileId, tenantId);
  }
}
