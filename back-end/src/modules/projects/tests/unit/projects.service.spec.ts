import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../../projects.service';
import { Model } from 'mongoose';
import { Project } from '../../entities/project.entity';
import { getModelToken } from '@nestjs/mongoose';
import { createProjectDtoMock, mockProjectAccessControlModel, mockProjectAccessControlService, mockProjectModel, projectMock, updateProjectDtoMock } from '../mocks/projects.mocks';
import { ProjectAccessControlService } from '../../../project-access-control/project-access-control.service';
import { ProjectAccessControl, ProjectsAccessControlStatus } from '../../../project-access-control/entities/project-access-control.entity';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let projectAccessControlService: ProjectAccessControlService;
  let projectModel: Model<Project>;
  let projectAccessControlModel: Model<ProjectAccessControl>;

  beforeEach( async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: ProjectAccessControlService,
          useValue: mockProjectAccessControlService
        },
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel
        },
        {
          provide: getModelToken(ProjectAccessControl.name),
          useValue: mockProjectAccessControlModel
        }
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
    projectAccessControlService = module.get<ProjectAccessControlService>(ProjectAccessControlService);
    projectModel = module.get<Model<Project>>(getModelToken(Project.name));
    projectAccessControlModel = module.get<Model<ProjectAccessControl>>(getModelToken(ProjectAccessControl.name));
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(projectsService).toBeDefined();
  });

  describe('Create Method', () => {
    it('should create a new project', async () => {
      (projectModel.create as jest.Mock).mockResolvedValue(projectMock);

      (projectAccessControlService.createOwnerAccessControl as jest.Mock).mockResolvedValue({
        projectId: projectMock._id,
        userId: 'authUserId',
        role: 'owner',
        status: 'active'
      })

      const result = await projectsService.create(createProjectDtoMock, 'authUserId')

      expect(projectModel.create).toHaveBeenCalledTimes(1)
      expect(projectModel.create).toHaveBeenCalledWith(createProjectDtoMock)

      expect(projectAccessControlService.createOwnerAccessControl).toHaveBeenCalledTimes(1)
      expect(projectAccessControlService.createOwnerAccessControl).toHaveBeenCalledWith({
        projectId: projectMock._id.toString(),
        userId: 'authUserId',
        role: 'owner',
        status: 'active'
      })

      expect(result).toEqual(projectMock)
    })

    it('should handle internal server error', async () => {
      (projectModel.create as jest.Mock).mockResolvedValue(projectMock);

      (projectAccessControlService.createOwnerAccessControl as jest.Mock).mockRejectedValue(new InternalServerErrorException('Database error'))

      await expect(projectsService.create(createProjectDtoMock, 'authUserId')).rejects.toThrow(InternalServerErrorException)

      expect(projectModel.create).toHaveBeenCalledTimes(1)
      expect(projectModel.create).toHaveBeenCalledWith(createProjectDtoMock)

      expect(projectAccessControlService.createOwnerAccessControl).toHaveBeenCalledTimes(1)
      expect(projectAccessControlService.createOwnerAccessControl).toHaveBeenCalledWith({
        projectId: projectMock._id.toString(),
        userId: 'authUserId',
        role: 'owner',
        status: 'active'
      })
    })
  })

  describe('FindAll Method', () => {
    it('should return a list of projects for user with access', async () => {
      (projectAccessControlModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ projectId: '1' }]),
      });

      (projectModel.countDocuments as jest.Mock).mockResolvedValue(1);

      (projectModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([projectMock])
      })

      const result = await projectsService.findAll({ page: 1, limit: 10 }, 'authUserId')

      expect(projectAccessControlModel.find).toHaveBeenCalledTimes(1)
      expect(projectAccessControlModel.find).toHaveBeenCalledWith({ userId: 'authUserId', status: ProjectsAccessControlStatus.ACTIVE })

      expect(projectModel.countDocuments).toHaveBeenCalledTimes(1)
      expect(projectModel.countDocuments).toHaveBeenCalledWith({ _id: { $in: ['1'] } })

      expect(projectModel.find).toHaveBeenCalledTimes(1)
      expect(projectModel.find).toHaveBeenCalledWith({ _id: { $in: ['1'] } })

      expect(result).toEqual({
        total: 1,
        data: [projectMock],
        page: 1,
        limit: 10
      })
    })

    it('should return all projects with pagination, sorting and filtering', async () => {
      (projectAccessControlModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ projectId: '1' }]),
      });

      (projectModel.countDocuments as jest.Mock).mockResolvedValue(1);

      (projectModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([projectMock])
      })

      const result = await projectsService.findAll({ page: 1, limit: 10, keyword: 'Teste', sortBy: 'createdAt', sortOrder: -1 }, 'authUserId')

      expect(projectAccessControlModel.find).toHaveBeenCalledTimes(1)
      expect(projectAccessControlModel.find).toHaveBeenCalledWith({ userId: 'authUserId', status: ProjectsAccessControlStatus.ACTIVE })

      expect(projectModel.countDocuments).toHaveBeenCalledTimes(1)
      expect(projectModel.countDocuments).toHaveBeenCalledWith({ _id: { $in: ['1'] }, title: expect.any(RegExp) })

      expect(projectModel.find).toHaveBeenCalledTimes(1)
      expect(projectModel.find).toHaveBeenCalledWith({ _id: { $in: ['1'] }, title: expect.any(RegExp) })

      expect(result).toEqual({
        total: 1,
        data: [projectMock],
        page: 1,
        limit: 10
      })
    })

    it('should return all projects for admin user', async () => {
      (projectModel.countDocuments as jest.Mock).mockResolvedValue(1);

      (projectModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([projectMock])
      })

      const result = await projectsService.findAll({ page: 1, limit: 10 })

      expect(projectModel.countDocuments).toHaveBeenCalledTimes(1)
      expect(projectModel.countDocuments).toHaveBeenCalledWith({})

      expect(projectModel.find).toHaveBeenCalledTimes(1)
      expect(projectModel.find).toHaveBeenCalledWith({})

      expect(result).toEqual({
        total: 1,
        data: [projectMock],
        page: 1,
        limit: 10
      })
    })

    it('should handle internal server error', async () => {
      (projectAccessControlModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ projectId: '1' }]),
      });

      (projectModel.countDocuments as jest.Mock).mockResolvedValue(1);

      (projectModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new InternalServerErrorException('Database error'))
      })

      await expect(projectsService.findAll({ page: 1, limit: 10 }, 'authUserId')).rejects.toThrow(InternalServerErrorException)

      expect(projectAccessControlModel.find).toHaveBeenCalledTimes(1)
      expect(projectAccessControlModel.find).toHaveBeenCalledWith({ userId: 'authUserId', status: ProjectsAccessControlStatus.ACTIVE })

      expect(projectModel.countDocuments).toHaveBeenCalledTimes(1)
      expect(projectModel.countDocuments).toHaveBeenCalledWith({ _id: { $in: ['1'] } })

      expect(projectModel.find).toHaveBeenCalledTimes(1)
      expect(projectModel.find).toHaveBeenCalledWith({ _id: { $in: ['1'] } })
    })
  })

  describe('FindOne Method', () => {
      it('should return a project by id if user has access', async () => {
        (projectModel.findById as jest.Mock).mockReturnValue({
          exec: jest.fn().mockResolvedValue(projectMock)
        })

        const result = await projectsService.findOne('1')

        expect(projectModel.findById).toHaveBeenCalledTimes(1)
        expect(projectModel.findById).toHaveBeenCalledWith('1')

        expect(result).toEqual(projectMock)
      })

      it('should error if project not found', async () => {
        (projectModel.findById as jest.Mock).mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })

        await expect(projectsService.findOne('1')).rejects.toThrow(NotFoundException)
        
        expect(projectModel.findById).toHaveBeenCalledTimes(1)
        expect(projectModel.findById).toHaveBeenCalledWith('1')
      })

      it('should handle internal server error', async () => {
        (projectModel.findById as jest.Mock).mockReturnValue({
          exec: jest.fn().mockRejectedValue(new InternalServerErrorException('Database error'))
        })

        await expect(projectsService.findOne('1')).rejects.toThrow(InternalServerErrorException)
        
        expect(projectModel.findById).toHaveBeenCalledTimes(1)
        expect(projectModel.findById).toHaveBeenCalledWith('1')
      })
  })

  describe('Update Method', () => {
    it('should update a project', async () => {
      (projectModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(projectMock)
      })

      const result = await projectsService.update('1', updateProjectDtoMock)

      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateProjectDtoMock, { new: true })

      expect(result).toEqual(projectMock)
    })

    it('should error if project not found', async () => {
      (projectModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(projectsService.update('1', updateProjectDtoMock)).rejects.toThrow(NotFoundException)
      
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateProjectDtoMock, { new: true })
    })

    it('should handle internal server error', async () => {
      (projectModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new InternalServerErrorException('Database error'))
      })

      await expect(projectsService.update('1', updateProjectDtoMock)).rejects.toThrow(InternalServerErrorException)
      
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateProjectDtoMock, { new: true })
    })
  })

  describe('Remove Method', () => {
    it('should delete a project', async () => {
      (projectModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(projectMock)
      })

      const result = await projectsService.remove('1')

      expect(projectModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('1')

      expect(result).toEqual('Projeto deletado com sucesso.')
    })

    it('should error if project not found', async () => {
      (projectModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(projectsService.remove('1')).rejects.toThrow(NotFoundException)
      
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('1')
    })

    it('should handle internal server error', async () => {
      (projectModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new InternalServerErrorException('Database error'))
      })

      await expect(projectsService.remove('1')).rejects.toThrow(InternalServerErrorException)
      
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith('1')
    })
  })
});
