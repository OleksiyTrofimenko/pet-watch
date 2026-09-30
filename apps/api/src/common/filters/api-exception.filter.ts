import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@petwatch/shared';
import { Prisma } from '../../generated/prisma/client';

/**
 * Every error leaves the API in one shape: { statusCode, code, message, fieldErrors? }.
 * The mobile client relies on this to map fieldErrors onto form inputs.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const body = toApiErrorBody(exception);
    if (body.statusCode >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }
    res.status(body.statusCode).json(body);
  }
}

export function toApiErrorBody(exception: unknown): ApiErrorBody {
  if (exception instanceof ZodValidationException) {
    const zodError = exception.getZodError();
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'VALIDATION_FAILED',
      message: 'Some fields are invalid',
      fieldErrors: zodError instanceof ZodError ? toFieldErrors(zodError) : undefined,
    };
  }

  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = fromPrismaError(exception);
    if (mapped) return mapped;
  }

  // Never leak internals (stack traces, SQL) to clients.
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  };
}

function fromHttpException(exception: HttpException): ApiErrorBody {
  const statusCode = exception.getStatus();
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return { statusCode, code: defaultCode(statusCode), message: response };
  }
  const { code, message } = response as { code?: unknown; message?: unknown };
  return {
    statusCode,
    code: typeof code === 'string' ? code : defaultCode(statusCode),
    message: typeof message === 'string' ? message : exception.message,
  };
}

/**
 * Safety net for races the service layer can't fully prevent (two requests creating the same
 * unique row). Services should still check and throw domain errors with specific codes first.
 */
function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): ApiErrorBody | undefined {
  switch (error.code) {
    case 'P2002': // unique constraint violation
      return { statusCode: HttpStatus.CONFLICT, code: 'CONFLICT', message: 'This already exists' };
    case 'P2025': // record required for the operation was not found
      return { statusCode: HttpStatus.NOT_FOUND, code: 'NOT_FOUND', message: 'Not found' };
    default:
      return undefined;
  }
}

function defaultCode(statusCode: number): string {
  const name: unknown = HttpStatus[statusCode];
  return typeof name === 'string' ? name : 'ERROR';
}

function toFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    fieldErrors[path] ??= issue.message; // first message per field is enough for a form
  }
  return fieldErrors;
}
