import { INestApplication } from "@nestjs/common";
import { CreateTaskDto } from "../../dto/create-task.dto";
import { UpdateTaskDto } from "../../dto/update-task.dto";
import request from "supertest";
import { Task } from "../../entities/task.entity";

export const createTaskMockDto: CreateTaskDto = {
  title: 'Test Task',
  description: {
    content: 'This is a test task',
    format: 'markdown'
  },
  tags: ['taskId-1', 'taskId-2']
}

export const updateTaskMockDto: UpdateTaskDto = {
  title: 'Updated Task',
  description: {
    content: 'This is an updated task',
    format: 'markdown'
  },
  tags: ['updated-tag-1']
}

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