import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListProjectDto } from '../projects/dto/list-project.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectAccessControlGuard } from '../project-access-control/project-access-control.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('projects/:id/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async create(@Param('id') projectId: string, @Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.create(projectId, createTaskDto);
  }

  @Get()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findAll(@Param('id') projectId: string, @Query() listTaskDto: ListProjectDto) {
    return await this.tasksService.findAll(projectId, listTaskDto);
  }

  @Get(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findOne(@Param('taskId') id: string) {
    return await this.tasksService.findOne(id);
  }

  @Put(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async update(@Param('taskId') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async remove(@Param('taskId') id: string) {
    return await this.tasksService.remove(id);
  }
}
