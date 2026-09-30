import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

const SECRET = 'test-secret-that-is-at-least-32-chars!!';
const jwt = new JwtService({
  secret: SECRET,
  signOptions: { algorithm: 'HS256', expiresIn: 60 },
  verifyOptions: { algorithms: ['HS256'] },
});
const guard = new JwtAuthGuard(new Reflector(), jwt);

class Routes {
  @Public()
  open(): void {}
  closed(): void {}
}

function contextFor(handler: () => void, authorization?: string) {
  const request: { headers: { authorization?: string }; user?: AuthUser } = {
    headers: { authorization },
  };
  const context = new ExecutionContextHost([request], Routes, handler);
  return { context, request };
}

describe('JwtAuthGuard', () => {
  it('lets @Public() routes through without a token', async () => {
    await expect(guard.canActivate(contextFor(Routes.prototype.open).context)).resolves.toBe(true);
  });

  it('sets request.user from a valid token', async () => {
    const token = await jwt.signAsync({ sub: 'user-1' });
    const { context, request } = contextFor(Routes.prototype.closed, `Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1' });
  });

  it.each([
    ['no header', undefined],
    ['not a bearer', 'Basic abc'],
    ['garbage', 'Bearer not-a-jwt'],
  ])('rejects %s with UNAUTHENTICATED', async (_, header) => {
    await expect(
      guard.canActivate(contextFor(Routes.prototype.closed, header).context),
    ).rejects.toMatchObject({ status: 401, response: { code: 'UNAUTHENTICATED' } });
  });

  it('rejects a token signed with another algorithm', async () => {
    const hs512 = await jwt.signAsync({ sub: 'user-1' }, { algorithm: 'HS512', secret: SECRET });
    await expect(
      guard.canActivate(contextFor(Routes.prototype.closed, `Bearer ${hs512}`).context),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
