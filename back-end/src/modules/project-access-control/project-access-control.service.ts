import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectAccessControlDto } from './dto/create-project-access-control.dto';
import { UpdateProjectAccessControlDto } from './dto/update-project-access-control.dto';
import { handleError } from '../../utils/methods/handleError';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectAccessControl } from './entities/project-access-control.entity';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class ProjectAccessControlService {
  constructor(
    @InjectModel(ProjectAccessControl.name)
    private projectAccessControlModel: Model<ProjectAccessControl>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Project.name)
    private projectModel: Model<Project>,
  ) {}

  async userAndProjectExists(userId: string, projectId: string) {
    try {
      const [user, project] = await Promise.all([
        this.userModel.exists({ _id: userId }),
        this.projectModel.exists({ _id: projectId }),
      ]);

      if (!user) throw new NotFoundException('Usuário não encontrado.');
      if (!project) throw new NotFoundException('Projeto não encontrado.');
    } catch (error) {
      handleError(error);
    }
  }

  async checkUserAccess(projectId: string, userId: string) {
    try {
      await this.userAndProjectExists(userId, projectId);

      const hasAccess = await this.projectAccessControlModel.exists({
        projectId,
        userId,
        status: 'active',
      });

      if (!hasAccess) throw new NotFoundException('Acesso negado para este projeto.');

      return hasAccess;
    } catch (error) {
      handleError(error);
    }
  }

  async isOwnerAccessControl(projectId: string, authUserId: string) {
    try {
      const isOwner = await this.projectAccessControlModel.exists({
        projectId,
        userId: authUserId,
        role: 'owner',
        status: 'active',
      });

      if (!isOwner) throw new NotFoundException('Usuário não é dono do projeto.');
    } catch (error) {
      handleError(error);
    }
  }

  async createOwnerAccessControl(createProjectAccessControlDto: CreateProjectAccessControlDto) {
    try {
      return await this.projectAccessControlModel.create(createProjectAccessControlDto)
    } catch (error) {
      handleError(error);
    }
  }

  async create(createProjectAccessControlDto: CreateProjectAccessControlDto, authUserId: string) {
    try {
      await Promise.all([
        this.userAndProjectExists(createProjectAccessControlDto.userId, createProjectAccessControlDto.projectId),
        this.isOwnerAccessControl(createProjectAccessControlDto.projectId, authUserId)
      ])

      const findProjectAccessControl = await this.projectAccessControlModel.exists({
        projectId: createProjectAccessControlDto.projectId,
        userId: createProjectAccessControlDto.userId,
      })
      
      if (findProjectAccessControl) throw new NotFoundException('Controle de acesso para este usuário e projeto já existe.')

      const createdProjectAccessControl = await this.projectAccessControlModel.create(createProjectAccessControlDto)

      return createdProjectAccessControl
    } catch (error) {
      handleError(error)
    }
  }

  async findAll() {
    try {
      
    } catch (error) {
      handleError(error)
    }
  }

  async findOne(id: number) {
    try {
      
    } catch (error) {
      handleError(error)
    }
  }

  async update(id: number, updateProjectAccessControlDto: UpdateProjectAccessControlDto) {
    try {
      
    } catch (error) {
      handleError(error)
    }
  }

  async remove(id: number) {
    try {
      
    } catch (error) {
      handleError(error)
    }
  }
}
