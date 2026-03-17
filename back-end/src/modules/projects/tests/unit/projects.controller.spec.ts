import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '../../projects.controller';
import { ProjectsService } from '../../projects.service';
import { createProjectDtoMock, mockProjectAccessControlService, mockProjectsService, projectMock } from '../mocks/projects.mocks';
import { AuthGuard } from '../../../auth/auth.guard';
import { AuthorizationGuard } from '../../../authorization/guard/authorization.guard';
import { ProjectAccessControlService } from '../../../project-access-control/project-access-control.service';
import { authUserMock } from '../../../users/tests/mocks/users.mocks';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;
  let projectAcessControlService: ProjectAccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService
        },
        {
          provide: ProjectAccessControlService,
          useValue: mockProjectAccessControlService
        }
      ],
    })
      .overrideGuard(AuthGuard) // inicializando o guard
      .useValue({ 
        canActivate: jest.fn().mockReturnValue(true)
      }) // simula acesso autorizado no guard
      .overrideGuard(AuthorizationGuard) // inicializando o guard
      .useValue({ 
        canActivate: jest.fn().mockReturnValue(true)
      }) // simula acesso autorizado no guard
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
    projectAcessControlService = module.get<ProjectAccessControlService>(ProjectAccessControlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(projectsService).toBeDefined();
    expect(projectAcessControlService).toBeDefined();
  });

  describe('Create Method', () => {
    it('should create a project and return it', async () => {
      (projectsService.create as jest.Mock).mockResolvedValueOnce(projectMock);

      const result = await controller.create(createProjectDtoMock, authUserMock);

      expect(projectsService.create).toHaveBeenCalledTimes(1);
      expect(projectsService.create).toHaveBeenCalledWith(createProjectDtoMock, authUserMock.sub);

      expect(result).toEqual(projectMock);
    })

    it('should handle internal server error', async () => {
      (projectsService.create as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));

      await expect(controller.create(createProjectDtoMock, authUserMock)).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.create).toHaveBeenCalledTimes(1);
      expect(projectsService.create).toHaveBeenCalledWith(createProjectDtoMock, authUserMock.sub);
    })
  })

  describe('FindAll Method', () => {
    it('should return an array of projects', async () => {
      (projectsService.findAll as jest.Mock).mockResolvedValueOnce({
        data: [projectMock],
        page: 1,
        limit: 10,
        total: 1
      });

      const result = await controller.findAll({page: 1, limit: 10});

      expect(projectsService.findAll).toHaveBeenCalledTimes(1);
      expect(projectsService.findAll).toHaveBeenCalledWith({page: 1, limit: 10});

      expect(result).toEqual({
        data: [projectMock],
        page: 1,
        limit: 10,
        total: 1
      });
    })

    it('should handle internal server error', async () => {
      (projectsService.findAll as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));

      await expect(controller.findAll({page: 1, limit: 10})).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.findAll).toHaveBeenCalledTimes(1);
      expect(projectsService.findAll).toHaveBeenCalledWith({page: 1, limit: 10});
    })
  })

  describe('FindOne Method', () => {
    it('should return a project by id', async () => {
      (projectsService.findOne as jest.Mock).mockResolvedValueOnce(projectMock);

      const result = await controller.findOne('1');

      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');

      expect(result).toEqual(projectMock);
    })

    it('should error if project not found', async () => {
      (projectsService.findOne as jest.Mock).mockRejectedValueOnce(new NotFoundException('Project not found'));

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);

      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');
    })

    it('should handle internal server error', async () => {
      (projectsService.findOne as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));

      await expect(controller.findOne('1')).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');
    })
  })

  describe('Update Method', () => {
    it('should update a project and return it', async () => {
      (projectsService.update as jest.Mock).mockResolvedValueOnce(projectMock);
      
      const result = await controller.update('1', createProjectDtoMock);

      expect(projectsService.update).toHaveBeenCalledTimes(1);
      expect(projectsService.update).toHaveBeenCalledWith('1', createProjectDtoMock);

      expect(result).toEqual(projectMock);
    })

    it('should error if project not found', async () => {
      (projectsService.update as jest.Mock).mockRejectedValueOnce(new NotFoundException('Project not found'));
      
      await expect(controller.update('1', createProjectDtoMock)).rejects.toThrow(NotFoundException);

      expect(projectsService.update).toHaveBeenCalledTimes(1);
      expect(projectsService.update).toHaveBeenCalledWith('1', createProjectDtoMock);
    })

    it('should handle internal server error', async () => {
      (projectsService.update as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));
      
      await expect(controller.update('1', createProjectDtoMock)).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.update).toHaveBeenCalledTimes(1);
      expect(projectsService.update).toHaveBeenCalledWith('1', createProjectDtoMock);
    })
  })

  describe('Remove Method', () => {
    it('should remove a project and return a message', async () => {
      (projectsService.remove as jest.Mock).mockResolvedValueOnce('Project deleted successfully');

      const result = await controller.remove('1');

      expect(projectsService.remove).toHaveBeenCalledTimes(1);
      expect(projectsService.remove).toHaveBeenCalledWith('1');

      expect(result).toEqual('Project deleted successfully');
    })

    it('should error if project not found', async () => {
      (projectsService.remove as jest.Mock).mockRejectedValueOnce(new NotFoundException('Project not found'));

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);

      expect(projectsService.remove).toHaveBeenCalledTimes(1);
      expect(projectsService.remove).toHaveBeenCalledWith('1');
    })

    it('should handle internal server error', async () => {
      (projectsService.remove as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));

      await expect(controller.remove('1')).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.remove).toHaveBeenCalledTimes(1)
      expect(projectsService.remove).toHaveBeenCalledWith('1');
    })
  })

  describe('MyProjects Method', () => {
    it('should return an array of projects', async () => {
      (projectsService.findAll as jest.Mock).mockResolvedValueOnce({
        data: [projectMock],
        page: 1,
        limit: 10,
        total: 1
      })

      const result = await controller.myProjects({page: 1, limit: 10}, authUserMock);

      expect(projectsService.findAll).toHaveBeenCalledTimes(1);
      expect(projectsService.findAll).toHaveBeenCalledWith({page: 1, limit: 10}, authUserMock.sub);

      expect(result).toEqual({
        data: [projectMock],
        page: 1,
        limit: 10,
        total: 1
      })
    })

    it('should handle internal server error', async () => {
      (projectsService.findAll as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Internal Server Error'));

      await expect(controller.myProjects({page: 1, limit: 10}, authUserMock)).rejects.toThrow(InternalServerErrorException);

      expect(projectsService.findAll).toHaveBeenCalledTimes(1);
      expect(projectsService.findAll).toHaveBeenCalledWith({page: 1, limit: 10}, authUserMock.sub);
    })
  })

  describe('MyProject Method', () => {
    it('should return a project by id', async () => {
      (projectsService.findOne as jest.Mock).mockResolvedValueOnce(projectMock);

      const result = await controller.myProject('1');

      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');

      expect(result).toEqual(projectMock);
    })

    it('should error if project not found', async () => {
      (projectsService.findOne as jest.Mock).mockRejectedValueOnce(new NotFoundException('Project not found'))

      await expect(controller.myProject('1')).rejects.toThrow(NotFoundException);
      
      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');
    })

    it('should handle internal server error', async () => {
      (projectsService.findOne as jest.Mock).mockRejectedValueOnce(new InternalServerErrorException('Database error'))

      await expect(controller.myProject('1')).rejects.toThrow(InternalServerErrorException);
      
      expect(projectsService.findOne).toHaveBeenCalledTimes(1);
      expect(projectsService.findOne).toHaveBeenCalledWith('1');
    })
  })
});
