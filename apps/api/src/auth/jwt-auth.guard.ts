import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_CODES } from '@petwatch/shared';
import type { AuthenticatedRequest } from './current-user.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

export interface AccessTokenPayload {
  sub: string;
}

/** Global guard: every route needs a valid access token unless marked @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);
    if (!token) throw unauthenticated();

    try {
      // Algorithms are pinned to HS256 in JwtModule verifyOptions.
      const payload = await this.jwt.verifyAsync<Partial<AccessTokenPayload>>(token);
      if (typeof payload.sub !== 'string') throw unauthenticated();
      request.user = { id: payload.sub };
      return true;
    } catch {
      // Expired, bad signature, wrong algorithm: the client reacts the same way (refresh).
      throw unauthenticated();
    }
  }
}

function bearerToken(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : undefined;
}

function unauthenticated(): UnauthorizedException {
  return new UnauthorizedException({
    code: AUTH_ERROR_CODES.UNAUTHENTICATED,
    message: 'Sign in to continue',
  });
}
