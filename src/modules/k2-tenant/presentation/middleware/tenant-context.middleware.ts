import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // Public endpoints bypass tenant check
    const publicPaths = ['/auth/login', '/auth/token', '/.well-known/jwks', '/health', '/health/ready', '/metrics'];
    if (publicPaths.some(p => req.path.startsWith(p))) {
      return next();
    }

    const reqAny = req as unknown as Record<string, unknown>;
    const user = reqAny['user'] as { tenantId?: string; sub?: string } | undefined;
    if (!user?.tenantId) {
      throw new ForbiddenException('Missing tenant context — tenant_id required');
    }

    reqAny['tenantContext'] = {
      tenantId: user.tenantId,
      userId: user.sub,
      correlationId: (req.headers['x-correlation-id'] as string) || uuidv4(),
    };

    next();
  }
}
