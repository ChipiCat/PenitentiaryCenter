import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Custom Request interface to store audit metadata
 */
export interface RequestWithAudit extends Request {
  auditMetadata?: {
    ipAddress: string;
    userAgent: string;
  };
}

/**
 * Global interceptor to capture IP and User-Agent for audit purposes
 * This allows all endpoints to access audit metadata without explicit decorators
 */
@Injectable()
export class AuditMetadataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAudit>();

    // Extract IP address (handles proxies and load balancers)
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    
    let ipAddress: string;
    if (typeof forwardedFor === 'string') {
      ipAddress = forwardedFor.split(',')[0].trim();
    } else if (typeof realIp === 'string') {
      ipAddress = realIp;
    } else {
      ipAddress = request.socket.remoteAddress || 'unknown';
    }

    // Extract User-Agent
    const userAgent = (request.headers['user-agent'] as string) || 'unknown';

    // Attach audit metadata to request object
    request.auditMetadata = {
      ipAddress,
      userAgent,
    };

    return next.handle();
  }
}
