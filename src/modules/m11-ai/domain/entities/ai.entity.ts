// ═══════════════════════════════════════════════════════════
// M11 AI Engine — Domain Entities
// CRITICAL: This module is fully isolated (AI-007, AI-008)
// No business DB access, no domain module imports
// ═══════════════════════════════════════════════════════════

export enum AIModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

export enum FallbackLevel {
  L0 = 'L0',  // Primary provider
  L1 = 'L1',  // Secondary provider
  L2 = 'L2',  // Tertiary provider
  L3 = 'L3',  // Local/lightweight model
  L4 = 'L4',  // Static response (always works)
}

export interface AIModel {
  id: string;
  tenantId: string;
  name: string;
  provider: string;
  modelId: string;
  capabilities: string[];
  fallbackLevel: FallbackLevel;
  status: AIModelStatus;
  costPerToken: number;
  maxTokens: number;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptTemplate {
  id: string;
  tenantId: string;
  name: string;
  capability: string;
  template: string;
  version: number;
  variables: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIUsageLog {
  id: string;
  tenantId: string;
  modelId: string;
  capability: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  qualityScore?: number;
  fallbackLevel: FallbackLevel;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

export interface TenantAIBudget {
  id: string;
  tenantId: string;
  monthlyBudget: number;
  usedBudget: number;
  budgetMonth: string;  // YYYY-MM format
  alertThreshold: number;  // percentage (0-100)
  isExceeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIKillSwitch {
  id: string;
  tenantId: string;
  isActive: boolean;
  activatedBy?: string;
  activatedAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ═══ Capability Interfaces (AI-001) ═══
// All AI calls MUST go through these 6 interfaces only

export interface ITextGeneration {
  generate(tenantId: string, prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult>;
}

export interface IClassification {
  classify(tenantId: string, text: string, categories: string[], options?: ClassificationOptions): Promise<ClassificationResult>;
}

export interface IVisionAnalysis {
  analyze(tenantId: string, imageData: string, prompt: string, options?: VisionOptions): Promise<VisionResult>;
}

export interface ISummarization {
  summarize(tenantId: string, text: string, options?: SummarizationOptions): Promise<SummarizationResult>;
}

export interface ISpeechSynthesis {
  synthesize(tenantId: string, text: string, options?: SpeechOptions): Promise<SpeechResult>;
}

export interface IEmbedding {
  embed(tenantId: string, texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult>;
}

// ═══ Options & Results ═══

export interface TextGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  promptName?: string;
  variables?: Record<string, string>;
}

export interface TextGenerationResult {
  text: string;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
  qualityScore: number;
}

export interface ClassificationOptions {
  confidence?: number;
  promptName?: string;
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  allScores: Record<string, number>;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
}

export interface VisionOptions {
  maxTokens?: number;
  promptName?: string;
}

export interface VisionResult {
  analysis: string;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
}

export interface SummarizationOptions {
  maxLength?: number;
  style?: 'brief' | 'detailed' | 'bullet_points';
  promptName?: string;
}

export interface SummarizationResult {
  summary: string;
  tokens: { prompt: number; completion: number; total: number };
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
  qualityScore: number;
}

export interface SpeechOptions {
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav';
}

export interface SpeechResult {
  audioData: string;  // base64 encoded
  durationMs: number;
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
}

export interface EmbeddingOptions {
  dimensions?: number;
}

export interface EmbeddingResult {
  embeddings: number[][];
  tokens: { total: number };
  cost: number;
  latencyMs: number;
  model: string;
  fallbackLevel: FallbackLevel;
}
