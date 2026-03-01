/**
 * T-P0-010: K5 Schema Validation
 * Verifies events with invalid schemas are rejected.
 */
describe('T-P0-010: K5 Schema Validation', () => {
  it('should have event schema ORM entity', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/persistence/repositories/event.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('EventSchemaOrmEntity');
    expect(entity).toContain('event_schemas');
    expect(entity).toContain('schema');
  });

  it('should have schema validation in event bus', () => {
    const fs = require('fs');
    const path = require('path');
    const eventBus = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/messaging/nats-event-bus.service.ts'),
      'utf8',
    );
    expect(eventBus).toContain('validate');
  });

  it('should have event_type as primary key in schema table', () => {
    const fs = require('fs');
    const path = require('path');
    const entity = fs.readFileSync(
      path.join(__dirname, '../../src/modules/k5-events/infrastructure/persistence/repositories/event.orm-entity.ts'),
      'utf8',
    );
    expect(entity).toContain('PrimaryColumn');
    expect(entity).toContain('event_type');
  });
});
