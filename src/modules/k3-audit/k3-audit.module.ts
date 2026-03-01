import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './infrastructure/persistence/repositories/audit-log.orm-entity';
import { AuditRepository } from './infrastructure/persistence/repositories/audit.repository';
import { AuditMiddleware } from './presentation/middleware/audit.middleware';
import { AuditController } from './presentation/controllers/audit.controller';
import { AUDIT_SERVICE } from '@shared/domain/interfaces/audit-service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [AuditController],
  providers: [
    {
      provide: AUDIT_SERVICE,
      useClass: AuditRepository,
    },
    AuditMiddleware,
  ],
  exports: [AUDIT_SERVICE],
})
export class K3AuditModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
