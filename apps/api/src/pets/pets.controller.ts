import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import type { PetDto, PhotoUploadTicket } from '@petwatch/shared';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ConfirmPhotoDto, CreatePetDto, PhotoUploadRequestDto, UpdatePetDto } from './dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly pets: PetsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<PetDto[]> {
    return this.pets.list(user.id);
  }

  @Get(':petId')
  get(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<PetDto> {
    return this.pets.get(user.id, petId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePetDto): Promise<PetDto> {
    return this.pets.create(user.id, dto);
  }

  @Patch(':petId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: UpdatePetDto,
  ): Promise<PetDto> {
    return this.pets.update(user.id, petId, dto);
  }

  @Delete(':petId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<void> {
    return this.pets.remove(user.id, petId);
  }

  /** Step 1 of an upload: a presigned PUT for a server-chosen key. */
  @Post(':petId/photo-upload-url')
  createPhotoUpload(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: PhotoUploadRequestDto,
  ): Promise<PhotoUploadTicket> {
    return this.pets.createPhotoUpload(user.id, petId, dto);
  }

  /** Step 3 (after the device PUT the file to S3): attach it to the pet. */
  @Put(':petId/photo')
  confirmPhoto(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: ConfirmPhotoDto,
  ): Promise<PetDto> {
    return this.pets.confirmPhoto(user.id, petId, dto);
  }

  @Delete(':petId/photo')
  removePhoto(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<PetDto> {
    return this.pets.removePhoto(user.id, petId);
  }
}
