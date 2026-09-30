import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { type Env, validateEnv } from '../../src/config/env';
import { configureApp } from '../../src/configure-app';

/**
 * The real AppModule (real Postgres, SMTP, S3) with the same app setup as main.ts.
 * `env` overrides .env.test for one app, validated by the same schema as production config.
 */
export async function createTestApp(env: Partial<Env> = {}): Promise<INestApplication<App>> {
  const builder = Test.createTestingModule({ imports: [AppModule] });
  if (Object.keys(env).length > 0) {
    // ConfigService reads its own config before process.env, so these values win.
    builder
      .overrideProvider(ConfigService)
      .useValue(new ConfigService<Env, true>(validateEnv({ ...process.env, ...env })));
  }
  const moduleRef = await builder.compile();
  const app = configureApp(moduleRef.createNestApplication<INestApplication<App>>());
  await app.init();
  return app;
}

/** supertest agent bound to the in-process HTTP server (no port is opened). */
export function api(app: INestApplication<App>) {
  return request(app.getHttpServer());
}
