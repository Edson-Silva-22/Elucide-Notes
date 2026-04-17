import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule, getConnectionToken } from "@nestjs/mongoose";
import { TestingModule, Test } from "@nestjs/testing";
import { Connection } from "mongoose";
import { AppModule } from "../../../../app.module";
import { createTestProject } from "../../../projects/tests/mocks/projects.mocks";
import { createProjectDtoMock } from "../../../projects/tests/mocks/projects.mocks";
import { createTestUser } from "../../../users/tests/mocks/users.mocks";
import { createUserDtoMock } from "../../..//users/tests/mocks/users.mocks";
import request from 'supertest';
import { createTaskMockDto, createTestTask, updateTaskMockDto } from "../mock/tasks.mock";

describe('Tasks Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI_TESTS || 'mongodb://localhost:27017/', {
          dbName: process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests'
        }),
        AppModule
      ]
    }).compile();

    app = moduleTest.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    connection = moduleTest.get<Connection>(getConnectionToken())
    await app.init();

    jwtService = moduleTest.get(JwtService);
  })

  beforeEach(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('projects').deleteMany({});
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('users').deleteMany({});
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('tasks').deleteMany({});
  })

  afterAll(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('POST /projects/:id/tasks', () => {
    it('should create a new task', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)
      
      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      expect(createTaskResponse).toMatchObject(createTaskMockDto)
    })

    it('should create a new task with code auto-incremented', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)
      
      const createTaskResponse1 = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)
      const createTaskResponse2 = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      expect(createTaskResponse1.code).toBe(1);
      expect(createTaskResponse2.code).toBe(2);
    })

    it('should not create a new task with invalid data', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const invalidTaskDto = { };

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(invalidTaskDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          "O título deve ser uma string",
          "O título deve ser informado",
        ])
      })
    })

    it('should not create a new task without authentication', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .send(createTaskMockDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      })
    })

    it('should not create a new task without access to the project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const anotherUserResponse = await createTestUser(app, {
        ...createUserDtoMock,
        name: 'Another User',
        email: 'another@email.com'
      }, connection)

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(createTaskMockDto)
        .expect(403);
      
      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden'
      })
    })
  })

  describe('GET /projects/:id/tasks', () => {
    it('should get all tasks from a project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const anotherTaskDto = { ...createTaskMockDto, title: 'Another Task' };

      await createTestTask(app, anotherTaskDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject(createTaskMockDto);
      expect(response.body.data[1]).toMatchObject(anotherTaskDto);
    })

    it('should get all tasks from a project with pagination and keyword search', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const anotherTaskDto = { ...createTaskMockDto, title: 'Another Task' };

      await createTestTask(app, anotherTaskDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks?keyword=Test&page=1&limit=10`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: 1,
        data: [createTaskMockDto],
        page: 1,
        limit: 10
      });
    })

    it('should not get tasks without authentication', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      })
    })

    it('should not get tasks without access to the project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const anotherUserResponse = await createTestUser(app, {
        ...createUserDtoMock,
        name: 'Another User',
        email: 'another@email.com'
      }, connection)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden'
      })
    })
  })

  describe('GET /projects/:id/tasks/:taskId', () => {
    it('should get a task by id', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)
      
      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)
      
      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject(createTaskMockDto);
    })
    
    it('should not get a task without authentication', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      })
    })

    it('should not get a task without access to the project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const anotherUserResponse = await createTestUser(app, {
        ...createUserDtoMock,
        name: 'Another User',
        email: 'another@email.com'
      }, connection)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden'
      })
    })

    it('should not get a task that does not exist', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found'
      })
    })
  })

  describe('PUT /projects/:id/tasks/:taskId', () => {
    it('should update a task by id', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(updateTaskMockDto)
        .expect(200);

      expect(response.body).toMatchObject(updateTaskMockDto);
    })

    it('should not update a task without authentication', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .send(updateTaskMockDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      })
    })

    it('should not update a task without access to the project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const anotherUserResponse = await createTestUser(app, {
        ...createUserDtoMock,
        name: 'Another User',
        email: 'another@email.com'
      }, connection)

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(updateTaskMockDto)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden'
      })
    })

    it('should not update a task that does not exist', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(updateTaskMockDto)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found'
      })
    })

    it('should not update a task with invalid data', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const invalidUpdateDto = { title: 123 };

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          "O título deve ser uma string"
        ])
      })
    })
  })

  describe('DELETE /projects/:id/tasks/:taskId', () => {
    it('should delete a task by id', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toEqual({});
    })

    it('should not delete a task without authentication', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const response = await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      })
    })

    it('should not delete a task without access to the project', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const createTaskResponse = await createTestTask(app, createTaskMockDto, createUserResponse.token, createProjectResponse._id)

      const anotherUserResponse = await createTestUser(app, {
        ...createUserDtoMock,
        name: 'Another User',
        email: 'another@email.com'
      }, connection)

      const response = await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden'
      })
    })

    it('should not delete a task that does not exist', async () => {
      const createUserResponse = await createTestUser(app, createUserDtoMock, connection)
      const createProjectResponse = await createTestProject(app, createProjectDtoMock, createUserResponse.token)

      const response = await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found'
      })
    })
  })
})