export const AI_EVENTS = {
  AI_REQUEST_COMPLETED: 'ai.request.completed',
  AI_REQUEST_FAILED: 'ai.request.failed',
  AI_FALLBACK_TRIGGERED: 'ai.fallback.triggered',
  AI_BUDGET_WARNING: 'ai.budget.warning',
  AI_BUDGET_EXCEEDED: 'ai.budget.exceeded',
  AI_KILL_SWITCH_ACTIVATED: 'ai.killswitch.activated',
  AI_KILL_SWITCH_DEACTIVATED: 'ai.killswitch.deactivated',
  AI_MODEL_REGISTERED: 'ai.model.registered',
  AI_MODEL_REMOVED: 'ai.model.removed',
  AI_QUALITY_DEGRADED: 'ai.quality.degraded',
} as const;
