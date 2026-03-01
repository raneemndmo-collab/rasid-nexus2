import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';

interface TenantCtx {
  tenantId: string;
  userId: string;
  correlationId: string;
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!mutationMethods.includes(req.method)) {
      return next();
    }

    // Skip health and metrics endpoints
    if (req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
      return next();
    }

    const originalSend = res.send.bind(res);
    res.send = (body: unknown) => {
      const reqAny = req as unknown as Record<string, unknown>;
      const tenantContext = reqAny['tenantContext'] as TenantCtx | undefined;
      if (tenantContext) {
        // Fire and forget — do not block response
        this.auditService.log({
          tenantId: tenantContext.tenantId,
          userId: tenantContext.userId,
          action: `${req.method} ${req.path}`,
          entityType: this.extractEntityType(req.path),
          entityId: this.extractEntityId(req.path) || 'N/A',
          newValue: req.body as Record<string, unknown>,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date(),
          correlationId: tenantContext.correlationId || uuidv4(),
        }).catch(() => {
          // Audit logging should not crash the request
        });
      }
      return originalSend(body);
    };

    next();
  }

  private extractEntityType(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts[0] || 'unknown';
  }

  private extractEntityId(path: string): string | undefined {
    const parts = path.split('/').filter(Boolean);
    return parts.length > 1 ? parts[parts.length - 1] : undefined;
  }
}
