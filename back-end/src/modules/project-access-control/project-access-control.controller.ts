import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectAccessControlService } from './project-access-control.service';
import { CreateProjectAccessControlDto } from './dto/create-project-access-control.dto';
import { UpdateProjectAccessControlDto } from './dto/update-project-access-control.dto';
import * as authUserDecorator from '../../utils/decorators/auth-user.decorator';

@Controller('project-access-control')
export class ProjectAccessControlController {
  constructor(private readonly projectAccessControlService: ProjectAccessControlService) {}

  @Post()
  create(@Body() createProjectAccessControlDto: CreateProjectAccessControlDto, @authUserDecorator.AuthUser() authUser: authUserDecorator.AuthUserType) {
    return this.projectAccessControlService.create(createProjectAccessControlDto, authUser.sub);
  }

  @Get()
  findAll() {
    return this.projectAccessControlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectAccessControlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectAccessControlDto: UpdateProjectAccessControlDto) {
    return this.projectAccessControlService.update(+id, updateProjectAccessControlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectAccessControlService.remove(+id);
  }
}
