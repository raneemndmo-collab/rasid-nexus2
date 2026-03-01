import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantContextMiddleware } from './presentation/middleware/tenant-context.middleware';
import { RlsService } from './application/services/rls.service';

@Module({
  providers: [RlsService, TenantContextMiddleware],
  exports: [RlsService, TenantContextMiddleware],
})
export class K2TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
