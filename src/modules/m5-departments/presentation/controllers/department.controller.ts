import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { DepartmentService, CreateDepartmentDto, UpdateDepartmentDto } from '../../application/services/department.service';

@ApiTags('m5-departments')
@Controller('m5/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(
    @Body() body: { name: string; code: string; description?: string; parentId?: string; managerId?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CreateDepartmentDto = { ...body, tenantId: tenantId };
    return this.departmentService.create(dto);
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.departmentService.findAll(tenantId);
  }

  @Get('tree')
  async getTree(@Headers('x-tenant-id') tenantId: string) {
    return this.departmentService.getTree(tenantId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.departmentService.findById(id, tenantId);
  }

  @Get(':id/children')
  async getChildren(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.departmentService.getChildren(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateDepartmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.departmentService.update(id, tenantId, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.departmentService.delete(id, tenantId);
    return { message: 'Department deleted' };
  }
}
