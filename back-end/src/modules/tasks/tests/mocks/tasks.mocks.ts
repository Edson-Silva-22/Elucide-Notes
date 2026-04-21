import { INestApplication } from "@nestjs/common";
import { CreateTaskDto } from "../../dto/create-task.dto";
import { UpdateTaskDto } from "../../dto/update-task.dto";
import request from "supertest";
import { Task, TaskStatus } from "../../entities/task.entity";
import { ListProjectDto } from "src/modules/projects/dto/list-project.dto";
import { Types } from "mongoose";

export const mockTaskModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  exec: jest.fn(),
};

export const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

export const mockTask: Task = {
  code: 1,
  title: 'Test Task',
  description: { text: 'Test description' },
  status: TaskStatus.NOT_STARTED,
  tags: ['tag1'],
  projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
};

export const mockTaskList: Task[] = [
  { ...mockTask, _id: new Types.ObjectId('507f1f77bcf86cd799439011') } as Task,
  { ...mockTask, code: 2, _id: new Types.ObjectId('607f1f77bcf86cd799439012') } as Task,
];

export const mockCreateTaskDto: CreateTaskDto = {
  title: 'Test Task',
  description: {
    content: 'This is a test task',
    format: 'markdown'
  },
  tags: ['taskId-1', 'taskId-2']
};

export const mockUpdateTaskDto: UpdateTaskDto = {
  title: 'Updated Task',
  description: {
    content: 'This is an updated task',
    format: 'markdown'
  },
  tags: ['updated-tag-1']
};

export const mockListProjectDto: ListProjectDto = {
  page: 1,
  limit: 10,
  keyword: undefined,
};

export const mockId = '507f1f77bcf86cd799439011';
export const mockProjectId = '607f1f77bcf86cd799439011';

export async function createTestTask(
  app: INestApplication, 
  createTaskDto: CreateTaskDto,
  jwtToken: string,
  projectId: string
): Promise<Task & { _id: string, createdAt: Date, updatedAt: Date }> {
  const response = await request(app.getHttpServer())
    .post(`/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createTaskDto)
    .expect(201);

  expect(response.body).toMatchObject(createTaskDto);

  return response.body;
} 