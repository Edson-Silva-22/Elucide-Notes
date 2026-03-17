import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectDto } from './dto/list-project.dto';
import * as authUserDecorator from '../../utils/decorators/auth-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectAccessControlGuard } from '../project-access-control/project-access-control.guard';
import { AuthorizationGuard } from '../authorization/guard/authorization.guard';
import { Roles } from '../authorization/decorator/roles.decorator';
import { SystemRole } from '../users/entities/user.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('my-projects')
  @UseGuards(AuthGuard)
  async myProjects(@Query() listProjectDto: ListProjectDto, @authUserDecorator.AuthUser() authUser: authUserDecorator.AuthUserType) {
    return await this.projectsService.findAll(listProjectDto, authUser.sub);
  }

  @Get('my-projects/:id')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async myProject(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createProjectDto: CreateProjectDto, @authUserDecorator.AuthUser() authUser: authUserDecorator.AuthUserType) {
    return await this.projectsService.create(createProjectDto, authUser.sub);
  }

  @Get()
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Roles(SystemRole.ADMIN)
  async findAll(@Query() listProjectDto: ListProjectDto) {
    return await this.projectsService.findAll(listProjectDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Roles(SystemRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return await this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async remove(@Param('id') id: string) {
    return await this.projectsService.remove(id);
  }
}
