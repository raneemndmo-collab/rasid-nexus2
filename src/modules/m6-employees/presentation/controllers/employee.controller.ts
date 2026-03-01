import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { EmployeeService, CreateEmployeeDto, UpdateEmployeeDto } from '../../application/services/employee.service';

@ApiTags('m6-employees')
@Controller('m6/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async create(
    @Body() body: { userId: string; employeeNumber: string; departmentId: string; position: string; hireDate: string; managerId?: string; salary?: number; workSchedule?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CreateEmployeeDto = { ...body, tenantId: tenantId, hireDate: new Date(body.hireDate) };
    return this.employeeService.create(dto);
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.employeeService.findAll(tenantId);
  }

  @Get('department/:departmentId')
  async findByDepartment(
    @Param('departmentId') departmentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.employeeService.findByDepartment(departmentId, tenantId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.employeeService.findById(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.employeeService.update(id, tenantId, body);
  }

  @Delete(':id')
  async terminate(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.employeeService.terminate(id, tenantId);
    return { message: 'Employee terminated' };
  }
}
