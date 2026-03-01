/**
 * T-P0-011: K5 DLQ
 * Verifies Dead Letter Queue is configured for failed events.
 */
describe('T-P0-011: K5 DLQ', () => {
  it('should have DLQ ORM entity', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/persistence/repositories/event.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('DlqOrmEntity');
    expect(entity).toContain('dead_letter_queue');
    expect(entity).toContain('error');
    expect(entity).toContain('attempts');
  });

  it('should have DLQ handling in event bus', () => {
    const fs = require('fs');
    const path = require('path');
    const eventBus = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/messaging/nats-event-bus.service.ts'),
      'utf8',
    );
    expect(eventBus).toContain('dlq');
  });

  it('should have DLQ query endpoint in events controller', () => {
    const fs = require('fs');
    const path = require('path');
    const controller = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/presentation/controllers/events.controller.ts'),
      'utf8',
    );
    expect(controller).toContain('dlq');
  });
});
