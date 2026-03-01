import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';

// Kernel Modules
import { K1AuthModule } from './modules/k1-auth/k1-auth.module';
import { K2TenantModule } from './modules/k2-tenant/k2-tenant.module';
import { K3AuditModule } from './modules/k3-audit/k3-audit.module';
import { K4ConfigModule } from './modules/k4-config/k4-config.module';
import { K5EventsModule } from './modules/k5-events/k5-events.module';

// Business Modules
import { M1AuthUsersModule } from './modules/m1-auth-users/m1-auth-users.module';
import { M2TenantsModule } from './modules/m2-tenants/m2-tenants.module';
import { M3RolesModule } from './modules/m3-roles/m3-roles.module';
import { M4PermissionsModule } from './modules/m4-permissions/m4-permissions.module';
import { M30ActionsModule } from './modules/m30-actions/m30-actions.module';

// ORM Entities
import { AuthTokenOrmEntity } from './modules/k1-auth/infrastructure/persistence/repositories/auth-token.orm-entity';
import { AuditLogOrmEntity } from './modules/k3-audit/infrastructure/persistence/repositories/audit-log.orm-entity';
import { ConfigOrmEntity } from './modules/k4-config/infrastructure/persistence/repositories/config.orm-entity';
import { EventOrmEntity, EventSchemaOrmEntity, DlqOrmEntity } from './modules/k5-events/infrastructure/persistence/repositories/event.orm-entity';
import { UserOrmEntity } from './modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity';
import { TenantOrmEntity } from './modules/m2-tenants/infrastructure/persistence/repositories/tenant.orm-entity';
import { RoleOrmEntity } from './modules/m3-roles/infrastructure/persistence/repositories/role.orm-entity';
import { PermissionOrmEntity } from './modules/m4-permissions/infrastructure/persistence/repositories/permission.orm-entity';
import { ActionOrmEntity } from './modules/m30-actions/infrastructure/persistence/repositories/action.orm-entity';

// Health
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Single PostgreSQL instance with all entities for Phase 0 development
    // In production, each module connects to its own database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('K1_DB_HOST', 'localhost'),
        port: config.get<number>('K1_DB_PORT', 5432),
        username: config.get<string>('K1_DB_USER', 'k1_user'),
        password: config.get<string>('K1_DB_PASSWORD', 'k1_pass'),
        database: config.get<string>('K1_DB_NAME', 'k1_auth_db'),
        entities: [
          AuthTokenOrmEntity,
          AuditLogOrmEntity,
          ConfigOrmEntity,
          EventOrmEntity,
          EventSchemaOrmEntity,
          DlqOrmEntity,
          UserOrmEntity,
          TenantOrmEntity,
          RoleOrmEntity,
          PermissionOrmEntity,
          ActionOrmEntity,
        ],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    TerminusModule,

    // Kernel — order matters
    K5EventsModule,   // Global event bus first
    K1AuthModule,
    K2TenantModule,
    K3AuditModule,
    K4ConfigModule,

    // Business modules
    M1AuthUsersModule,
    M2TenantsModule,
    M3RolesModule,
    M4PermissionsModule,
    M30ActionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
