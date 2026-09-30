import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { careTaskSchema } from '@petwatch/shared';
import { Prisma } from '../../generated/prisma/client';
import { toApiErrorBody } from './api-exception.filter';

describe('toApiErrorBody', () => {
  it('turns Zod validation errors into fieldErrors keyed by path', () => {
    const result = careTaskSchema.safeParse({
      type: 'WALK',
      title: '',
      timeOfDay: 600,
      recurrence: 'WEEKLY',
      daysOfWeek: [],
    });
    if (result.success) throw new Error('expected validation to fail');

    const body = toApiErrorBody(new ZodValidationException(result.error));

    expect(body).toEqual({
      statusCode: 400,
      code: 'VALIDATION_FAILED',
      message: 'Some fields are invalid',
      fieldErrors: {
        title: 'Title is required',
        daysOfWeek: 'Pick at least one day for a weekly task',
      },
    });
  });

  it('keeps domain codes thrown by services', () => {
    const body = toApiErrorBody(
      new ConflictException({ code: 'EMAIL_TAKEN', message: 'Email already registered' }),
    );
    expect(body).toEqual({
      statusCode: 409,
      code: 'EMAIL_TAKEN',
      message: 'Email already registered',
    });
  });

  it('falls back to the HTTP status name as code', () => {
    expect(toApiErrorBody(new ForbiddenException()).code).toBe('FORBIDDEN');
    expect(toApiErrorBody(new NotFoundException('Pet not found'))).toMatchObject({
      statusCode: 404,
      message: 'Pet not found',
    });
  });

  it('maps a unique-constraint race to 409 without leaking SQL', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed on email', {
      code: 'P2002',
      clientVersion: 'test',
    });
    expect(toApiErrorBody(error)).toEqual({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'This already exists',
    });
  });

  it('hides unexpected errors behind a generic 500', () => {
    expect(toApiErrorBody(new Error('connection refused at 10.0.0.3'))).toEqual({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    });
  });
});
