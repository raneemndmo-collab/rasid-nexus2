// ═══════════════════════════════════════════════════════════
// M11 AI Engine — Controller
// AI-009: No direct model API exposure
// All AI accessed through the 6 capability interfaces only
// ═══════════════════════════════════════════════════════════

import { Controller, Post, Get, Put, Delete, Param, Body, Query, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIService } from '../../application/services/ai.service';

@ApiTags('M11 AI Engine')
@Controller('api/m11/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // ═══ Capability Interfaces ═══

  @Post('text/generate')
  @ApiOperation({ summary: 'Generate text (ITextGeneration)' })
  async generateText(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { prompt: string; maxTokens?: number; temperature?: number; promptName?: string; variables?: Record<string, string> },
  ) {
    return this.aiService.generate(tenantId, body.prompt, {
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      promptName: body.promptName,
      variables: body.variables,
    });
  }

  @Post('text/classify')
  @ApiOperation({ summary: 'Classify text (IClassification)' })
  async classifyText(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { text: string; categories: string[]; promptName?: string },
  ) {
    return this.aiService.classify(tenantId, body.text, body.categories, { promptName: body.promptName });
  }

  @Post('vision/analyze')
  @ApiOperation({ summary: 'Analyze image (IVisionAnalysis)' })
  async analyzeVision(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { imageData: string; prompt: string; promptName?: string },
  ) {
    return this.aiService.analyze(tenantId, body.imageData, body.prompt, { promptName: body.promptName });
  }

  @Post('text/summarize')
  @ApiOperation({ summary: 'Summarize text (ISummarization)' })
  async summarizeText(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { text: string; maxLength?: number; style?: 'brief' | 'detailed' | 'bullet_points'; promptName?: string },
  ) {
    return this.aiService.summarize(tenantId, body.text, {
      maxLength: body.maxLength,
      style: body.style,
      promptName: body.promptName,
    });
  }

  @Post('speech/synthesize')
  @ApiOperation({ summary: 'Synthesize speech (ISpeechSynthesis)' })
  async synthesizeSpeech(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { text: string; voice?: string; speed?: number; format?: 'mp3' | 'wav' },
  ) {
    return this.aiService.synthesize(tenantId, body.text, body);
  }

  @Post('embedding/embed')
  @ApiOperation({ summary: 'Generate embeddings (IEmbedding)' })
  async generateEmbeddings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { texts: string[]; dimensions?: number },
  ) {
    return this.aiService.embed(tenantId, body.texts, { dimensions: body.dimensions });
  }

  // ═══ Kill Switch ═══

  @Post('killswitch/activate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Activate AI kill switch' })
  async activateKillSwitch(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { userId: string; reason: string },
  ) {
    await this.aiService.activateKillSwitch(tenantId, body.userId, body.reason);
    return { status: 'kill_switch_activated' };
  }

  @Post('killswitch/deactivate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate AI kill switch' })
  async deactivateKillSwitch(@Headers('x-tenant-id') tenantId: string) {
    await this.aiService.deactivateKillSwitch(tenantId);
    return { status: 'kill_switch_deactivated' };
  }

  @Get('killswitch/status')
  @ApiOperation({ summary: 'Get kill switch status' })
  async getKillSwitchStatus(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getKillSwitchStatus(tenantId);
  }

  // ═══ Budget ═══

  @Get('budget')
  @ApiOperation({ summary: 'Get current AI budget' })
  async getBudget(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getBudget(tenantId);
  }

  @Put('budget')
  @ApiOperation({ summary: 'Set AI budget' })
  async setBudget(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { monthlyBudget: number; alertThreshold?: number },
  ) {
    return this.aiService.setBudget(tenantId, body.monthlyBudget, body.alertThreshold);
  }

  // ═══ Usage Stats ═══

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  async getUsageStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.aiService.getUsageStats(tenantId, new Date(from), new Date(to));
  }

  // ═══ Model & Prompt Registry ═══

  @Get('models')
  @ApiOperation({ summary: 'List registered AI models' })
  async getModels(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getModels(tenantId);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'List registered prompts' })
  async getPrompts(@Headers('x-tenant-id') tenantId: string) {
    return this.aiService.getPrompts(tenantId);
  }
}
