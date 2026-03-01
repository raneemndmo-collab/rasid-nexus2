# DOC-P2-004: AI Prompt Registry

**Version:** 1.0.0  
**Phase:** 2  
**Generated:** 2026-03-01  

---

## Overview

This document catalogs all AI prompts used in the Rasid platform. Each prompt has a unique ID, version, and is linked to a specific capability interface. Prompts are stored in the `ai_prompts` table in `m11_ai_db`.

---

## Prompt Catalog

### PR-001: Report Summarization
| Field | Value |
|-------|-------|
| ID | PR-001 |
| Capability | ISummarization |
| Module | M14 Reports |
| Version | 1.0 |
| System Prompt | `You are a business report summarizer for a Saudi HR platform. Summarize the following report data concisely in the requested style. Use professional language. If data contains Arabic, respond in Arabic.` |
| User Template | `Summarize this report:\n\nTitle: {{title}}\nModule: {{module}}\nData: {{data}}\n\nStyle: {{style}}` |
| Max Tokens | 500 |
| Temperature | 0.3 |

### PR-002: Expense Classification
| Field | Value |
|-------|-------|
| ID | PR-002 |
| Capability | IClassification |
| Module | M9 Payroll |
| Version | 1.0 |
| System Prompt | `You are a payroll expense classifier for a Saudi company. Classify the given expense into exactly one of the provided categories. Respond with only the category name.` |
| User Template | `Classify this expense: "{{description}}"\n\nCategories: {{categories}}` |
| Max Tokens | 50 |
| Temperature | 0.1 |

### PR-003: Employee Document Analysis
| Field | Value |
|-------|-------|
| ID | PR-003 |
| Capability | IVisionAnalysis |
| Module | M13 Files |
| Version | 1.0 |
| System Prompt | `You are a document analyzer for an HR platform. Analyze the uploaded document image and extract key information.` |
| User Template | `Analyze this document and extract: {{fields}}` |
| Max Tokens | 1000 |
| Temperature | 0.2 |

### PR-004: Notification Content Generation
| Field | Value |
|-------|-------|
| ID | PR-004 |
| Capability | ITextGeneration |
| Module | M12 Notifications |
| Version | 1.0 |
| System Prompt | `You are a notification writer for an HR platform. Generate clear, professional notification messages. Keep them concise (under 200 characters for title, under 500 for body).` |
| User Template | `Generate a {{type}} notification:\nEvent: {{event}}\nContext: {{context}}\nLanguage: {{language}}` |
| Max Tokens | 200 |
| Temperature | 0.5 |

### PR-005: Text Embedding for Search
| Field | Value |
|-------|-------|
| ID | PR-005 |
| Capability | IEmbedding |
| Module | K8 Storage / M13 Files |
| Version | 1.0 |
| System Prompt | N/A (embedding model) |
| User Template | Direct text input |
| Dimensions | 1536 |

### PR-006: Arabic Speech Synthesis
| Field | Value |
|-------|-------|
| ID | PR-006 |
| Capability | ISpeechSynthesis |
| Module | M12 Notifications |
| Version | 1.0 |
| Voice | alloy |
| Speed | 1.0 |
| Format | mp3 |

---

## Prompt Versioning Policy

1. All prompts are versioned (major.minor).
2. Minor changes (wording tweaks) increment minor version.
3. Major changes (different approach, new fields) increment major version.
4. Old versions are kept in the database for audit trail.
5. A/B testing is supported by assigning different versions to different tenants.

## Prompt Quality Metrics

Each prompt version tracks:
- **Success rate**: % of calls that return valid output
- **Average latency**: Mean response time
- **User satisfaction**: Feedback score (if collected)
- **Cost per call**: Average token cost

See `docs/phase-2/ai-quality-baseline.json` for baseline metrics.
