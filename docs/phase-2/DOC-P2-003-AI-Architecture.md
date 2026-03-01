# DOC-P2-003: AI Architecture — M11 AI Engine

**Version:** 1.0.0  
**Phase:** 2  
**Risk Level:** HIGH  
**Generated:** 2026-03-01  

---

## 1. Overview

The M11 AI Engine provides a unified, secure, and auditable interface for all AI capabilities in the Rasid platform. It is designed with defense-in-depth principles: every AI call is logged, budgeted, quality-monitored, and can be instantly disabled via kill switch.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   M14 Reports                        │
│                   M9 Payroll                          │
│                   Other Modules                       │
└───────────────┬─────────────────────────────────────┘
                │ ISummarization / IClassification / ...
                ▼
┌─────────────────────────────────────────────────────┐
│              M11 AI Engine (AIService)                │
│                                                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Budget  │ │ Quality  │ │  Kill    │              │
│  │ Guard   │ │ Monitor  │ │  Switch  │              │
│  └────┬────┘ └────┬─────┘ └────┬─────┘              │
│       │           │            │                      │
│  ┌────▼───────────▼────────────▼─────┐               │
│  │        Provider Chain              │               │
│  │  L0: OpenAI-Compatible (Primary)  │               │
│  │  L1: Fallback Provider            │               │
│  │  L2: Lightweight Model            │               │
│  │  L3: Rule-Based Engine            │               │
│  │  L4: Static Fallback (Offline)    │               │
│  └───────────────────────────────────┘               │
│                                                       │
│  ┌──────────────────────────────────┐                │
│  │        Usage Logger               │                │
│  │  → ai_usage_logs table            │                │
│  │  → tokens, cost, latency, model   │                │
│  └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│              m11_ai_db (PostgreSQL)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ ai_models│ │ai_prompts│ │ai_usage  │            │
│  │          │ │          │ │_logs     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

## 3. Six Capability Interfaces

| Interface | Method | Description | Model Used |
|-----------|--------|-------------|------------|
| ITextGeneration | `generate(prompt, options)` | Free-form text generation | gpt-4.1-mini |
| IClassification | `classify(text, categories)` | Multi-class text classification | gpt-4.1-nano |
| ISummarization | `summarize(text, style)` | Text summarization (brief/bullets/executive) | gpt-4.1-mini |
| IVisionAnalysis | `analyzeImage(imageData, prompt)` | Image understanding and description | gpt-4.1-mini |
| ISpeechSynthesis | `synthesizeSpeech(text, voice)` | Text-to-speech generation | tts-1 |
| IEmbedding | `embed(texts)` | Text vector embeddings | text-embedding-3-small |

## 4. Fallback Chain (5 Levels)

The AI Engine implements a 5-level fallback chain to ensure availability even during provider outages:

| Level | Provider | Trigger | Behavior |
|-------|----------|---------|----------|
| L0 | OpenAI-Compatible (Primary) | Default | Full AI capabilities via API |
| L1 | Fallback Provider | L0 timeout/error | Secondary API endpoint |
| L2 | Lightweight Model | L1 failure | Smaller, faster model |
| L3 | Rule-Based Engine | L2 failure | Deterministic rules, no AI |
| L4 | Static Fallback | L3 failure | Pre-computed responses, offline mode |

Each level logs the fallback event and notifies monitoring (K9).

## 5. Kill Switch

The kill switch can instantly disable all AI operations:

```typescript
// Enable kill switch
await aiService.setKillSwitch(true, 'Security incident detected');

// All subsequent AI calls return:
// { error: 'AI_DISABLED', reason: 'Security incident detected' }
```

Kill switch state is persisted in the database and survives restarts.

## 6. Budget Enforcement

Per-tenant monthly budget limits prevent runaway costs:

```typescript
interface BudgetConfig {
  monthly_limit_usd: number;    // e.g., 100.00
  warning_threshold: number;     // e.g., 0.8 (80%)
  hard_limit_action: 'block' | 'fallback';
}
```

When budget is exceeded:
- If `hard_limit_action = 'block'`: Returns error
- If `hard_limit_action = 'fallback'`: Falls back to L3/L4 (free)

## 7. Quality Monitoring

Every AI response is scored on:
- **Latency**: Response time in milliseconds
- **Token efficiency**: Output tokens / input tokens ratio
- **Success rate**: Successful responses / total requests

Quality baseline established with 600 prompts (100 per interface). See `docs/phase-2/ai-quality-baseline.json`.

## 8. Usage Logging

Every AI call is logged to `ai_usage_logs`:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Log entry ID |
| tenant_id | UUID | Tenant |
| capability | string | Interface used |
| model | string | Model used |
| input_tokens | integer | Tokens in prompt |
| output_tokens | integer | Tokens in response |
| latency_ms | integer | Response time |
| cost_usd | decimal | Estimated cost |
| status | string | success/error/fallback |
| provider_level | integer | L0-L4 |
| created_at | timestamp | When the call was made |

## 9. Security Considerations

1. **Tenant Isolation**: All AI calls are scoped to tenant_id. No cross-tenant data leakage.
2. **API Key Management**: Provider API keys stored encrypted in M10 Settings.
3. **Input Sanitization**: All prompts are sanitized before sending to providers.
4. **Output Filtering**: AI responses are checked for PII before returning.
5. **Audit Trail**: All AI operations logged to K3 Audit.
6. **Rate Limiting**: Per-tenant rate limits enforced at the service level.

## 10. Integration Points

| Module | Integration | Direction |
|--------|-------------|-----------|
| M14 Reports | ISummarization for report summaries | M14 → M11 |
| M9 Payroll | IClassification for expense categorization | M9 → M11 |
| K9 Monitoring | Health checks and metrics | M11 → K9 |
| K3 Audit | All AI operations logged | M11 → K3 |
| M10 Settings | AI configuration and API keys | M11 ← M10 |
| K8 Storage | AI-generated artifacts stored | M11 → K8 |
