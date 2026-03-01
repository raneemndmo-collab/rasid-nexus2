import { ValidationError } from '../errors/domain-errors';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TenantId {
  private constructor(public readonly value: string) {}

  static create(value: string): TenantId {
    if (!value || !UUID_REGEX.test(value)) {
      throw new ValidationError(`Invalid tenant ID: ${value}`);
    }
    return new TenantId(value);
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
