import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import type { CareTaskDto, ScheduleTaskDto } from '@petwatch/shared';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CareTasksService } from './care-tasks.service';
import { CareTaskDtoIn } from './dto';

@Controller()
export class CareTasksController {
  constructor(private readonly tasks: CareTasksService) {}

  @Get('care-tasks')
  schedule(@CurrentUser() user: AuthUser): Promise<ScheduleTaskDto[]> {
    return this.tasks.schedule(user.id);
  }

  @Get('pets/:petId/care-tasks')
  list(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<CareTaskDto[]> {
    return this.tasks.listForPet(user.id, petId);
  }

  @Post('pets/:petId/care-tasks')
  create(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Body() dto: CareTaskDtoIn,
  ): Promise<CareTaskDto> {
    return this.tasks.create(user.id, petId, dto);
  }

  @Put('pets/:petId/care-tasks/:taskId')
  replace(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CareTaskDtoIn,
  ): Promise<CareTaskDto> {
    return this.tasks.replace(user.id, petId, taskId, dto);
  }

  @Delete('pets/:petId/care-tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ): Promise<void> {
    return this.tasks.remove(user.id, petId, taskId);
  }
}
