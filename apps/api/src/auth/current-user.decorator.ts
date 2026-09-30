import { createParamDecorator, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { AUTH_ERROR_CODES } from '@petwatch/shared';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
}

export type AuthenticatedRequest = Request & { user?: AuthUser };

/** The user set by JwtAuthGuard. Throws if used on a @Public() route by mistake. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const user = ctx.switchToHttp().getRequest<AuthenticatedRequest>().user;
  if (!user) {
    throw new UnauthorizedException({
      code: AUTH_ERROR_CODES.UNAUTHENTICATED,
      message: 'Sign in to continue',
    });
  }
  return user;
});
