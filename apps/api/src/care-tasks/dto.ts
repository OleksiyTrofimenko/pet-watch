import { createZodDto } from 'nestjs-zod';
import { careTaskSchema } from '@petwatch/shared';

export class CareTaskDtoIn extends createZodDto(careTaskSchema) {}
