import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { CreateProjectDto } from "../../dto/create-project.dto";

export const mockProjectModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  exists: jest.fn()
}

export const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}

export const mockProjectAccessControlService = {
  createOwnerAccessControl: jest.fn()
}

export const mockProjectAccessControlModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

export const projectMock = {
  _id: '1',
  title: 'Projeto Teste',
  description: 'Descrição do projeto teste',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const createProjectDtoMock = {
  title: 'Projeto Teste',
  description: 'Descrição do projeto teste',
}

export const updateProjectDtoMock = {
  title: 'Projeto Teste Atualizado',
  description: 'Descrição do projeto teste atualizado',
}

export async function createTestProject(
  app: INestApplication, 
  createProjectDto: CreateProjectDto,
  jwtToken: string,
): Promise<typeof projectMock> {
  const response = await request(app.getHttpServer())
    .post('/projects')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createProjectDto)
    .expect(201);

  expect(response.body).toMatchObject({
    title: createProjectDto.title,
    description: createProjectDto.description,
  });

  return response.body;
}