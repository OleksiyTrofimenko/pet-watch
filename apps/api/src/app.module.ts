import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { validateEnv } from './config/env';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { CareTasksModule } from './care-tasks/care-tasks.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PetsModule,
    CareTasksModule,
    InvitationsModule,
  ],
  providers: [
    // Global DTO validation: every @Body/@Query typed with a createZodDto class is validated.
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    // Secure by default: every route needs an access token unless marked @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
