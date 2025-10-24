import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAudit } from '../interceptors/audit-metadata.interceptor';

/**
 * Decorator to extract audit metadata (IP and User-Agent) from request
 * Usage: @AuditMetadata() auditMeta: { ipAddress: string; userAgent: string }
 */
export const AuditMetadata = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAudit>();
    return (
      request.auditMetadata || { ipAddress: 'unknown', userAgent: 'unknown' }
    );
  },
);
