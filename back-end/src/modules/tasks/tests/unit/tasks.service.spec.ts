import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TasksService } from '../../tasks.service';
import { Task } from '../../entities/task.entity';
import {
  mockTaskModel,
  mockTask,
  mockTaskList,
  mockCreateTaskDto,
  mockUpdateTaskDto,
  mockListProjectDto,
  mockId,
  mockProjectId,
} from '../mocks/tasks.mocks';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create task with incremental code when tasks exist', async () => {
      mockTaskModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTask),
        }),
      });
      mockTaskModel.create.mockResolvedValue(mockTask);

      const result = await service.create(mockProjectId, mockCreateTaskDto);

      expect(mockTaskModel.findOne).toHaveBeenCalledWith();
      expect(mockTaskModel.findOne().sort).toHaveBeenCalledWith({ code: -1 });
      expect(mockTaskModel.findOne().sort().exec).toHaveBeenCalled();
      expect(mockTaskModel.create).toHaveBeenCalledWith({
        ...mockCreateTaskDto,
        code: mockTask.code + 1,
        projectId: expect.any(Object),
      });
      expect(result).toEqual(mockTask);
    });

    it('should create task with code 1 when no tasks exist', async () => {
      mockTaskModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      mockTaskModel.create.mockResolvedValue({ ...mockTask, code: 1 });

      const result = await service.create(mockProjectId, {
        ...mockCreateTaskDto,
      });

      expect(mockTaskModel.findOne).toHaveBeenCalled();
      expect(result!.code).toBe(1);
    });

    it('should convert projectId to ObjectId', async () => {
      mockTaskModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      mockTaskModel.create.mockResolvedValue(mockTask);

      await service.create(mockProjectId, mockCreateTaskDto);

      const createCall = mockTaskModel.create.mock.calls[0][0];
      expect(createCall.projectId).toBeInstanceOf(
        mockTask.projectId.constructor,
      );
    });

    it('should handle internal error', async () => {
      mockTaskModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(
        service.create(mockProjectId, mockCreateTaskDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks filtered by projectId', async () => {
      mockTaskModel.countDocuments.mockResolvedValue(2);
      mockTaskModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTaskList),
          }),
        }),
      });

      const result = await service.findAll(mockProjectId, mockListProjectDto);

      expect(mockTaskModel.countDocuments).toHaveBeenCalledWith({
        projectId: expect.any(Object),
      });
      expect(mockTaskModel.find).toHaveBeenCalledWith({
        projectId: expect.any(Object),
      });
      expect(result).toEqual({
        total: 2,
        data: mockTaskList,
        page: 1,
        limit: 10,
      });
    });

    it('should apply pagination correctly', async () => {
      mockTaskModel.countDocuments.mockResolvedValue(2);
      mockTaskModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockTaskList),
          }),
        }),
      });

      await service.findAll(mockProjectId, { page: 2, limit: 5 });

      expect(mockTaskModel.find).toHaveBeenCalledWith({
        projectId: expect.any(Object),
      });
      expect(mockTaskModel.find({} as any).skip).toHaveBeenCalledWith(5);
      expect(mockTaskModel.find({} as any).skip(5).limit).toHaveBeenCalledWith(
        5,
      );
    });

    it('should apply search by keyword in title and description', async () => {
      mockTaskModel.countDocuments.mockResolvedValue(1);
      mockTaskModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockTask]),
          }),
        }),
      });

      const result = await service.findAll(mockProjectId, {
        ...mockListProjectDto,
        keyword: 'test',
      });

      expect(mockTaskModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        }),
      );
      expect(mockTaskModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
        }),
      );
      expect(result).toEqual({
        total: 1,
        data: [mockTask],
        page: 1,
        limit: 10,
      });
    });

    it('should use default pagination values', async () => {
      mockTaskModel.countDocuments.mockResolvedValue(0);
      mockTaskModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.findAll(mockProjectId, {});

      expect(result!.page).toBe(1);
      expect(result!.limit).toBe(10);
    });

    it('should handle internal error', async () => {
      mockTaskModel.countDocuments.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.findAll(mockProjectId, mockListProjectDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return task when found', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.findOne(mockId);

      expect(mockTaskModel.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(mockId)).rejects.toThrow(NotFoundException);
    });

    it('should handle internal error', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.findOne(mockId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update and return task', async () => {
      const updatedTask = { ...mockTask, title: 'Updated' };
      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTask),
      });

      const result = await service.update(mockId, mockUpdateTaskDto);

      expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        mockUpdateTaskDto,
        { new: true },
      );
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(mockId, mockUpdateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle internal error', async () => {
      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.update(mockId, mockUpdateTaskDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete task and return success message', async () => {
      mockTaskModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.remove(mockId);

      expect(mockTaskModel.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      expect(result).toBe('Task deletada com sucesso');
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTaskModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(mockId)).rejects.toThrow(NotFoundException);
    });

    it('should handle internal error', async () => {
      mockTaskModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.remove(mockId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
