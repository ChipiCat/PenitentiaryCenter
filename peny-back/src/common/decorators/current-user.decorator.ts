import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para extraer el ID del usuario autenticado desde el JWT
 * Uso: @CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id; // Extraído por JwtAuthGuard
  },
);
