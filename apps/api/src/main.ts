import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import type { Env } from './config/env';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  const app = configureApp(await NestFactory.create(AppModule));

  const port = app.get(ConfigService<Env, true>).get('PORT', { infer: true });
  // 0.0.0.0 so simulators/emulators and physical devices on the LAN can reach it.
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
