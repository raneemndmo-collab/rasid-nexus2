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

// Kernel Modules — Phase 2
import { K8StorageModule } from './modules/k8-storage/k8-storage.module';
import { K9MonitoringModule } from './modules/k9-monitoring/k9-monitoring.module';
import { K10RegistryModule } from './modules/k10-registry/k10-registry.module';

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

// Business Modules — Phase 2
import { M9PayrollModule } from './modules/m9-payroll/m9-payroll.module';
import { M10SettingsModule } from './modules/m10-settings/m10-settings.module';
import { M11AIModule } from './modules/m11-ai/m11-ai.module';
import { M12NotificationsModule } from './modules/m12-notifications/m12-notifications.module';
import { M13FilesModule } from './modules/m13-files/m13-files.module';
import { M14ReportsModule } from './modules/m14-reports/m14-reports.module';

// Business Modules — Phase 3
import { M15WorkflowsModule } from './modules/m15-workflows/m15-workflows.module';
import { M16FormsModule } from './modules/m16-forms/m16-forms.module';
import { M17OcrModule } from './modules/m17-ocr/m17-ocr.module';
import { M18DashboardsModule } from './modules/m18-dashboards/m18-dashboards.module';
import { M19CalendarModule } from './modules/m19-calendar/m19-calendar.module';
import { M20MessagesModule } from './modules/m20-messages/m20-messages.module';
import { M21TasksModule } from './modules/m21-tasks/m21-tasks.module';
import { M22ProjectsModule } from './modules/m22-projects/m22-projects.module';
import { M23CollaborationModule } from './modules/m23-collaboration/m23-collaboration.module';

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

// ORM Entities — Phase 2
import { StoredObjectOrmEntity, StorageQuotaOrmEntity } from './modules/k8-storage/infrastructure/persistence/repositories/storage.orm-entity';
import { MetricRecordOrmEntity, AlertRuleOrmEntity, AlertOrmEntity, HealthCheckOrmEntity } from './modules/k9-monitoring/infrastructure/persistence/repositories/monitoring.orm-entity';
import { ServiceRegistrationOrmEntity, ServiceEndpointOrmEntity, ServiceDependencyOrmEntity } from './modules/k10-registry/infrastructure/persistence/repositories/registry.orm-entity';
import { SettingOrmEntity, SettingHistoryOrmEntity } from './modules/m10-settings/infrastructure/persistence/repositories/setting.orm-entity';
import { AIModelOrmEntity, PromptTemplateOrmEntity, AIUsageLogOrmEntity, TenantAIBudgetOrmEntity, AIKillSwitchOrmEntity } from './modules/m11-ai/infrastructure/persistence/repositories/ai.orm-entity';
import { UserNotificationOrmEntity, NotificationSubscriptionOrmEntity } from './modules/m12-notifications/infrastructure/persistence/repositories/user-notification.orm-entity';
import { ManagedFileOrmEntity, FolderOrmEntity, FileShareOrmEntity } from './modules/m13-files/infrastructure/persistence/repositories/file.orm-entity';
import { PayrollRunOrmEntity, PayrollItemOrmEntity, EmployeePayslipOrmEntity, SalaryStructureOrmEntity } from './modules/m9-payroll/infrastructure/persistence/repositories/payroll.orm-entity';
import { ReportDefinitionOrmEntity, ReportExecutionOrmEntity, ScheduledReportOrmEntity } from './modules/m14-reports/infrastructure/persistence/repositories/report.orm-entity';

// ORM Entities — Phase 3
import { WorkflowDefinitionEntity, WorkflowExecutionEntity, WorkflowStepLogEntity } from './modules/m15-workflows/infrastructure/persistence/repositories/workflow.orm-entity';
import { FormDefinitionEntity, FormSubmissionEntity } from './modules/m16-forms/infrastructure/persistence/repositories/form.orm-entity';
import { OcrJobEntity } from './modules/m17-ocr/infrastructure/persistence/repositories/ocr.orm-entity';
import { DashboardEntity, WidgetEntity } from './modules/m18-dashboards/infrastructure/persistence/repositories/dashboard.orm-entity';
import { CalendarEventEntity } from './modules/m19-calendar/infrastructure/persistence/repositories/calendar.orm-entity';
import { MessageThreadEntity, MessageEntity } from './modules/m20-messages/infrastructure/persistence/repositories/message.orm-entity';
import { TaskEntity, TaskCommentEntity } from './modules/m21-tasks/infrastructure/persistence/repositories/task.orm-entity';
import { ProjectEntity, ProjectMemberEntity } from './modules/m22-projects/infrastructure/persistence/repositories/project.orm-entity';
import { CollaborationSessionEntity, CollaborationChangeEntity, CollaborationPresenceEntity } from './modules/m23-collaboration/infrastructure/persistence/repositories/collaboration.orm-entity';

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
          // Phase 2 — Kernel
          StoredObjectOrmEntity,
          StorageQuotaOrmEntity,
          MetricRecordOrmEntity,
          AlertRuleOrmEntity,
          AlertOrmEntity,
          HealthCheckOrmEntity,
          ServiceRegistrationOrmEntity,
          ServiceEndpointOrmEntity,
          ServiceDependencyOrmEntity,
          // Phase 2 — Business
          SettingOrmEntity,
          SettingHistoryOrmEntity,
          AIModelOrmEntity,
          PromptTemplateOrmEntity,
          AIUsageLogOrmEntity,
          TenantAIBudgetOrmEntity,
          AIKillSwitchOrmEntity,
          UserNotificationOrmEntity,
          NotificationSubscriptionOrmEntity,
          ManagedFileOrmEntity,
          FolderOrmEntity,
          FileShareOrmEntity,
          PayrollRunOrmEntity,
          PayrollItemOrmEntity,
          EmployeePayslipOrmEntity,
          SalaryStructureOrmEntity,
          ReportDefinitionOrmEntity,
          ReportExecutionOrmEntity,
          ScheduledReportOrmEntity,
          // Phase 3
          WorkflowDefinitionEntity,
          WorkflowExecutionEntity,
          WorkflowStepLogEntity,
          FormDefinitionEntity,
          FormSubmissionEntity,
          OcrJobEntity,
          DashboardEntity,
          WidgetEntity,
          CalendarEventEntity,
          MessageThreadEntity,
          MessageEntity,
          TaskEntity,
          TaskCommentEntity,
          ProjectEntity,
          ProjectMemberEntity,
          CollaborationSessionEntity,
          CollaborationChangeEntity,
          CollaborationPresenceEntity,
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
    K8StorageModule,       // Phase 2 kernel
    K9MonitoringModule,    // Phase 2 kernel
    K10RegistryModule,     // Phase 2 kernel

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

    // Business modules — Phase 2
    M9PayrollModule,
    M10SettingsModule,
    M11AIModule,           // HIGH RISK — fully isolated
    M12NotificationsModule,
    M13FilesModule,
    M14ReportsModule,

    // Business modules — Phase 3
    M15WorkflowsModule,
    M16FormsModule,
    M17OcrModule,
    M18DashboardsModule,
    M19CalendarModule,
    M20MessagesModule,
    M21TasksModule,
    M22ProjectsModule,
    M23CollaborationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
