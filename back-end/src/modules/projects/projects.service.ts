import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { handleError } from '../../utils/methods/handleError';
import { ListProjectDto } from './dto/list-project.dto';
import { buildSearchRegex } from '../../utils/methods/build-search-regex';
import { ProjectAccessControlService } from '../project-access-control/project-access-control.service';
import { ProjectAccessControl, ProjectsAccessControlStatus } from '../project-access-control/entities/project-access-control.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
    @InjectModel(ProjectAccessControl.name)
    private projectAccessControlModel: Model<ProjectAccessControl>,
    private projectAccessControlService: ProjectAccessControlService
  ) {}

  async create(createProjectDto: CreateProjectDto, authUserId: string) {
    try {
      const createdProject = await this.projectModel.create(createProjectDto)

      await this.projectAccessControlService.createOwnerAccessControl(
        {
          projectId: createdProject._id.toString(),
          userId: authUserId,
          role: 'owner',
          status: ProjectsAccessControlStatus.ACTIVE
        }
      )
      
      return createdProject
    } catch (error) {
      handleError(error)
    }
  }

  async findAll(listProjectDto: ListProjectDto, authUserId?: string) {
    try {
      const page = Number(listProjectDto.page) || 1;
      const limit = Number(listProjectDto.limit) || 10;
      const sortBy = listProjectDto.sortBy || 'createdAt';
      const sortOrder = Number(listProjectDto.sortOrder) || -1;
      const query = { }

      if (authUserId) {
        const accessControls = await this.projectAccessControlModel
        .find({ userId: authUserId, status: ProjectsAccessControlStatus.ACTIVE })
        .select('projectId')
        .lean();
        const projectIds = accessControls.map(ac => ac.projectId);

        query['_id'] = { $in: projectIds }
      }

      if (listProjectDto.keyword) {
        const regex = buildSearchRegex(listProjectDto.keyword)
        query['title'] = regex
      }

      const countDocs = await this.projectModel.countDocuments(query)
      const projects = await this.projectModel
        .find(query)
        .sort({ [sortBy]: sortOrder == 1 ? 'asc' : 'desc' })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec()

      return {
        total: countDocs,
        data: projects,
        page,
        limit
      }
    } catch (error) {
      handleError(error)
    }
  }

  async findOne(id: string) {
    try {
      const project = await this.projectModel.findById(id).exec()

      if (!project) throw new NotFoundException('Projeto não encontrado.')

      return project
    } catch (error) {
      handleError(error)
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    try {
      const updatedProject = await this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true }).exec()

      if (!updatedProject) throw new NotFoundException('Projeto não encontrado.')

      return updatedProject
    } catch (error) {
      handleError(error)
    }
  }

  async remove(id: string) {
    try {
      const deletedProject = await this.projectModel.findByIdAndDelete(id).exec()

      if (!deletedProject) throw new NotFoundException('Projeto não encontrado.')

      return 'Projeto deletado com sucesso.'
    } catch (error) {
      handleError(error)
    }
  }
}
