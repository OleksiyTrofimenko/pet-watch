import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { PetAccessService } from './pet-access.service';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [StorageModule],
  controllers: [PetsController],
  providers: [PetsService, PetAccessService],
  // Care tasks and invitations check access through the same service.
  exports: [PetAccessService],
})
export class PetsModule {}
