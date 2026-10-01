import { createZodDto } from 'nestjs-zod';
import {
  confirmPhotoSchema,
  createPetSchema,
  photoUploadRequestSchema,
  updatePetSchema,
} from '@petwatch/shared';

export class CreatePetDto extends createZodDto(createPetSchema) {}
export class UpdatePetDto extends createZodDto(updatePetSchema) {}
export class PhotoUploadRequestDto extends createZodDto(photoUploadRequestSchema) {}
export class ConfirmPhotoDto extends createZodDto(confirmPhotoSchema) {}
