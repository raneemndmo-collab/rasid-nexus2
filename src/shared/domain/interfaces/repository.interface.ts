export interface IRepository<T> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string): Promise<T[]>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, tenantId: string, entity: Partial<T>): Promise<T>;
  delete(id: string, tenantId: string): Promise<void>;
}
