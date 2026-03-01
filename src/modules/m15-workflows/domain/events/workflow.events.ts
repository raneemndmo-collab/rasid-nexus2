export const WorkflowEvents = {
  DEFINITION_CREATED: 'm15.workflow.definition.created',
  DEFINITION_UPDATED: 'm15.workflow.definition.updated',
  DEFINITION_ACTIVATED: 'm15.workflow.definition.activated',
  DEFINITION_ARCHIVED: 'm15.workflow.definition.archived',
  EXECUTION_STARTED: 'm15.workflow.execution.started',
  EXECUTION_COMPLETED: 'm15.workflow.execution.completed',
  EXECUTION_FAILED: 'm15.workflow.execution.failed',
  EXECUTION_PAUSED: 'm15.workflow.execution.paused',
  STEP_STARTED: 'm15.workflow.step.started',
  STEP_COMPLETED: 'm15.workflow.step.completed',
  STEP_FAILED: 'm15.workflow.step.failed',
} as const;
