import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PetsModule } from '../pets/pets.module';
import { StorageModule } from '../storage/storage.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [PetsModule, MailModule, StorageModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
