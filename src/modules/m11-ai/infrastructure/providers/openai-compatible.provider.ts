// ═══════════════════════════════════════════════════════════
// M11 AI Engine — OpenAI-Compatible Provider Plugin (L0/L1)
// AI-009: Model API accessed only through this plugin
// ═══════════════════════════════════════════════════════════

import { IAIProvider, AIProviderRequest, AIProviderResponse } from './ai-provider.interface';

export class OpenAICompatibleProvider implements IAIProvider {
  readonly name: string;
  readonly fallbackLevel: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(config: {
    name: string;
    fallbackLevel: string;
    apiKey: string;
    baseUrl: string;
    defaultModel: string;
  }) {
    this.name = config.name;
    this.fallbackLevel = config.fallbackLevel;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.defaultModel = config.defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check — try to list models
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async complete(request: AIProviderRequest): Promise<AIProviderResponse> {
    const model = request.model || this.defaultModel;
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`AI Provider ${this.name} error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      model: string;
    };

    return {
      text: data.choices[0]?.message?.content || '',
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      model: data.model || model,
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Embedding error: ${response.status}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[] }>;
    };

    return data.data.map(d => d.embedding);
  }
}
