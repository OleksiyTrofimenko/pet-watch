import { createZodDto } from 'nestjs-zod';
import { createInvitationSchema } from '@petwatch/shared';

export class CreateInvitationDto extends createZodDto(createInvitationSchema) {}
