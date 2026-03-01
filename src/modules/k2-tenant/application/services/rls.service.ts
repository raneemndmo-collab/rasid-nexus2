import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RlsService {
  /**
   * Set the current tenant context on a database connection.
   * This sets the PostgreSQL session variable used by RLS policies.
   */
  async setTenantContext(dataSource: DataSource, tenantId: string): Promise<void> {
    await dataSource.query(`SET app.current_tenant_id = '${tenantId}'`);
  }

  /**
   * Enable RLS on a table and create tenant isolation policies.
   */
  async enableRls(dataSource: DataSource, tableName: string): Promise<void> {
    await dataSource.query(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`);
    await dataSource.query(`ALTER TABLE "${tableName}" FORCE ROW LEVEL SECURITY`);

    // Create SELECT/UPDATE/DELETE policy
    await dataSource.query(`
      CREATE POLICY IF NOT EXISTS tenant_isolation_${tableName} ON "${tableName}"
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    `);

    // Create INSERT policy
    await dataSource.query(`
      CREATE POLICY IF NOT EXISTS tenant_insert_${tableName} ON "${tableName}"
        FOR INSERT
        WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid)
    `);
  }

  /**
   * Verify RLS is enabled on a table.
   */
  async verifyRls(dataSource: DataSource, tableName: string): Promise<boolean> {
    const result = await dataSource.query(`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname = $1
    `, [tableName]);

    if (result.length === 0) return false;
    return result[0].relrowsecurity && result[0].relforcerowsecurity;
  }
}
