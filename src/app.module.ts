import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';

// Kernel Modules — Phase 0
import { K1AuthModule } from './modules/k1-auth/k1-auth.module';
import { K2TenantModule } from './modules/k2-tenant/k2-tenant.module';
import { K3AuditModule } from './modules/k3-audit/k3-audit.module';
import { K4ConfigModule } from './modules/k4-config/k4-config.module';
import { K5EventsModule } from './modules/k5-events/k5-events.module';

// Kernel Modules — Phase 1
import { K6NotificationModule } from './modules/k6-notification/k6-notification.module';
import { K7SchedulerModule } from './modules/k7-scheduler/k7-scheduler.module';

// Business Modules — Phase 0
import { M1AuthUsersModule } from './modules/m1-auth-users/m1-auth-users.module';
import { M2TenantsModule } from './modules/m2-tenants/m2-tenants.module';
import { M3RolesModule } from './modules/m3-roles/m3-roles.module';
import { M4PermissionsModule } from './modules/m4-permissions/m4-permissions.module';
import { M30ActionsModule } from './modules/m30-actions/m30-actions.module';

// Business Modules — Phase 1
import { M5DepartmentsModule } from './modules/m5-departments/m5-departments.module';
import { M6EmployeesModule } from './modules/m6-employees/m6-employees.module';
import { M7AttendanceModule } from './modules/m7-attendance/m7-attendance.module';
import { M8LeaveModule } from './modules/m8-leave/m8-leave.module';

// ORM Entities — Phase 0
import { AuthTokenOrmEntity } from './modules/k1-auth/infrastructure/persistence/repositories/auth-token.orm-entity';
import { AuditLogOrmEntity } from './modules/k3-audit/infrastructure/persistence/repositories/audit-log.orm-entity';
import { ConfigOrmEntity } from './modules/k4-config/infrastructure/persistence/repositories/config.orm-entity';
import { EventOrmEntity, EventSchemaOrmEntity, DlqOrmEntity } from './modules/k5-events/infrastructure/persistence/repositories/event.orm-entity';
import { UserOrmEntity } from './modules/m1-auth-users/infrastructure/persistence/repositories/user.orm-entity';
import { TenantOrmEntity } from './modules/m2-tenants/infrastructure/persistence/repositories/tenant.orm-entity';
import { RoleOrmEntity } from './modules/m3-roles/infrastructure/persistence/repositories/role.orm-entity';
import { PermissionOrmEntity } from './modules/m4-permissions/infrastructure/persistence/repositories/permission.orm-entity';
import { ActionOrmEntity } from './modules/m30-actions/infrastructure/persistence/repositories/action.orm-entity';

// ORM Entities — Phase 1
import { NotificationOrmEntity, NotificationTemplateOrmEntity, NotificationPreferenceOrmEntity } from './modules/k6-notification/infrastructure/persistence/repositories/notification.orm-entity';
import { ScheduledJobOrmEntity, JobExecutionLogOrmEntity } from './modules/k7-scheduler/infrastructure/persistence/repositories/scheduler.orm-entity';
import { DepartmentOrmEntity } from './modules/m5-departments/infrastructure/persistence/repositories/department.orm-entity';
import { EmployeeOrmEntity } from './modules/m6-employees/infrastructure/persistence/repositories/employee.orm-entity';
import { AttendanceOrmEntity } from './modules/m7-attendance/infrastructure/persistence/repositories/attendance.orm-entity';
import { LeaveRequestOrmEntity, LeaveBalanceOrmEntity } from './modules/m8-leave/infrastructure/persistence/repositories/leave.orm-entity';

// Health
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Single PostgreSQL instance with all entities for development
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
          // Phase 0
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
          // Phase 1
          NotificationOrmEntity,
          NotificationTemplateOrmEntity,
          NotificationPreferenceOrmEntity,
          ScheduledJobOrmEntity,
          JobExecutionLogOrmEntity,
          DepartmentOrmEntity,
          EmployeeOrmEntity,
          AttendanceOrmEntity,
          LeaveRequestOrmEntity,
          LeaveBalanceOrmEntity,
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
    K6NotificationModule,  // Phase 1 kernel
    K7SchedulerModule,     // Phase 1 kernel

    // Business modules — Phase 0
    M1AuthUsersModule,
    M2TenantsModule,
    M3RolesModule,
    M4PermissionsModule,
    M30ActionsModule,

    // Business modules — Phase 1
    M5DepartmentsModule,
    M6EmployeesModule,
    M7AttendanceModule,
    M8LeaveModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
