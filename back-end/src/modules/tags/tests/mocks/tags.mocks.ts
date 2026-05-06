import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { CreateTagDto } from "../../dto/create-tag.dto";
import { UpdateTagDto } from "../../dto/update-tag.dto";

export const mockTagModel = {
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

export const mockCreateTagDto: CreateTagDto = {
  title: 'Test Tag',
};

export const mockUpdateTagDto: UpdateTagDto = {
  title: 'Updated Tag',
};

export const mockCreateDuplicateTagDto: CreateTagDto = {
  title: 'Test Tag',
};

export async function createTestTag(
  app: INestApplication,
  createTagDto: CreateTagDto,
  jwtToken: string,
  projectId: string
): Promise<{ _id: string, title: string, projectId: string, createdAt: string, updatedAt: string }> {
  const response = await request(app.getHttpServer())
    .post(`/projects/${projectId}/tags`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createTagDto)
    .expect(201);

  expect(response.body).toMatchObject(createTagDto);

  return response.body;
}
