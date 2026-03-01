export interface EventEnvelope<T = unknown> {
  event_id: string;
  event_type: string;
  tenant_id: string;
  correlation_id: string;
  timestamp: string;
  version: number;
  payload: T;
}
