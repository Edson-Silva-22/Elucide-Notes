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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { ListTagDto } from './dto/list-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectAccessControlGuard } from '../project-access-control/project-access-control.guard';

@Controller('projects/:id/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async create(@Param('id') projectId: string, @Body() createTagDto: CreateTagDto) {
    return await this.tagsService.create(projectId, createTagDto);
  }

  @Get()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findAll(@Param('id') projectId: string, @Query() listTagDto: ListTagDto) {
    return await this.tagsService.findAll(projectId, listTagDto);
  }

  @Get(':tagId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findOne(@Param('tagId') id: string) {
    return await this.tagsService.findOne(id);
  }

  @Put(':tagId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async update(@Param('tagId') id: string, @Body() updateTagDto: UpdateTagDto) {
    return await this.tagsService.update(id, updateTagDto);
  }

  @Delete(':tagId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async remove(@Param('tagId') id: string) {
    return await this.tagsService.remove(id);
  }
}
