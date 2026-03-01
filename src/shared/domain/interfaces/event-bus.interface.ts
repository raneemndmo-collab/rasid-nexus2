import { EventEnvelope } from '../events/event-envelope';

export const EVENT_BUS = Symbol('EVENT_BUS');

export interface IEventBus {
  publish(event: EventEnvelope): Promise<void>;
  subscribe(eventType: string, handler: (event: EventEnvelope) => Promise<void>): Promise<void>;
}
