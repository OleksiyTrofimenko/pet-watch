import type { INestApplication } from '@nestjs/common';

/**
 * App-instance settings shared by main.ts and the e2e tests, so tests can't drift from prod.
 * Pipes, filters and guards are NOT here: they are APP_* providers in AppModule (they need DI),
 * so any app built from AppModule already has them.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.enableShutdownHooks();
  return app;
}
