import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface TenantContext {
  tenantId: string;
  userId: string;
  correlationId: string;
}

export const GetTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantContext = (request as unknown as Record<string, unknown>)['tenantContext'] as TenantContext | undefined;
    if (!tenantContext) {
      throw new Error('TenantContext not found in request');
    }
    return tenantContext;
  },
);

export const GetTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantContext = (request as unknown as Record<string, unknown>)['tenantContext'] as TenantContext | undefined;
    if (!tenantContext) {
      throw new Error('TenantContext not found in request');
    }
    return tenantContext.tenantId;
  },
);
