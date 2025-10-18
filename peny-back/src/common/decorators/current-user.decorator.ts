import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  // Puedes agregar más campos si tu JWT los incluye
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Decorador para extraer el ID del usuario autenticado desde el JWT
 * Uso: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);
