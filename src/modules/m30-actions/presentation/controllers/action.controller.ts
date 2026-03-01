import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActionService } from '../../application/services/action.service';

@ApiTags('Actions (M30)')
@ApiBearerAuth()
@Controller('actions')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new action' })
  async register(@Body() body: {
    code: string;
    name: string;
    description: string;
    module: string;
    requiredPermissions?: string[];
    metadata?: Record<string, unknown>;
  }) {
    return this.actionService.register(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered actions' })
  async findAll() {
    return this.actionService.findAll();
  }

  @Get('module/:module')
  @ApiOperation({ summary: 'List actions by module' })
  async findByModule(@Param('module') module: string) {
    return this.actionService.findByModule(module);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get action by code' })
  async findByCode(@Param('code') code: string) {
    return this.actionService.findByCode(code);
  }

  @Post(':code/validate')
  @ApiOperation({ summary: 'Validate if action is registered' })
  async validate(@Param('code') code: string) {
    const isValid = await this.actionService.validateAction(code);
    return { valid: isValid };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an action' })
  async deactivate(@Param('id') id: string) {
    return this.actionService.deactivate(id);
  }
}
