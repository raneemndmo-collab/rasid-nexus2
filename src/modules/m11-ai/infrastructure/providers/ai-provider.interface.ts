// ═══════════════════════════════════════════════════════════
// M11 AI Engine — Provider Plugin Interface
// AI-009: No direct model API exposure — all through plugins
// ═══════════════════════════════════════════════════════════

export interface AIProviderRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIProviderResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface IAIProvider {
  readonly name: string;
  readonly fallbackLevel: string;
  isAvailable(): Promise<boolean>;
  complete(request: AIProviderRequest): Promise<AIProviderResponse>;
  embed?(texts: string[]): Promise<number[][]>;
}

/**
 * L4 Static Response Provider — Always works (AI-006)
 * Returns pre-configured static responses when all other providers fail
 */
export class StaticFallbackProvider implements IAIProvider {
  readonly name = 'static-fallback';
  readonly fallbackLevel = 'L4';

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    const staticResponse = `[AI Service Temporarily Unavailable] Your request has been queued for processing. The system will retry automatically. Input length: ${request.prompt.length} characters.`;
    return {
      text: staticResponse,
      promptTokens: 0,
      completionTokens: staticResponse.split(' ').length,
      totalTokens: staticResponse.split(' ').length,
      model: 'static-fallback-v1',
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    // Return zero vectors as fallback
    return texts.map(() => new Array(384).fill(0));
  }
}
