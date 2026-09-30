import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { validateEnv } from './config/env';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    PrismaModule,
    // Feature modules are added here as they are built:
    // AuthModule, UsersModule, PetsModule, CareTasksModule, InvitationsModule,
    // StorageModule (S3 presign), MailModule (SMTP).
  ],
  controllers: [HealthController],
  providers: [
    // Global DTO validation: every @Body/@Query typed with a createZodDto class is validated.
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
