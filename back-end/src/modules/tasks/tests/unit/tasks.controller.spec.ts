import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { TasksController } from '../../tasks.controller';
import { TasksService } from '../../tasks.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { ProjectAccessControlGuard } from '../../../project-access-control/project-access-control.guard';
import { mockCreateTaskDto, mockId, mockListProjectDto, mockProjectId, mockService, mockTask, mockUpdateTaskDto } from '../mocks/tasks.mocks';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(ProjectAccessControlGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create with projectId and createTaskDto', async () => {
      mockService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockProjectId, mockCreateTaskDto);

      expect(mockService.create).toHaveBeenCalledTimes(1);
      expect(mockService.create).toHaveBeenCalledWith(mockProjectId, mockCreateTaskDto);
      expect(result).toEqual(mockTask);
    });

    it('should propagate internal error', async () => {
      mockService.create.mockRejectedValue(new InternalServerErrorException('Erro interno'));

      await expect(controller.create(mockProjectId, mockCreateTaskDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with projectId and pagination params', async () => {
      const paginatedResult = {
        total: 1,
        data: [mockTask],
        page: 1,
        limit: 10,
      };
      mockService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockProjectId, mockListProjectDto);

      expect(mockService.findAll).toHaveBeenCalledTimes(1);
      expect(mockService.findAll).toHaveBeenCalledWith(mockProjectId, mockListProjectDto);
      expect(result).toEqual(paginatedResult);
    });

    it('should return structure with total, data, page, limit', async () => {
      const paginatedResult = {
        total: 2,
        data: [mockTask, mockTask],
        page: 2,
        limit: 5,
      };
      mockService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockProjectId, { page: 2, limit: 5 });

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('should propagate internal error', async () => {
      mockService.findAll.mockRejectedValue(new InternalServerErrorException('Erro interno'));

      await expect(controller.findAll(mockProjectId, mockListProjectDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with taskId', async () => {
      mockService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(mockId);

      expect(mockService.findOne).toHaveBeenCalledTimes(1);
      expect(mockService.findOne).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockTask);
    });

    it('should propagate NotFoundException when task not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('Tarefa não encontrada'));

      await expect(controller.findOne(mockId)).rejects.toThrow(NotFoundException);
    });

    it('should propagate internal error', async () => {
      mockService.findOne.mockRejectedValue(new InternalServerErrorException('Erro interno'));

      await expect(controller.findOne(mockId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should call service.update with id and updateTaskDto', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Task' };
      mockService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockId, mockUpdateTaskDto);

      expect(mockService.update).toHaveBeenCalledTimes(1);
      expect(mockService.update).toHaveBeenCalledWith(mockId, mockUpdateTaskDto);
      expect(result).toEqual(updatedTask);
    });

    it('should propagate NotFoundException when task not found', async () => {
      mockService.update.mockRejectedValue(new NotFoundException('Tarefa não encontrada'));

      await expect(controller.update(mockId, mockUpdateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate internal error', async () => {
      mockService.update.mockRejectedValue(new InternalServerErrorException('Erro interno'));

      await expect(controller.update(mockId, mockUpdateTaskDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and return success message', async () => {
      mockService.remove.mockResolvedValue('Task deletada com sucesso');

      const result = await controller.remove(mockId);

      expect(mockService.remove).toHaveBeenCalledTimes(1);
      expect(mockService.remove).toHaveBeenCalledWith(mockId);
      expect(result).toBe('Task deletada com sucesso');
    });

    it('should propagate NotFoundException when task not found', async () => {
      mockService.remove.mockRejectedValue(new NotFoundException('Tarefa não encontrada'));

      await expect(controller.remove(mockId)).rejects.toThrow(NotFoundException);
    });

    it('should propagate internal error', async () => {
      mockService.remove.mockRejectedValue(new InternalServerErrorException('Erro interno'));

      await expect(controller.remove(mockId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});