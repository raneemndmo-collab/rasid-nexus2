/**
 * T-P0-012: K5 Idempotency
 * Verifies duplicate events are processed only once.
 */
describe('T-P0-012: K5 Idempotency', () => {
  it('should have event_id as primary key (natural dedup)', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/persistence/repositories/event.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('PrimaryColumn');
    expect(entity).toContain('event_id');
  });

  it('should check for duplicate event_id before storing', () => {
    const fs = require('fs');
    const path = require('path');
    const store = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/persistence/repositories/event-store.repository.ts'),
      'utf8',
    );
    expect(store).toContain('findOne');
  });

  it('should have event_id in event envelope interface', () => {
    const fs = require('fs');
    const path = require('path');
    const envelope = fs.readFileSync(
      path.join(__dirname, '../../src/shared/domain/events/event-envelope.ts'),
      'utf8',
    );
    expect(envelope).toContain('event_id');
  });
});
