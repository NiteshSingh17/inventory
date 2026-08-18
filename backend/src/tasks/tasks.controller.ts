import { Controller, Post, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { TasksService } from './tasks.service';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('process')
  @Roles(UserRole.ADMIN)
  async processAll() {
    return this.tasksService.processTasks();
  }

  @Post('retry/:id')
  @Roles(UserRole.ADMIN)
  async retry(@Param('id') id: string) {
    return this.tasksService.retryTask(id);
  }
}
