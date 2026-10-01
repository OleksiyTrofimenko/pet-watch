import { Module } from '@nestjs/common';
import { PetsModule } from '../pets/pets.module';
import { CareTasksController } from './care-tasks.controller';
import { CareTasksService } from './care-tasks.service';

@Module({
  imports: [PetsModule],
  controllers: [CareTasksController],
  providers: [CareTasksService],
})
export class CareTasksModule {}
